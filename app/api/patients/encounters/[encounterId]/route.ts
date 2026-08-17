import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ encounterId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { encounterId } = await context.params;
    const id = Number(encounterId);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid encounter ID" }, { status: 400 });
    }

    const body = await request.json();
    const encounter = await prisma.clinicalEncounter.findUnique({ where: { id } });
    if (!encounter) {
      return NextResponse.json({ error: "Clinical encounter not found" }, { status: 404 });
    }

    const updated = await prisma.clinicalEncounter.update({
      where: { id },
      data: {
        chiefComplaint: body.chiefComplaint !== undefined ? body.chiefComplaint || null : undefined,
        diagnosis: body.diagnosis !== undefined ? body.diagnosis || null : undefined,
        clinicalNotes: body.clinicalNotes !== undefined ? body.clinicalNotes || null : undefined,
        treatmentPlan: body.treatmentPlan !== undefined ? body.treatmentPlan || null : undefined,
        followUpDate: body.followUpDate !== undefined
          ? body.followUpDate ? new Date(body.followUpDate) : null
          : undefined,
        assessmentData: body.assessmentData !== undefined
          ? body.assessmentData ? JSON.stringify(body.assessmentData) : null
          : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Clinical encounter update error:", error);
    return NextResponse.json({ error: "Failed to update clinical encounter" }, { status: 500 });
  }
}
