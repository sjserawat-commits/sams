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

    const visit = await prisma.oPDVisit.create({
      data: {
        patientId,
        tokenNumber,
        visitType: body.visitType === "FOLLOW_UP" ? "FOLLOW_UP" : "NEW",
        department: body.department || null,
        doctorId: body.doctorId ? Number(body.doctorId) : null,
        status: "WAITING",
      },
    });

    return NextResponse.json(visit, { status: 201 });
  } catch (error) {
    console.error("OPD creation error:", error);
    return NextResponse.json(
      { error: "Unable to create OPD visit." },
      { status: 500 }
    );
  }
}
