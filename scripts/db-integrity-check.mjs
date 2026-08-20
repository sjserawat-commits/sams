import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const dbPath = path.resolve(process.cwd(), "dev.db");
if (!fs.existsSync(dbPath)) {
  console.error(`SQLite database not found: ${dbPath}`);
  process.exit(1);
}

const db = new Database(dbPath, { readonly: true });
try {
  const integrity = db.pragma("integrity_check", { simple: true });
  if (integrity !== "ok") {
    console.error(`SQLite integrity check failed: ${integrity}`);
    process.exit(1);
  }

  const foreignKeys = db.prepare("PRAGMA foreign_key_check").all();
  if (foreignKeys.length) {
    console.error(`SQLite foreign-key check failed: ${foreignKeys.length} violation(s)`);
    for (const row of foreignKeys.slice(0, 20)) console.error(row);
    process.exit(1);
  }

  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
  console.log(`SQLite integrity: OK (${tables.length} application tables)`);
} finally {
  db.close();
}
