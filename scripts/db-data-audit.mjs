import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const dbPath = path.resolve(process.cwd(), "dev.db");
if (!fs.existsSync(dbPath)) {
  console.error(`SQLite database not found: ${dbPath}`);
  process.exit(1);
}

const db = new Database(dbPath, { readonly: true });
const checks = [];
const add = (name, sql) => {
  const rows = db.prepare(sql).all();
  checks.push({ name, count: rows.length, rows });
};

try {
  add("Appointments with missing patients", `SELECT a.id, a.patientId FROM Appointment a LEFT JOIN Patient p ON p.id=a.patientId WHERE a.patientId IS NOT NULL AND p.id IS NULL`);
  add("OPD visits with missing patients", `SELECT o.id, o.patientId FROM OPDVisit o LEFT JOIN Patient p ON p.id=o.patientId WHERE p.id IS NULL`);
  add("Clinical encounters with missing patients", `SELECT c.id, c.patientId FROM ClinicalEncounter c LEFT JOIN Patient p ON p.id=c.patientId WHERE c.patientId IS NOT NULL AND p.id IS NULL`);
  add("Billing records with missing patients", `SELECT b.id, b.patientId FROM BillingRecord b LEFT JOIN Patient p ON p.id=b.patientId WHERE p.id IS NULL`);
  add("Investigation orders with missing patients", `SELECT i.id, i.patientId FROM InvestigationOrder i LEFT JOIN Patient p ON p.id=i.patientId WHERE i.patientId IS NOT NULL AND p.id IS NULL`);
  add("Duplicate patient phones", `SELECT mobile, COUNT(*) AS count FROM Patient WHERE mobile IS NOT NULL AND TRIM(mobile) <> '' GROUP BY mobile HAVING COUNT(*) > 1`);
  add("Duplicate patient emails", `SELECT LOWER(email) AS email, COUNT(*) AS count FROM Patient WHERE email IS NOT NULL AND TRIM(email) <> '' GROUP BY LOWER(email) HAVING COUNT(*) > 1`);

  const blocking = checks.filter((x) => x.count > 0 && !x.name.startsWith("Duplicate patient"));
  console.log(JSON.stringify(checks.map(({ name, count }) => ({ name, count })), null, 2));

  if (blocking.length) {
    console.error("Blocking data-integrity findings detected. No data was modified.");
    process.exit(2);
  }
  console.log("Data integrity audit: no blocking orphan records found. No data was modified.");
} finally {
  db.close();
}
