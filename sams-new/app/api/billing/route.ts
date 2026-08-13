import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const round = (value: number) => Math.round(value * 100) / 100;

export async function GET(request: Request) {
  try {
    const visitId = Number(new URL(request.url).searchParams.get("visitId"));
    if (!Number.isInteger(visitId) || visitId <= 0) {
      return NextResponse.json({ error: "A valid OPD visit ID is required." }, { status: 400 });
    }

    const visit = await prisma.oPDVisit.findUnique({
      where: { id: visitId },
      include: {
        patient: true,
        clinicalEncounter: true,
        investigationOrders: { orderBy: { createdAt: "asc" } },
        prescriptions: { where: { status: "ACTIVE" }, orderBy: { createdAt: "asc" } },
      },
    });

    if (!visit) return NextResponse.json({ error: "OPD visit not found." }, { status: 404 });

    const investigationTotal = round(visit.investigationOrders.reduce((sum, item) => sum + item.netAmount, 0));
    const pharmacyTotal = round(visit.prescriptions.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));

    return NextResponse.json({
      visit: {
        id: visit.id,
        tokenNumber: visit.tokenNumber,
        visitType: visit.visitType,
        status: visit.status,
        department: visit.department,
        createdAt: visit.createdAt,
      },
      patient: {
        id: visit.patient.id,
        patientId: visit.patient.patientId,
        name: `${visit.patient.firstName} ${visit.patient.lastName}`.trim(),
        phone: visit.patient.phone,
      },
      encounter: visit.clinicalEncounter
        ? { id: visit.clinicalEncounter.id, treatmentPlan: visit.clinicalEncounter.treatmentPlan, followUpDate: visit.clinicalEncounter.followUpDate }
        : null,
      investigations: visit.investigationOrders.map((item) => ({ id: item.id, name: item.investigation, amount: round(item.netAmount), paymentStatus: item.paymentStatus })),
      prescriptions: visit.prescriptions.map((item) => ({ id: item.id, name: item.medicineName, quantity: item.quantity, unitPrice: item.unitPrice, amount: round(item.quantity * item.unitPrice), billingStatus: item.billingStatus })),
      totals: { investigationTotal, pharmacyTotal },
    });
  } catch (error) {
    console.error("Billing lookup error:", error);
    return NextResponse.json({ error: "Unable to load billing information." }, { status: 500 });
  }
}
