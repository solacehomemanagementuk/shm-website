import { createHmac } from "node:crypto";
import { config, pool } from "./config.js";

const bucketHash = (scope, value) => createHmac("sha256", config.rateLimitKey)
  .update(`${scope}:${value}`)
  .digest("hex");

let callsSinceCleanup = 0;

export const consumeRateLimit = async ({ scope, value, limit, windowMs }) => {
  const key = bucketHash(scope, value);
  const result = await pool.query(
    `INSERT INTO shm_auth_rate_limits (bucket_key, window_started_at, hit_count, expires_at)
     VALUES ($1, now(), 1, now() + ($2 * interval '1 millisecond'))
     ON CONFLICT (bucket_key) DO UPDATE SET
       window_started_at = CASE
         WHEN shm_auth_rate_limits.window_started_at <= now() - ($2 * interval '1 millisecond') THEN now()
         ELSE shm_auth_rate_limits.window_started_at
       END,
       hit_count = CASE
         WHEN shm_auth_rate_limits.window_started_at <= now() - ($2 * interval '1 millisecond') THEN 1
         ELSE shm_auth_rate_limits.hit_count + 1
       END,
       expires_at = CASE
         WHEN shm_auth_rate_limits.window_started_at <= now() - ($2 * interval '1 millisecond')
           THEN now() + ($2 * interval '1 millisecond')
         ELSE shm_auth_rate_limits.expires_at
       END
     RETURNING hit_count, window_started_at`,
    [key, windowMs]
  );

  const row = result.rows[0];
  if (row.hit_count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((new Date(row.window_started_at).getTime() + windowMs - Date.now()) / 1000))
    };
  }

  callsSinceCleanup += 1;
  if (callsSinceCleanup >= 100) {
    callsSinceCleanup = 0;
    await pool.query("DELETE FROM shm_auth_rate_limits WHERE expires_at < now()");
  }
  return { allowed: true, retryAfterSeconds: 0 };
};

export const applyRateLimit = (limits) => async (req, res, next) => {
  try {
    const result = await consumeRateLimit({
      ...limits,
      value: limits.value ? limits.value(req) : req.get("x-shm-client-ip") || req.ip
    });
    if (!result.allowed) {
      res.set("Retry-After", String(result.retryAfterSeconds));
      res.status(429).json({ error: "Too many requests. Please wait before trying again." });
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
};
