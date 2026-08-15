import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Returns the UTC boundaries for the current calendar day in India.
 * The app is used in India, so OPD token reset must follow IST midnight,
 * not the server's local timezone (which may be UTC in deployment).
 */
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

  // Midnight IST expressed as UTC.
  const start = new Date(`${year}-${month}-${day}T00:00:00+05:30`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return { start, end };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const patientId = Number(body.patientId);
    const departmentId = body.department ? Number(body.department) : null;

    if (!Number.isInteger(patientId)) {
      return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    if (!Number.isInteger(departmentId)) {
      return NextResponse.json(
        { error: "Please select a valid department." },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: { id: true, name: true },
    });

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    /**
     * Department-wise daily token:
     *   PM&R:          1, 2, 3...
     *   Orthopaedics:  1, 2, 3...
     *   Neurology:     1, 2, 3...
     *
     * Each department starts again from #1 at 00:00 IST every day.
     * Historical/global Visit IDs are NOT affected.
     */
    const { start, end } = getIndiaDayBounds();

    const lastVisit = await prisma.oPDVisit.findFirst({
      where: {
        departmentId,
        createdAt: {
          gte: start,
          lt: end,
        },
      },
      orderBy: [
        { tokenNumber: "desc" },
        { id: "desc" },
      ],
      select: { tokenNumber: true },
    });

    const tokenNumber = (lastVisit?.tokenNumber ?? 0) + 1;

    const rawVisitType = String(body.visitType || "NEW")
      .trim()
      .toUpperCase()
      .replace(/[-\s]+/g, "_");
    const visitType = rawVisitType === "FOLLOW_UP" ? "FOLLOW_UP" : "NEW";

    const visit = await prisma.oPDVisit.create({
      data: {
        patientId,
        tokenNumber,
        visitType,
        departmentId,
        doctorId: body.doctorId ? Number(body.doctorId) : null,
        status: "WAITING",
      },
    });

    return NextResponse.json(
      {
        ...visit,
        department: department.name,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("OPD creation error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
