import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// prisma.config.ts is at the repository root and its file:./dev.db
// therefore resolves to the repository-root dev.db. Keep CLI, seed and
// Next.js runtime on exactly the same SQLite database.
const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
