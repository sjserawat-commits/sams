import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function clinicalOnlyNotes(value: unknown) {
  return String(value || "")
    .replace(/\s*\(₹\s*[\d,]+(?:\.\d+)?\)/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim() || null;
}

function investigationNames(value: unknown) {
  const text = String(value || "");
  const match = text.match(/Investigations:\s*([^\n]+)/i);
  if (!match) return [];
  return match[1]
    .split(",")
    .map((item) => item.replace(/\s*\(₹\s*[\d,]+(?:\.\d+)?\)/g, "").trim())
    .filter(Boolean);
}

async function dispatchInvestigationOrders(opdVisitId: number, names: string[]) {
  let created = 0;
  for (const name of names) {
    const master = await prisma.investigationMaster.findFirst({
      where: { active: true, OR: [{ name }, { shortName: name }, { code: name }] },
    });
    if (!master) continue;
    const existing = await prisma.investigationOrder.findFirst({ where: { opdVisitId, investigationId: master.id } });
    if (existing) continue;
    await prisma.investigationOrder.create({
      data: {
        opdVisitId,
        investigationId: master.id,
        investigation: master.name,
        price: master.rate,
        netAmount: master.rate,
        paymentStatus: "UNPAID",
        status: "ORDERED",
      },
    });
    created += 1;
  }
  return created;
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

    const investigationsSentToLab = opdVisitId ? await dispatchInvestigationOrders(opdVisitId, investigationNames(body.clinicalNotes)) : 0;
    if (opdVisitId) await prisma.oPDVisit.update({ where: { id: opdVisitId }, data: { status: "IN_CONSULTATION" } });

    return NextResponse.json({ ...encounter, investigationsSentToLab }, { status: 200 });
  } catch (error) {
    console.error("Clinical encounter error:", error);
    return NextResponse.json({ error: "Failed to save clinical encounter" }, { status: 500 });
  }
}
