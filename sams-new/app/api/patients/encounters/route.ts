import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const patientId = Number(body.patientId);
    const opdVisitId = body.opdVisitId ? Number(body.opdVisitId) : null;

    if (!Number.isInteger(patientId)) {
      return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    if (opdVisitId !== null) {
      if (!Number.isInteger(opdVisitId)) {
        return NextResponse.json({ error: "Invalid OPD visit ID" }, { status: 400 });
      }

      const opdVisit = await prisma.oPDVisit.findUnique({ where: { id: opdVisitId } });
      if (!opdVisit || opdVisit.patientId !== patientId) {
        return NextResponse.json({ error: "OPD visit not found for this patient" }, { status: 404 });
      }

      const existingEncounter = await prisma.clinicalEncounter.findUnique({ where: { opdVisitId } });
      if (existingEncounter) {
        return NextResponse.json(existingEncounter, { status: 200 });
      }
    }

    const encounter = await prisma.clinicalEncounter.create({
      data: {
        patientId,
        opdVisitId,
        chiefComplaint: body.chiefComplaint || null,
        diagnosis: body.diagnosis || null,
        clinicalNotes: body.clinicalNotes || null,
        treatmentPlan: body.treatmentPlan || null,
        followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
      },
    });

    return NextResponse.json(encounter, { status: 201 });
  } catch (error) {
    console.error("Clinical encounter error:", error);
    return NextResponse.json(
      { error: "Failed to create clinical encounter" },
      { status: 500 }
    );
  }
}
