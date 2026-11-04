import { fileURLToPath } from "node:url";
import path from "node:path";
import { timingSafeEqual } from "node:crypto";
import express from "express";
import helmet from "helmet";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { config, pool } from "./lib/config.js";
import authRouter from "./routes/auth.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const dashboardPath = path.join(root, "dashboard-coming-soon.html");
const app = express();
const PgSessionStore = connectPgSimple(session);

const requireTrustedProxy = (req, res, next) => {
  if (!config.proxySharedSecret) {
    next();
    return;
  }
  const supplied = req.get("x-shm-proxy-secret") || "";
  const expected = config.proxySharedSecret;
  const valid = Buffer.byteLength(supplied) === Buffer.byteLength(expected)
    && timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
  if (!valid) {
    res.status(403).json({ error: "This service only accepts authentication requests from its configured site proxy." });
    return;
  }
  next();
};

if (config.trustProxy > 0) {
  app.set("trust proxy", config.trustProxy);
}

app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      imgSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      upgradeInsecureRequests: config.production ? [] : null
    }
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

app.use("/api", (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
app.use(express.json({ limit: "16kb", strict: true }));
app.use("/api", requireTrustedProxy);
app.use("/account", requireTrustedProxy);
app.use(session({
  name: config.production ? "__Host-shm.sid" : "shm.sid",
  store: new PgSessionStore({
    pool,
    tableName: "shm_sessions",
    createTableIfMissing: true,
    pruneSessionInterval: 15 * 60
  }),
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: config.production,
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60 * 1000
  }
}));

app.use("/api/auth", authRouter);

const loginPathForRole = (role) => {
  if (role === "staff") return "/shm-staff-login.html";
  return role === "landlord" ? "/landlord-login.html" : "/tenant-login.html";
};

app.get("/account/:kind", async (req, res, next) => {
  const expectedRole = req.params.kind === "staff" ? "staff" : req.params.kind;
  if (!["staff", "landlord", "tenant"].includes(expectedRole)) {
    res.status(404).send("Page not found.");
    return;
  }
  if (!req.session.userId || !req.session.role) {
    res.redirect(303, loginPathForRole(expectedRole));
    return;
  }
  try {
    const result = await pool.query(
      "SELECT role, staff_role FROM shm_users WHERE id = $1 AND email_verified_at IS NOT NULL",
      [req.session.userId]
    );
    const user = result.rows[0];
    if (!user || user.role !== req.session.role) {
      await new Promise((resolve, reject) => {
        req.session.destroy((error) => error ? reject(error) : resolve());
      });
      res.clearCookie(config.production ? "__Host-shm.sid" : "shm.sid", { path: "/" });
      res.redirect(303, loginPathForRole(expectedRole));
      return;
    }
    if (user.role !== expectedRole || (expectedRole === "staff" && user.staff_role !== "admin")) {
      res.redirect(303, `/account/${user.role === "staff" ? "staff" : user.role}`);
      return;
    }
    res.set("Cache-Control", "no-store");
    res.sendFile(dashboardPath, (error) => {
      if (error) next(error);
    });
  } catch (error) {
    next(error);
  }
});

app.get("/healthz", async (_req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (error) {
    next(error);
  }
});

const publicHtmlFiles = new Set([
  "index.html", "overview.html", "about.html", "why-choose.html", "services.html",
  "browse-properties.html", "list-your-property.html", "faq.html", "contact.html",
  "register-account.html", "landlord-registration.html", "tenant-registration.html", "shm-staff-registration.html",
  "landlord-login.html", "tenant-login.html", "shm-staff-login.html", "shm-portal.html"
]);
const publicRootFiles = new Set(["style.css", "script.js", "auth.js"]);
const assetsRoot = path.resolve(root, "assets");

app.use((req, res, next) => {
  if (!["GET", "HEAD"].includes(req.method)) {
    next();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, config.appOrigin).pathname);
  } catch {
    res.status(400).send("Invalid URL.");
    return;
  }
  if (pathname === "/") pathname = "/index.html";

  let filePath;
  const fileName = pathname.slice(1);
  if (publicHtmlFiles.has(fileName) || publicRootFiles.has(fileName)) {
    filePath = path.resolve(root, fileName);
  } else if (/^\/assets\/[A-Za-z0-9._-]+\.(?:png|jpe?g|webp|svg)$/i.test(pathname)) {
    filePath = path.resolve(root, pathname.slice(1));
    if (!filePath.startsWith(`${assetsRoot}${path.sep}`)) {
      next();
      return;
    }
  } else {
    next();
    return;
  }

  res.sendFile(filePath, { dotfiles: "deny" }, (error) => {
    if (error) next(error);
  });
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API endpoint not found." });
});
app.use((_req, res) => {
  res.status(404).send("Page not found.");
});
app.use((error, _req, res, _next) => {
  console.error("Request failed:", error.code || error.name || "server error");
  if (res.headersSent) return;
  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500
    ? error.status
    : 500;
  res.status(status).json({ error: status === 413 ? "Request is too large." : "An unexpected server error occurred." });
});

export const startServer = async () => {
  await pool.query("SELECT 1");
  const schema = await pool.query("SELECT to_regclass('public.shm_users') AS users_table");
  if (!schema.rows[0].users_table) {
    throw new Error("Database schema is missing. Run `npm run db:migrate` before starting the server.");
  }
  return app.listen(config.port, () => {
    console.log(`Solace Home Management server listening on port ${config.port}.`);
  });
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startServer().catch(async (error) => {
    console.error(error.message || "Server startup failed.");
    await pool.end();
    process.exitCode = 1;
  });
}
