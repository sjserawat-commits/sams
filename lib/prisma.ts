import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// This must match prisma.config.ts so the CLI (db push) and the
// Next.js runtime always use the same SQLite database in Codespaces.
const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
