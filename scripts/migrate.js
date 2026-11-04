import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { pool } from "../server/lib/config.js";

const schemaPath = fileURLToPath(new URL("../database/schema.sql", import.meta.url));

try {
  const schema = await readFile(schemaPath, "utf8");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(schema);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
  console.log("SHM database schema is up to date.");
} catch (error) {
  console.error("Database migration failed:", error.code || error.message || "unknown error");
  process.exitCode = 1;
} finally {
  await pool.end();
}
