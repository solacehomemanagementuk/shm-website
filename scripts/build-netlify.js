import { cp, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "dist");
const publicFiles = [
  "index.html",
  "overview.html",
  "about.html",
  "why-choose.html",
  "services.html",
  "browse-properties.html",
  "list-your-property.html",
  "faq.html",
  "contact.html",
  "register-account.html",
  "landlord-registration.html",
  "tenant-registration.html",
  "shm-staff-registration.html",
  "landlord-login.html",
  "tenant-login.html",
  "shm-staff-login.html",
  "shm-portal.html",
  "style.css",
  "script.js",
  "auth.js"
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of publicFiles) {
  await cp(path.join(root, file), path.join(output, file));
}
await cp(path.join(root, "assets"), path.join(output, "assets"), { recursive: true });
await cp(path.join(root, "shm-portal"), path.join(output, "shm-portal"), { recursive: true });
