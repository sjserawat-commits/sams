import fs from "node:fs";
import path from "node:path";

function resolveDatabasePath() {
  const url = process.env.DATABASE_URL;
  if (url?.startsWith("file:")) {
    const raw = url.slice(5);
    return path.resolve(process.cwd(), raw);
  }
  return path.resolve(process.cwd(), "prisma/dev.db");
}

const source = resolveDatabasePath();
if (!fs.existsSync(source)) {
  throw new Error(`SQLite database not found at ${source}. Set DATABASE_URL=file:... if the database is stored elsewhere.`);
}

const backupDir = path.resolve(process.cwd(), "prisma/backups");
fs.mkdirSync(backupDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const destination = path.join(backupDir, `sams-sqlite-${stamp}.db`);
fs.copyFileSync(source, destination);

const sourceSize = fs.statSync(source).size;
const backupSize = fs.statSync(destination).size;
if (sourceSize !== backupSize) {
  fs.rmSync(destination, { force: true });
  throw new Error(`Backup verification failed: source=${sourceSize} bytes, backup=${backupSize} bytes`);
}

console.log(`SAMS SQLite backup created: ${destination}`);
console.log(`Verified size: ${backupSize} bytes`);
