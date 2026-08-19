import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const opdVisitId = Number(body?.opdVisitId);
    const investigationName = String(body?.investigationName ?? "").trim();
    const investigationId = Number(body?.investigationId || 0);
    const reason = String(body?.reason ?? "Patient declined").trim() || "Patient declined";

    if (!Number.isInteger(opdVisitId) || opdVisitId <= 0 || !investigationName) {
      return NextResponse.json({ error: "Visit and investigation are required." }, { status: 400 });
    }

    const visit = await prisma.oPDVisit.findUnique({
      where: { id: opdVisitId },
      include: { clinicalEncounter: { select: { clinicalNotes: true } } },
    });
    if (!visit) return NextResponse.json({ error: "Visit not found." }, { status: 404 });

    const notes = String(visit.clinicalEncounter?.clinicalNotes || "");
    const marker = "Investigations:";
    const index = notes.indexOf(marker);
    const advisedLine = index >= 0 ? notes.slice(index + marker.length).split("\n")[0] : "";
    const advised = advisedLine.split(",").map((x) => x.trim()).filter(Boolean);
    if (!advised.some((x) => x.toLowerCase() === investigationName.toLowerCase())) {
      return NextResponse.json({ error: "This investigation was not advised in the selected consultation." }, { status: 400 });
    }

    const existing = await prisma.investigationOrder.findFirst({
      where: {
        opdVisitId,
        investigation: { equals: investigationName },
        status: { not: "CANCELLED" },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      if (["PAID", "SAMPLE_COLLECTED", "PROCESSING", "COMPLETED", "VERIFIED", "PUBLISHED"].includes(existing.status) || existing.paymentStatus === "PAID") {
        return NextResponse.json({ error: "This investigation has already progressed and cannot be marked refused." }, { status: 409 });
      }
      const updated = await prisma.investigationOrder.update({
        where: { id: existing.id },
        data: { status: "REFUSED", paymentStatus: "REFUSED", paymentMethod: reason },
      });
      return NextResponse.json(updated);
    }

    let master = null;
    if (investigationId > 0) {
      master = await prisma.investigationMaster.findUnique({ where: { id: investigationId } });
    }
    if (!master) {
      master = await prisma.investigationMaster.findFirst({ where: { name: investigationName, active: true } });
    }

    const price = Number(master?.rate || 0);
    const created = await prisma.investigationOrder.create({
      data: {
        opdVisitId,
        investigationId: master?.id ?? null,
        investigation: investigationName,
        price,
        netAmount: price,
        paymentStatus: "REFUSED",
        status: "REFUSED",
        specimen: master?.specimen ?? null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Investigation refusal failed:", error);
    return NextResponse.json({ error: "Unable to record patient refusal." }, { status: 500 });
  }
}
