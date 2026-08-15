import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawDepartmentId = searchParams.get("departmentId");
    const departmentId = rawDepartmentId ? Number(rawDepartmentId) : null;

    if (rawDepartmentId && !Number.isInteger(departmentId)) {
      return NextResponse.json({ error: "Invalid department ID." }, { status: 400 });
    }

    if (!departmentId) {
      return NextResponse.json({ error: "Department desk is required." }, { status: 400 });
    }

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: { id: true, name: true, code: true },
    });

    if (!department) {
      return NextResponse.json({ error: "Department not found." }, { status: 404 });
    }

    const visits = await prisma.oPDVisit.findMany({
      where: {
        departmentId,
        status: {
          in: ["WAITING", "IN_CONSULTATION"],
        },
      },
      include: {
        patient: true,
      },
      orderBy: [
        { tokenNumber: "asc" },
        { id: "asc" },
      ],
    });

    return NextResponse.json({
      department,
      visits,
    });
  } catch (error) {
    console.error("OPD queue error:", error);
    return NextResponse.json(
      { error: "Unable to load OPD queue." },
      { status: 500 }
    );
  }
}
