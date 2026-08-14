import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const patientId = Number(body.patientId);

    if (!Number.isInteger(patientId)) {
      return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const lastVisit = await prisma.oPDVisit.findFirst({
      orderBy: { tokenNumber: "desc" },
    });

    const tokenNumber = (lastVisit?.tokenNumber ?? 0) + 1;
    const rawVisitType = String(body.visitType || "NEW").trim().toUpperCase().replace(/[-\s]+/g, "_");
    const visitType = rawVisitType === "FOLLOW_UP" ? "FOLLOW_UP" : "NEW";

    const visit = await prisma.oPDVisit.create({
      data: {
        patientId,
        tokenNumber,
        visitType,
        departmentId: body.department ? Number(body.department) : null,
        doctorId: body.doctorId ? Number(body.doctorId) : null,
        status: "WAITING",
      },
    });

    return NextResponse.json(visit, { status: 201 });
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
