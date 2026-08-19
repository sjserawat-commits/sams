import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getIndiaDayBounds(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const value = (type: string) => parts.find((p) => p.type === type)?.value;
  const year = value("year"), month = value("month"), day = value("day");
  if (!year || !month || !day) throw new Error("Unable to determine India calendar date.");
  const start = new Date(`${year}-${month}-${day}T00:00:00+05:30`);
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

export async function GET() {
  try {
    const { start, end } = getIndiaDayBounds();
    const visits = await prisma.oPDVisit.findMany({
      where: { createdAt: { gte: start, lt: end }, status: { in: ["WAITING", "IN_CONSULTATION", "COMPLETED"] } },
      include: {
        patient: true,
        departmentMaster: { select: { id: true, name: true, code: true } },
        doctor: { select: { id: true, name: true } },
        appointment: { select: { appointmentNo: true, appointmentTime: true, source: true } },
        clinicalEncounter: { select: { id: true, clinicalNotes: true } },
        investigationOrders: {
          where: { status: { not: "CANCELLED" } },
          select: { id: true, investigationId: true, investigation: true, status: true, paymentStatus: true },
        },
      },
      orderBy: [{ tokenNumber: "asc" }, { id: "asc" }],
    });

    return NextResponse.json(visits.map((visit) => ({
      id: visit.id,
      tokenNumber: visit.tokenNumber,
      visitType: visit.visitType,
      status: visit.status,
      createdAt: visit.createdAt,
      patient: { id: visit.patient.id, patientId: visit.patient.patientId, firstName: visit.patient.firstName, lastName: visit.patient.lastName, phone: visit.patient.phone, gender: visit.patient.gender },
      department: visit.departmentMaster,
      doctor: visit.doctor,
      appointment: visit.appointment,
      consultation: visit.clinicalEncounter ? { id: visit.clinicalEncounter.id, hasNotes: Boolean(visit.clinicalEncounter.clinicalNotes?.trim()) } : null,
      existingInvestigations: visit.investigationOrders,
    })));
  } catch (error) {
    console.error("Investigation consultation list failed:", error);
    return NextResponse.json({ error: "Unable to load today's Consultation / Visit list." }, { status: 500 });
  }
}
