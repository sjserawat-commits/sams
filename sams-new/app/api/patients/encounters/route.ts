import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientIdParam = searchParams.get("patientId");

    const encounters = await prisma.clinicalEncounter.findMany({
      where: patientIdParam ? { patientId: Number(patientIdParam) } : undefined,
      orderBy: { encounterDate: "desc" },
    });

    return NextResponse.json(encounters);
  } catch (error) {
    console.error("Encounter fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch encounters." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const patientId = Number(body.patientId);

    if (!Number.isInteger(patientId) || patientId <= 0) {
      return NextResponse.json({ error: "A valid patient is required." }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }

    const followUpDate = body.followUpDate ? new Date(body.followUpDate) : null;
    if (followUpDate && Number.isNaN(followUpDate.getTime())) {
      return NextResponse.json({ error: "Follow-up date is invalid." }, { status: 400 });
    }

    const encounter = await prisma.clinicalEncounter.create({
      data: {
        patientId,
        chiefComplaint: String(body.chiefComplaint || "").trim() || null,
        diagnosis: String(body.diagnosis || "").trim() || null,
        clinicalNotes: String(body.clinicalNotes || "").trim() || null,
        treatmentPlan: String(body.treatmentPlan || "").trim() || null,
        followUpDate,
      },
    });

    return NextResponse.json(encounter, { status: 201 });
  } catch (error) {
    console.error("Clinical encounter save error:", error);
    return NextResponse.json({ error: "Failed to save encounter." }, { status: 500 });
  }
}
