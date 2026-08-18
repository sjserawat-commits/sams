import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma 7 config resolves file:./dev.db from prisma.config.ts to
// prisma/dev.db. The Next.js runtime must use the exact same database,
// otherwise seeded Investigation Master rows are invisible to API routes.
const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db",
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
