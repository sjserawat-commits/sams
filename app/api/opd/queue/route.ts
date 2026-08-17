import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getIndiaDayBounds(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Unable to determine India calendar date.");
  }

  const start = new Date(`${year}-${month}-${day}T00:00:00+05:30`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

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

    const { start, end } = getIndiaDayBounds();

    const visits = await prisma.oPDVisit.findMany({
      where: {
        departmentId,
        createdAt: { gte: start, lt: end },
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
