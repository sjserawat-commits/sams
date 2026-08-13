import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      where: { active: true },
      orderBy: { id: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
      },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error("Departments API error:", error);

    return NextResponse.json(
      { error: "Unable to load departments." },
      { status: 500 }
    );
  }
}
