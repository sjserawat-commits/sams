import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
      },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error("GET /api/departments failed:", error);

    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
