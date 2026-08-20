import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

function resolveDatabasePath() {
  const url = process.env.DATABASE_URL;
  if (url?.startsWith("file:")) return path.resolve(process.cwd(), url.slice(5));
  return path.resolve(process.cwd(), "prisma/dev.db");
}

const databasePath = resolveDatabasePath();
if (!fs.existsSync(databasePath)) {
  throw new Error(`SQLite database not found at ${databasePath}`);
}

const db = new Database(databasePath, { readonly: true });

const expectedTables = [
  "Patient",
  "Appointment",
  "ClinicalEncounter",
  "Department",
  "Doctor",
  "OPDVisit",
  "InvestigationMaster",
  "InvestigationMasterChangeRequest",
  "InvestigationOrder",
  "Prescription",
  "BillingRecord",
  "BillingLineItem",
];

const rows = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all() as { name: string }[];
const tables = new Set(rows.map((row) => row.name));
const missing = expectedTables.filter((table) => !tables.has(table));

if (missing.length) {
  db.close();
  throw new Error(`Missing expected tables: ${missing.join(", ")}`);
}

for (const table of expectedTables) {
  const result = db.prepare(`SELECT COUNT(*) as count FROM "${table}"`).get() as { count: number };
  console.log(`${table}: ${result.count}`);
}

db.close();
console.log("SAMS SQLite integrity check passed: all expected tables are present.");
