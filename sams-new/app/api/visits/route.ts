import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const patientId = Number(body.patientId);
    const speciality = String(body.speciality || "").trim();

    if (!Number.isInteger(patientId) || patientId <= 0) {
      return NextResponse.json({ error: "A valid patient is required." }, { status: 400 });
    }
    if (!speciality) {
      return NextResponse.json({ error: "Speciality is required." }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }

    const opdVisitId = body.opdVisitId ? Number(body.opdVisitId) : null;

    const visit = await prisma.clinicalEncounter.create({
      data: {
        ...(opdVisitId ? { opdVisitId } : {}), patientId, speciality },
      include: { patient: true },
    });

    return NextResponse.json(visit, { status: 201 });
  } catch (error) {
    console.error("Visit creation error:", error);
    return NextResponse.json({ error: "Unable to create visit." }, { status: 500 });
  }
}
