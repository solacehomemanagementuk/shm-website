import { randomBytes, randomUUID } from "node:crypto";
import argon2 from "argon2";
import { Router } from "express";
import { config, pool, sendOtpEmail } from "../lib/config.js";
import {
  createOtp,
  createVerificationToken,
  hashOtp,
  hashVerificationToken,
  OTP_EXPIRY_MS,
  RESEND_COOLDOWN_MS,
  safeTokenMatch,
  verifyOtp
} from "../lib/otp.js";
import { applyRateLimit } from "../lib/rate-limit.js";
import { normalizeEmail, normalizeUsername, validateRegistration } from "../lib/validation.js";

const router = Router();
const otpPattern = /^[0-9]{6}$/;
const allowedRegistrationRoles = new Set(["landlord", "tenant", "staff"]);
const allowedLoginRoles = new Set(["landlord", "tenant", "staff"]);
const dummyPasswordHash = await argon2.hash(randomBytes(32).toString("hex"), {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1
});
const jsonContent = (req, res, next) => {
  if (!req.is("application/json")) {
    res.status(415).json({ error: "Send this request using JSON." });
    return;
  }
  next();
};

const requireSameOrigin = (req, res, next) => {
  if (req.get("origin") !== config.appOrigin) {
    res.status(403).json({ error: "This request could not be verified. Reload the page and try again." });
    return;
  }
  next();
};

const sendUnavailableEmail = (res) => res.status(503).json({
  error: "Email verification is not configured. Please contact Solace Home Management."
});

const sendVerificationMail = async (email, code) => {
  try {
    await sendOtpEmail(email, code);
    return true;
  } catch (error) {
    console.error("Email delivery failed:", error.code || error.name || "SMTP error");
    return false;
  }
};

const acquireIdentityLocks = async (client, email, username) => {
  const keys = [`email:${email}`, `username:${username}`].sort();
  for (const key of keys) {
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [key]);
  }
};

const registerIpLimit = applyRateLimit({ scope: "register-ip", limit: 5, windowMs: 60 * 60 * 1000 });
const registerEmailLimit = applyRateLimit({
  scope: "register-email",
  value: (req) => typeof req.body?.email === "string" ? normalizeEmail(req.body.email) : "",
  limit: 5,
  windowMs: 60 * 60 * 1000
});
const verifyIpLimit = applyRateLimit({ scope: "verify-ip", limit: 20, windowMs: 15 * 60 * 1000 });
const verifyChallengeLimit = applyRateLimit({
  scope: "verify-challenge",
  value: (req) => String(req.body?.challengeId || ""),
  limit: 10,
  windowMs: 15 * 60 * 1000
});
const resendIpLimit = applyRateLimit({ scope: "resend-ip", limit: 10, windowMs: 60 * 60 * 1000 });
const resendChallengeLimit = applyRateLimit({
  scope: "resend-challenge",
  value: (req) => String(req.body?.challengeId || ""),
  limit: 5,
  windowMs: 60 * 60 * 1000
});
const loginIpLimit = applyRateLimit({ scope: "login-ip", limit: 10, windowMs: 15 * 60 * 1000 });

router.post(
  "/register/:role",
  jsonContent,
  requireSameOrigin,
  registerIpLimit,
  registerEmailLimit,
  async (req, res) => {
    if (!allowedRegistrationRoles.has(req.params.role)) {
      res.status(404).json({ error: "Registration page not found." });
      return;
    }
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER
      || !process.env.SMTP_PASSWORD || !process.env.SMTP_FROM) {
      sendUnavailableEmail(res);
      return;
    }

    const { errors, data } = validateRegistration(req.body || {});
    if (req.body?.confirmPassword !== req.body?.password) {
      errors.confirmPassword = "Your passwords do not match.";
    }
    if (Object.keys(errors).length) {
      res.status(400).json({ error: "Please correct the highlighted fields.", fields: errors });
      return;
    }
    if (req.params.role === "staff") {
      const staffAccount = await pool.query("SELECT 1 FROM shm_users WHERE role = 'staff' LIMIT 1");
      if (staffAccount.rowCount) {
        res.status(409).json({ error: "SHM Staff Registration is closed because the first staff account has already been created." });
        return;
      }
    }

    const challengeId = randomUUID();
    const verificationToken = createVerificationToken();
    const otp = createOtp();
    const [passwordHash, otpHash] = await Promise.all([
      argon2.hash(data.password, { type: argon2.argon2id, memoryCost: 19_456, timeCost: 2, parallelism: 1 }),
      hashOtp(otp)
    ]);
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await acquireIdentityLocks(client, data.email, data.username);
      await client.query("DELETE FROM shm_pending_registrations WHERE registration_expires_at < now()");
      const duplicate = await client.query(
        "SELECT 1 FROM shm_users WHERE email = $1 OR username = $2 LIMIT 1",
        [data.email, data.username]
      );
      if (duplicate.rowCount) {
        await client.query("ROLLBACK");
        res.status(409).json({ error: "An account with that email address or username already exists." });
        return;
      }

      const pending = await client.query(
        "SELECT 1 FROM shm_pending_registrations WHERE email = $1 OR username = $2 LIMIT 1",
        [data.email, data.username]
      );
      if (pending.rowCount) {
        await client.query("ROLLBACK");
        res.status(409).json({ error: "A registration using that email address or username is already awaiting verification." });
        return;
      }

      await client.query(
        `INSERT INTO shm_pending_registrations
          (id, verification_token_hash, full_name, phone, email, username, password_hash, role, otp_hash,
           otp_expires_at, registration_expires_at, resend_after)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,
           now() + ($10 * interval '1 millisecond'), now() + interval '1 hour',
           now() + ($11 * interval '1 millisecond'))`,
        [
          challengeId,
          hashVerificationToken(verificationToken),
          data.fullName,
          data.phone,
          data.email,
          data.username,
          passwordHash,
          req.params.role,
          otpHash,
          OTP_EXPIRY_MS,
          RESEND_COOLDOWN_MS
        ]
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === "23505") {
        res.status(409).json({ error: "An account or registration with that email address or username already exists." });
        return;
      }
      throw error;
    } finally {
      client.release();
    }

    if (!await sendVerificationMail(data.email, otp)) {
      await pool.query("DELETE FROM shm_pending_registrations WHERE id = $1", [challengeId]);
      res.status(503).json({ error: "We could not deliver your verification email. Please try again later." });
      return;
    }

    res.status(202).json({
      challengeId,
      challengeToken: verificationToken,
      email: data.email,
      expiresInSeconds: OTP_EXPIRY_MS / 1000,
      resendAfterSeconds: RESEND_COOLDOWN_MS / 1000
    });
  }
);

router.post("/verify-email", jsonContent, requireSameOrigin, verifyIpLimit, verifyChallengeLimit, async (req, res) => {
  const { challengeId, challengeToken, otp } = req.body || {};
  if (typeof challengeId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(challengeId)
    || typeof challengeToken !== "string" || typeof otp !== "string" || !otpPattern.test(otp)) {
    res.status(400).json({ error: "Enter the six-digit verification code from your email." });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      "SELECT * FROM shm_pending_registrations WHERE id = $1 FOR UPDATE",
      [challengeId]
    );
    const pending = result.rows[0];
    if (!pending || !safeTokenMatch(challengeToken, pending.verification_token_hash)) {
      await client.query("ROLLBACK");
      res.status(400).json({ error: "This verification request is invalid or has expired. Please start registration again." });
      return;
    }
    if (new Date(pending.registration_expires_at).getTime() <= Date.now()) {
      await client.query("DELETE FROM shm_pending_registrations WHERE id = $1", [challengeId]);
      await client.query("COMMIT");
      res.status(410).json({ error: "This verification request has expired. Please start registration again." });
      return;
    }
    if (new Date(pending.otp_expires_at).getTime() <= Date.now()) {
      await client.query("ROLLBACK");
      res.status(410).json({ error: "This verification code has expired. Request a new code to continue." });
      return;
    }
    if (pending.otp_attempts >= 5) {
      await client.query("ROLLBACK");
      res.status(429).json({ error: "Too many incorrect codes. Request a new code or start registration again." });
      return;
    }
    if (!await verifyOtp(otp, pending.otp_hash)) {
      await client.query(
        "UPDATE shm_pending_registrations SET otp_attempts = otp_attempts + 1 WHERE id = $1",
        [challengeId]
      );
      await client.query("COMMIT");
      res.status(400).json({ error: `That code is not correct. ${4 - pending.otp_attempts} attempts remaining.` });
      return;
    }

    let staffRole = null;
    if (pending.role === "staff") {
      await client.query("SELECT pg_advisory_xact_lock(108001, 1)");
      const staffAccount = await client.query("SELECT 1 FROM shm_users WHERE role = 'staff' LIMIT 1");
      if (staffAccount.rowCount) {
        await client.query("DELETE FROM shm_pending_registrations WHERE id = $1", [challengeId]);
        await client.query("COMMIT");
        res.status(409).json({ error: "Another staff account was verified first. SHM Staff Registration is now closed." });
        return;
      }
      staffRole = "admin";
    }

    await client.query(
      `INSERT INTO shm_users
        (id, full_name, phone, email, username, password_hash, role, staff_role, email_verified_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())`,
      [
        randomUUID(),
        pending.full_name,
        pending.phone,
        pending.email,
        pending.username,
        pending.password_hash,
        pending.role,
        staffRole
      ]
    );
    await client.query("DELETE FROM shm_pending_registrations WHERE id = $1", [challengeId]);
    await client.query("COMMIT");
    res.status(201).json({
      message: "Your SHM account has been successfully created and your email address has been verified.",
      loginUrl: pending.role === "staff"
        ? "/shm-staff-login.html"
        : pending.role === "landlord" ? "/landlord-login.html" : "/tenant-login.html"
    });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code === "23505") {
      res.status(409).json({ error: "An account with that email address or username already exists. Please contact us if you need help." });
      return;
    }
    throw error;
  } finally {
    client.release();
  }
});

router.post("/resend-otp", jsonContent, requireSameOrigin, resendIpLimit, resendChallengeLimit, async (req, res) => {
  const { challengeId, challengeToken } = req.body || {};
  if (typeof challengeId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(challengeId)
    || typeof challengeToken !== "string") {
    res.status(400).json({ error: "This verification request is invalid. Please start registration again." });
    return;
  }
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER
    || !process.env.SMTP_PASSWORD || !process.env.SMTP_FROM) {
    sendUnavailableEmail(res);
    return;
  }

  const otp = createOtp();
  const otpHash = await hashOtp(otp);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      "SELECT * FROM shm_pending_registrations WHERE id = $1 FOR UPDATE",
      [challengeId]
    );
    const pending = result.rows[0];
    if (!pending || !safeTokenMatch(challengeToken, pending.verification_token_hash)) {
      await client.query("ROLLBACK");
      res.status(400).json({ error: "This verification request is invalid or has expired. Please start registration again." });
      return;
    }
    if (new Date(pending.registration_expires_at).getTime() <= Date.now()) {
      await client.query("DELETE FROM shm_pending_registrations WHERE id = $1", [challengeId]);
      await client.query("COMMIT");
      res.status(410).json({ error: "This verification request has expired. Please start registration again." });
      return;
    }
    const resendDelay = Math.max(0, new Date(pending.resend_after).getTime() - Date.now());
    if (resendDelay > 0) {
      await client.query("ROLLBACK");
      res.set("Retry-After", String(Math.ceil(resendDelay / 1000)));
      res.status(429).json({ error: "Please wait before requesting another code.", retryAfterSeconds: Math.ceil(resendDelay / 1000) });
      return;
    }

    await client.query(
      `UPDATE shm_pending_registrations
       SET otp_hash = $2, otp_attempts = 0,
           otp_expires_at = now() + ($3 * interval '1 millisecond'),
           resend_after = now() + ($4 * interval '1 millisecond')
       WHERE id = $1`,
      [challengeId, otpHash, OTP_EXPIRY_MS, RESEND_COOLDOWN_MS]
    );
    if (!await sendVerificationMail(pending.email, otp)) {
      await client.query("ROLLBACK");
      res.status(503).json({ error: "We could not deliver another verification email. Your previous code remains valid." });
      return;
    }
    await client.query("COMMIT");
    res.status(200).json({ resendAfterSeconds: RESEND_COOLDOWN_MS / 1000, expiresInSeconds: OTP_EXPIRY_MS / 1000 });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

router.post(
  "/login/:role",
  jsonContent,
  requireSameOrigin,
  loginIpLimit,
  async (req, res) => {
    if (!allowedLoginRoles.has(req.params.role)) {
      res.status(404).json({ error: "Login page not found." });
      return;
    }
    const { identifier, password } = req.body || {};
    if (typeof identifier !== "string" || !identifier.trim() || identifier.length > 254
      || typeof password !== "string" || !password || password.length > 128) {
      res.status(400).json({ error: "Enter your username or email address and password." });
      return;
    }
    const accountIdentifier = identifier.trim().toLowerCase();
    const result = await pool.query(
      `SELECT id, username, email, password_hash, role, staff_role
       FROM shm_users
       WHERE (username = $1 OR email = $1) AND email_verified_at IS NOT NULL
       LIMIT 1`,
      [accountIdentifier]
    );
    const user = result.rows[0];
    let validPassword = false;
    if (user) {
      validPassword = await argon2.verify(user.password_hash, password);
    } else {
      await argon2.verify(dummyPasswordHash, password);
    }
    if (!user || !validPassword || user.role !== req.params.role) {
      res.status(401).json({ error: "The username/email or password is incorrect for this login." });
      return;
    }

    await new Promise((resolve, reject) => {
      req.session.regenerate((error) => error ? reject(error) : resolve());
    });
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.staffRole = user.staff_role;
    await new Promise((resolve, reject) => {
      req.session.save((error) => error ? reject(error) : resolve());
    });
    const dashboard = user.role === "staff" ? "staff" : user.role;
    res.json({ redirectTo: `/account/${dashboard}` });
  }
);

router.get("/session", async (req, res) => {
  if (!req.session.userId || !req.session.role) {
    res.status(401).json({ authenticated: false });
    return;
  }
  const user = await pool.query(
    "SELECT role, staff_role FROM shm_users WHERE id = $1 AND email_verified_at IS NOT NULL",
    [req.session.userId]
  );
  if (!user.rowCount || user.rows[0].role !== req.session.role) {
    req.session.destroy(() => {});
    res.clearCookie(config.production ? "__Host-shm.sid" : "shm.sid", { path: "/" });
    res.status(401).json({ authenticated: false });
    return;
  }
  res.json({
    authenticated: true,
    role: user.rows[0].role,
    staffRole: user.rows[0].staff_role
  });
});

router.post("/logout", jsonContent, requireSameOrigin, (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      next(error);
      return;
    }
    res.clearCookie(config.production ? "__Host-shm.sid" : "shm.sid", { path: "/" });
    res.status(204).end();
  });
});

export default router;
