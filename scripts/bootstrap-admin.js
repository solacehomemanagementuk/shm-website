import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline";
import argon2 from "argon2";
import { pool, sendOtpEmail } from "../server/lib/config.js";
import { createOtp, hashOtp, OTP_EXPIRY_MS, verifyOtp } from "../server/lib/otp.js";
import { normalizeEmail, normalizeUsername } from "../server/lib/validation.js";

const ask = (prompt) => new Promise((resolve, reject) => {
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  readline.question(prompt, (answer) => {
    readline.close();
    resolve(answer.trim());
  });
  readline.on("SIGINT", () => {
    readline.close();
    reject(new Error("Admin setup cancelled."));
  });
});

const askSecret = (prompt) => new Promise((resolve, reject) => {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
    reject(new Error("Admin setup must be run in an interactive terminal so the password is not echoed."));
    return;
  }
  let value = "";
  const finish = (error) => {
    process.stdin.removeListener("data", onData);
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stdout.write("\n");
    if (error) reject(error);
    else resolve(value);
  };
  const onData = (chunk) => {
    for (const character of chunk.toString("utf8")) {
      if (character === "\u0003") {
        finish(new Error("Admin setup cancelled."));
        return;
      }
      if (character === "\r" || character === "\n") {
        finish();
        return;
      }
      if (character === "\u007f" || character === "\b") {
        value = value.slice(0, -1);
        continue;
      }
      if (character >= " " && character !== "\u007f") {
        value += character;
      }
    }
  };
  process.stdout.write(prompt);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on("data", onData);
});

const main = async () => {
  if (!process.stdin.isTTY) {
    throw new Error("Run `npm run auth:bootstrap-admin` in an interactive terminal.");
  }

  const fullName = await ask("First administrator full name: ");
  const email = normalizeEmail(await ask("First administrator email: "));
  const phone = await ask("First administrator phone number: ");
  const username = normalizeUsername(await ask("First administrator username: "));
  const password = await askSecret("First administrator password (12-128 characters): ");
  const confirmPassword = await askSecret("Confirm password: ");
  if (!fullName || fullName.length > 120 || email.length > 254
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || !/^\+?[0-9 ()-]{7,24}$/.test(phone) || phone.replace(/\D/g, "").length < 7
    || phone.replace(/\D/g, "").length > 15
    || !/^[a-z0-9._-]{3,32}$/.test(username)
    || password.length < 12 || password.length > 128 || password !== confirmPassword) {
    throw new Error("Invalid name, email, username or password. No administrator was created.");
  }

  const alreadyInitialized = await pool.query("SELECT 1 FROM shm_users WHERE role = 'staff' LIMIT 1");
  if (alreadyInitialized.rowCount) {
    throw new Error("A staff account already exists. The first-administrator setup can only be used once.");
  }
  const duplicate = await pool.query(
    "SELECT 1 FROM shm_users WHERE email = $1 OR username = $2 LIMIT 1",
    [email, username]
  );
  if (duplicate.rowCount) {
    throw new Error("An account already uses that email or username.");
  }

  const code = createOtp();
  const otpHash = await hashOtp(code);
  const expiresAt = Date.now() + OTP_EXPIRY_MS;
  await sendOtpEmail(email, code);
  console.log(`A verification code was sent to ${email}. It expires in 10 minutes.`);

  let verified = false;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    if (Date.now() >= expiresAt) break;
    const entered = await ask("Enter the six-digit email verification code: ");
    if (Date.now() >= expiresAt) break;
    if (await verifyOtp(entered, otpHash)) {
      verified = true;
      break;
    }
    console.log("The code is incorrect.");
  }
  if (!verified) {
    throw new Error("Email verification failed. No administrator was created.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(108001, 1)");
    const existing = await client.query("SELECT 1 FROM shm_users WHERE role = 'staff' LIMIT 1");
    const identity = await client.query(
      "SELECT 1 FROM shm_users WHERE email = $1 OR username = $2 LIMIT 1",
      [email, username]
    );
    if (existing.rowCount) {
      throw new Error("A staff account was created while setup was in progress.");
    }
    if (identity.rowCount) {
      throw new Error("An account already uses that email or username.");
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19_456,
      timeCost: 2,
      parallelism: 1
    });
    await client.query(
      `INSERT INTO shm_users
        (id, full_name, phone, email, username, password_hash, role, staff_role, email_verified_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'staff', 'admin', now())`,
      [randomUUID(), fullName, phone, email, username, passwordHash]
    );
    await client.query("COMMIT");
    console.log("The first SHM administrator has been created. Sign in at /shm-staff-login.html.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

try {
  await main();
} catch (error) {
  console.error(error.message || "Administrator setup failed.");
  process.exitCode = 1;
} finally {
  await pool.end();
}
