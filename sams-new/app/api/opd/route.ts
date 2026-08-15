import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
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
      return NextResponse.json({ error: "Please select a valid department." }, { status: 400 });
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

    // OPD tokens are department-wise and restart from 1 each day.
    // Example: PM&R can have #1 while Orthopaedics also has #1 on the same day.
    const today = startOfToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const lastVisit = await prisma.oPDVisit.findFirst({
      where: {
        departmentId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { tokenNumber: "desc" },
      select: { tokenNumber: true },
    });

    const tokenNumber = (lastVisit?.tokenNumber ?? 0) + 1;
    const rawVisitType = String(body.visitType || "NEW").trim().toUpperCase().replace(/[-\s]+/g, "_");
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
