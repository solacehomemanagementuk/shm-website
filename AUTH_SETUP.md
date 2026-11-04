# SHM authentication setup

The website uses a Node.js/Express API and PostgreSQL for persistent accounts and sessions. Landlord, tenant and SHM staff accounts are created only after a six-digit email OTP is verified. Passwords and OTPs are hashed; OTPs expire after ten minutes, with resend cooldowns and rate limits enforced by the API.

The first successfully verified SHM Staff account becomes Admin. Database locking and a unique staff-account index ensure only one first Admin can be created, whether registration or the trusted bootstrap command wins the race. Users cannot choose a staff or Admin role in their form data. Staff registration closes after that account exists.

## Local development

Requirements: Node.js 20+, npm, PostgreSQL 14+, and a Gmail account with two-step verification and an app password.

1. Install dependencies from the project root:

   ```powershell
   npm install
   ```

2. Copy `.env.example` to `.env`. Set `DATABASE_URL` to your local PostgreSQL database and replace `SESSION_SECRET` with at least 32 random bytes. Generate a secret with:

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
   ```

3. Configure Gmail SMTP in `.env`: use `SMTP_HOST=smtp.gmail.com`, port `587`, `SMTP_SECURE=false`, your Gmail address for `SMTP_USER` and `SMTP_FROM`, and a Google app password for `SMTP_PASSWORD`. Never use your regular Gmail password or commit `.env`.

4. Create the local database, then apply its schema:

   ```powershell
   npm run db:migrate
   ```

5. Start the website and API together:

   ```powershell
   npm start
   ```

   Open `http://localhost:3000/register-account.html`. Use the Express server rather than a static-file preview such as VS Code Live Server so website and API share an origin. `/healthz` checks the PostgreSQL connection.

## Netlify website and hosted API

Netlify static hosting does not run this Express server. The included `netlify.toml` builds an allowlisted static copy of the public website and proxies `/api/*` and `/account/*` through a Netlify Function to the separately hosted API. This keeps browser requests same-origin for secure session cookies. The function forwards only the existing auth/account routes and requires a shared secret; the backend rejects unauthenticated proxy requests in production.

The included `render.yaml` describes a Node web service and a persistent managed PostgreSQL database. To deploy:

1. Create a Render Blueprint from this repository. Provide the public Netlify site origin for `APP_ORIGIN` and the Gmail SMTP settings when prompted. Render generates `SESSION_SECRET` and `PROXY_SHARED_SECRET`; keep both private.
2. The Render pre-deploy command runs the idempotent database migration before starting the API. Confirm the migration and `/healthz` success in the Render deployment logs.
3. In Netlify site environment variables, set `SHM_BACKEND_URL` to the Render service's HTTPS origin and set `PROXY_SHARED_SECRET` to the exact generated value on Render. Set these as server-side function variables, not client/build-exposed variables.
4. Confirm Render's `APP_ORIGIN` exactly matches the deployed Netlify origin, including any custom domain. Redeploy the Netlify site so its function receives the variables.
5. Check `https://<render-service>/healthz` for database readiness. Then use the deployed Register Account page to create a test account, receive and verify its OTP, sign in, and confirm the account remains available after a service restart.

The Render blueprint uses a persistent PostgreSQL plan, not ephemeral local storage. Its internal database URL is supplied to the API service. `TRUST_PROXY` trusts Render's HTTPS reverse proxy; the Netlify Function passes the validated Netlify client IP in a separate header after authenticating with the shared secret. If you change backend hosts or proxy hops, set `TRUST_PROXY` to the exact trusted hop count. The backend requires HTTPS and all SMTP settings in production.

For Gmail delivery in both environments, use a Google app password with two-step verification enabled. Gmail can reject SMTP authentication if the account, app password, sender address or provider security policy is incorrect; the API reports email-delivery failures and does not leave a registration challenge as a successful response.

## First Admin alternative

The first Admin can also be provisioned by running `npm run auth:bootstrap-admin` in an interactive terminal on a trusted host. This command verifies email and uses the same database lock as public staff registration. Whichever process creates the first verified Staff account first wins; public staff registration is then closed.

## Operational security

- Keep `.env` and all database, Gmail, session and proxy secrets out of Git and Netlify's public build. `.env.production.example` is a reference only; production values belong in Render/Netlify secret settings.
- The PostgreSQL session store creates its `shm_sessions` table at startup. The runtime database user must be allowed to create that table, or an operator must provision the equivalent table first.
- Back up PostgreSQL and test restoration. Keep database certificate verification enabled if connecting with SSL.
- Do not expose the API's secret-bearing configuration to the browser. The frontend calls same-origin `/api` endpoints; the Netlify Function holds the backend URL and shared proxy secret.
- Registration never succeeds when PostgreSQL or Gmail SMTP is unavailable. The page displays the backend's explicit error instead of creating a browser-only account.
