import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rawId = decodeURIComponent(id).trim();
    const numericId = Number(rawId);

    const patient = await prisma.patient.findFirst({
      where: Number.isInteger(numericId) && numericId > 0 ? { id: numericId } : { patientId: rawId },
      select: {
        id: true, patientId: true, firstName: true, lastName: true,
        dateOfBirth: true, gender: true, phone: true, createdAt: true,
        encounters: {
          orderBy: { encounterDate: "desc" },
          select: { id: true, encounterDate: true, speciality: true, chiefComplaint: true, diagnosis: true, clinicalNotes: true, treatmentPlan: true, followUpDate: true },
        },
        opdVisits: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true, tokenNumber: true, visitType: true, status: true, createdAt: true,
            departmentMaster: { select: { name: true } }, doctor: { select: { name: true } },
            investigationOrders: {
              orderBy: { createdAt: "desc" },
              select: { id: true, investigation: true, price: true, netAmount: true, paymentStatus: true, status: true, reportText: true, reportedAt: true, createdAt: true },
            },
          },
        },
        billingRecords: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true, billNumber: true, receiptNumber: true, subtotal: true, discount: true, netAmount: true, paymentStatus: true, paymentMethod: true, paidAmount: true, balanceAmount: true, paidAt: true, createdAt: true,
            lineItems: { select: { id: true, serviceType: true, description: true, quantity: true, unitPrice: true, amount: true } },
          },
        },
      },
    });

    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    return NextResponse.json(patient, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Patient portal lookup failed:", error);
    return NextResponse.json({ error: "Unable to load patient portal data" }, { status: 500 });
  }
}
