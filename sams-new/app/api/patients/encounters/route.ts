import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function clinicalOnlyNotes(value: unknown) {
  return String(value || "").replace(/\s*\(₹\s*[\d,]+(?:\.\d+)?\)/g, "").replace(/\n{3,}/g, "\n\n").trim() || null;
}

export async function GET(request: NextRequest) {
  try {
    const visitId = Number(new URL(request.url).searchParams.get("opdVisitId"));
    if (!Number.isInteger(visitId) || visitId <= 0) return NextResponse.json({ error: "A valid OPD visit ID is required." }, { status: 400 });
    const encounter = await prisma.clinicalEncounter.findUnique({ where: { opdVisitId: visitId } });
    return NextResponse.json(encounter);
  } catch (error) {
    console.error("Consultation reopen GET failed:", error);
    return NextResponse.json({ error: "Unable to load saved consultation." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const patientId = Number(body.patientId);
    const opdVisitId = body.opdVisitId ? Number(body.opdVisitId) : null;
    if (!Number.isInteger(patientId)) return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    if (opdVisitId !== null) {
      if (!Number.isInteger(opdVisitId)) return NextResponse.json({ error: "Invalid OPD visit ID" }, { status: 400 });
      const opdVisit = await prisma.oPDVisit.findUnique({ where: { id: opdVisitId } });
      if (!opdVisit || opdVisit.patientId !== patientId) return NextResponse.json({ error: "OPD visit not found for this patient" }, { status: 404 });
    }
    const data = {
      patientId,
      opdVisitId,
      chiefComplaint: body.chiefComplaint || null,
      diagnosis: body.diagnosis || null,
      clinicalNotes: clinicalOnlyNotes(body.clinicalNotes),
      treatmentPlan: body.treatmentPlan || null,
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
    };
    const encounter = opdVisitId
      ? await prisma.clinicalEncounter.upsert({ where: { opdVisitId }, create: data, update: data })
      : await prisma.clinicalEncounter.create({ data });
    if (opdVisitId) await prisma.oPDVisit.update({ where: { id: opdVisitId }, data: { status: "IN_CONSULTATION" } });
    return NextResponse.json(encounter, { status: 200 });
  } catch (error) {
    console.error("Clinical encounter error:", error);
    return NextResponse.json({ error: "Failed to save clinical encounter" }, { status: 500 });
  }
}
