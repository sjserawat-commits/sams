import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Keep Prisma CLI and the Next.js Prisma adapter on the same
    // Codespace-local SQLite database.
    url: "file:./dev.db",
  },
});
