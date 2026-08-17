import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function ensureDepartmentTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Department" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "name" TEXT NOT NULL,
      "code" TEXT NOT NULL,
      "active" BOOLEAN NOT NULL DEFAULT 1,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Department_name_key" ON "Department"("name");`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Department_code_key" ON "Department"("code");`);
}

export async function GET() {
  try {
    await ensureDepartmentTable();

    const departments = await prisma.department.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
      },
    });

    return NextResponse.json(departments, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("GET /api/departments failed:", error);

    return NextResponse.json(
      {
        error: "Unable to load the department master.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
