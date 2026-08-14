import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");

    const doctors = await prisma.doctor.findMany({
      where: {
        active: true,
        ...(departmentId
          ? { departmentId: Number(departmentId) }
          : {}),
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        qualification: true,
        departmentId: true,
      },
    });

    return NextResponse.json(doctors);
  } catch (error) {
    console.error("GET /api/doctors failed:", error);

    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
