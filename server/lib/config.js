import "dotenv/config";
import nodemailer from "nodemailer";
import pg from "pg";

const { Pool } = pg;
const production = process.env.NODE_ENV === "production";
const required = ["DATABASE_URL", "SESSION_SECRET", "APP_ORIGIN"];
if (production) {
  required.push("PROXY_SHARED_SECRET");
}
const missing = required.filter((name) => !process.env[name]);

if (missing.length) {
  throw new Error(`Missing required server environment variables: ${missing.join(", ")}`);
}

if (Buffer.byteLength(process.env.SESSION_SECRET, "utf8") < 32) {
  throw new Error("SESSION_SECRET must contain at least 32 bytes.");
}
if (production && Buffer.byteLength(process.env.PROXY_SHARED_SECRET, "utf8") < 32) {
  throw new Error("PROXY_SHARED_SECRET must contain at least 32 bytes.");
}

const appUrl = new URL(process.env.APP_ORIGIN);
if (!["http:", "https:"].includes(appUrl.protocol)) {
  throw new Error("APP_ORIGIN must use HTTP or HTTPS.");
}
if (production && appUrl.protocol !== "https:") {
  throw new Error("APP_ORIGIN must use HTTPS in production.");
}
if (appUrl.pathname !== "/" || appUrl.search || appUrl.hash || appUrl.username || appUrl.password) {
  throw new Error("APP_ORIGIN must contain only the public origin (scheme, hostname and optional port).");
}

const port = Number.parseInt(process.env.PORT || "3000", 10);
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}
const trustProxy = Number.parseInt(process.env.TRUST_PROXY || "0", 10);
if (!Number.isInteger(trustProxy) || trustProxy < 0) {
  throw new Error("TRUST_PROXY must be a non-negative integer.");
}

const smtpReady = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM"]
  .every((name) => Boolean(process.env[name]));
if (production && !smtpReady) {
  throw new Error("Production requires SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD and SMTP_FROM.");
}

export const config = Object.freeze({
  appOrigin: appUrl.origin,
  port,
  production,
  trustProxy,
  sessionSecret: process.env.SESSION_SECRET,
  proxySharedSecret: process.env.PROXY_SHARED_SECRET || "",
  rateLimitKey: process.env.SESSION_SECRET,
  databaseUrl: process.env.DATABASE_URL
});

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: process.env.DATABASE_SSL === "true"
    ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false" }
    : undefined,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000
});

export const mailer = smtpReady
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_SECURE === "true",
      requireTLS: process.env.SMTP_SECURE !== "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      },
      tls: { minVersion: "TLSv1.2" }
    })
  : null;

export const mailFrom = process.env.SMTP_FROM || "";

export const sendOtpEmail = async (email, code) => {
  if (!mailer) {
    throw new Error("SMTP is not configured.");
  }
  await mailer.sendMail({
    from: mailFrom,
    to: email,
    subject: "Your Solace Home Management verification code",
    text: `Your SHM email verification code is ${code}. It expires in 10 minutes. If you did not request this code, you can ignore this email.`,
    html: `<p>Your SHM email verification code is <strong>${code}</strong>.</p><p>It expires in 10 minutes. If you did not request this code, you can ignore this email.</p>`
  });
};
