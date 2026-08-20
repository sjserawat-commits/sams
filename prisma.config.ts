import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Keep local development on dev.db, while CI/staging can safely
    // point Prisma CLI at an isolated database through DATABASE_URL.
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
});
