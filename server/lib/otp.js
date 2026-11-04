import {
  createHash,
  randomBytes,
  randomInt,
  timingSafeEqual,
  scrypt as callbackScrypt
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(callbackScrypt);
const OTP_TTL_MS = 10 * 60 * 1000;

export const OTP_EXPIRY_MS = OTP_TTL_MS;
export const RESEND_COOLDOWN_MS = 60 * 1000;
export const createOtp = () => String(randomInt(100_000, 1_000_000));
export const createVerificationToken = () => randomBytes(32).toString("base64url");
export const hashVerificationToken = (token) => createHash("sha256").update(token).digest("hex");

export const hashOtp = async (code) => {
  const salt = randomBytes(16);
  const derived = await scrypt(code, salt, 64, { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return `${salt.toString("hex")}.${derived.toString("hex")}`;
};

export const verifyOtp = async (code, storedHash) => {
  const [saltHex, hashHex] = storedHash.split(".");
  if (!/^[a-f0-9]{32}$/.test(saltHex || "") || !/^[a-f0-9]{128}$/.test(hashHex || "")) {
    return false;
  }
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(code, salt, expected.length, { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return timingSafeEqual(actual, expected);
};

export const safeTokenMatch = (token, tokenHash) => {
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(tokenHash || "")) {
    return false;
  }
  const supplied = Buffer.from(hashVerificationToken(token), "hex");
  const expected = Buffer.from(tokenHash, "hex");
  return timingSafeEqual(supplied, expected);
};
