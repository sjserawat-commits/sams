import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getIndiaDayBounds(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type: string) => parts.find((p) => p.type === type)?.value;
  const year = value("year");
  const month = value("month");
  const day = value("day");
  if (!year || !month || !day) throw new Error("Unable to determine India calendar date.");
  const start = new Date(`${year}-${month}-${day}T00:00:00+05:30`);
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

function getAdvisedInvestigationNames(notes: string | null | undefined) {
  const text = String(notes || "");
  const marker = "Investigations:";
  const index = text.indexOf(marker);
  if (index < 0) return [];
  const line = text.slice(index + marker.length).split("\n")[0] || "";
  return Array.from(
    new Set(
      line
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
    )
  );
}

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export async function GET() {
  try {
    const { start, end } = getIndiaDayBounds();

    // IMPORTANT: This queue is driven by the consultation record itself.
    // A patient must have an actual "Investigations:" entry saved from the
    // consultation room. Manually created investigation orders must NOT make
    // the patient appear in the Consultation / Visit queue.
    const visits = await prisma.oPDVisit.findMany({
      where: {
        createdAt: { gte: start, lt: end },
        status: { in: ["WAITING", "IN_CONSULTATION", "COMPLETED"] },
        clinicalEncounter: {
          is: {
            clinicalNotes: { contains: "Investigations:" },
          },
        },
      },
      include: {
        patient: true,
        departmentMaster: { select: { id: true, name: true, code: true } },
        doctor: { select: { id: true, name: true } },
        appointment: { select: { appointmentNo: true, appointmentTime: true, source: true } },
        clinicalEncounter: { select: { id: true, clinicalNotes: true } },
        investigationOrders: {
          where: {
            status: { not: "CANCELLED" },
          },
          select: {
            id: true,
            investigationId: true,
            investigation: true,
            status: true,
            paymentStatus: true,
          },
        },
      },
      orderBy: [{ tokenNumber: "asc" }, { id: "asc" }],
    });

    const result = visits
      .map((visit) => {
        const advisedInvestigations = getAdvisedInvestigationNames(
          visit.clinicalEncounter?.clinicalNotes
        );

        // An empty marker is not an advised investigation and must not put the
        // patient into this queue.
        if (!advisedInvestigations.length) return null;

        const advisedSet = new Set(advisedInvestigations.map(normalize));
        const activeOrders = visit.investigationOrders.filter(
          (order) => advisedSet.has(normalize(order.investigation))
        );

        // Keep the Visit in the queue while at least one advised investigation
        // is still awaiting billing/payment. Once all advised investigations
        // have a paid order, the patient naturally leaves this queue.
        const pendingAdvisedInvestigations = advisedInvestigations.filter((name) => {
          const orders = activeOrders.filter((order) => normalize(order.investigation) === normalize(name));
          return orders.length === 0 || orders.some((order) => order.paymentStatus !== "PAID");
        });

        if (!pendingAdvisedInvestigations.length) return null;

        return {
          id: visit.id,
          tokenNumber: visit.tokenNumber,
          visitType: visit.visitType,
          status: visit.status,
          createdAt: visit.createdAt,
          patient: {
            id: visit.patient.id,
            patientId: visit.patient.patientId,
            firstName: visit.patient.firstName,
            lastName: visit.patient.lastName,
            phone: visit.patient.phone,
            gender: visit.patient.gender,
          },
          department: visit.departmentMaster,
          doctor: visit.doctor,
          appointment: visit.appointment,
          consultation: visit.clinicalEncounter
            ? {
                id: visit.clinicalEncounter.id,
                hasNotes: Boolean(visit.clinicalEncounter.clinicalNotes?.trim()),
              }
            : null,
          advisedInvestigations: pendingAdvisedInvestigations,
          existingInvestigations: activeOrders,
        };
      })
      .filter(Boolean);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Investigation consultation list failed:", error);
    return NextResponse.json(
      { error: "Unable to load today's Consultation / Visit list." },
      { status: 500 }
    );
  }
}
