import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const round = (value: number) => Math.round(value * 100) / 100;
const billNumber = () => `SAMS-${Date.now().toString().slice(-10)}`;
const receiptNumber = () => `RCP-${Date.now().toString().slice(-10)}`;

async function calculateVisit(visitId: number) {
  return prisma.oPDVisit.findUnique({
    where: { id: visitId },
    include: {
      patient: true,
      clinicalEncounter: true,
      investigationOrders: { orderBy: { createdAt: "asc" } },
      prescriptions: { where: { status: "ACTIVE" }, orderBy: { createdAt: "asc" } },
      billingRecords: { orderBy: { createdAt: "desc" }, include: { lineItems: { orderBy: { createdAt: "asc" } } } },
      billingLineItems: { where: { billingRecordId: null }, orderBy: { createdAt: "asc" } },
    },
  });
}

async function ensureSourceLines(visitId: number, billId?: number) {
  const visit = await prisma.oPDVisit.findUnique({
    where: { id: visitId },
    include: {
      investigationOrders: true,
      prescriptions: { where: { status: "ACTIVE" } },
    },
  });
  if (!visit) return;

  const existing = await prisma.billingLineItem.findMany({ where: { opdVisitId: visitId } });
  const existingSources = new Set(existing.filter((x) => x.sourceType && x.sourceId != null).map((x) => `${x.sourceType}:${x.sourceId}`));
  const rows: Array<{
    opdVisitId: number;
    billingRecordId?: number;
    serviceType: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    sourceType: string;
    sourceId: number;
  }> = [];

  for (const item of visit.investigationOrders) {
    const key = `INVESTIGATION:${item.id}`;
    if (!existingSources.has(key)) {
      rows.push({ opdVisitId: visitId, billingRecordId: billId, serviceType: "INVESTIGATION", description: item.investigation, quantity: 1, unitPrice: round(item.netAmount), amount: round(item.netAmount), sourceType: "INVESTIGATION", sourceId: item.id });
    }
  }
  for (const item of visit.prescriptions) {
    const key = `PHARMACY:${item.id}`;
    if (!existingSources.has(key)) {
      const amount = round(item.quantity * item.unitPrice);
      rows.push({ opdVisitId: visitId, billingRecordId: billId, serviceType: "PHARMACY", description: item.medicineName, quantity: item.quantity, unitPrice: round(item.unitPrice), amount, sourceType: "PHARMACY", sourceId: item.id });
    }
  }
  if (rows.length) await prisma.billingLineItem.createMany({ data: rows });
}

async function recalculateBill(billId: number) {
  const bill = await prisma.billingRecord.findUnique({ where: { id: billId }, include: { lineItems: true } });
  if (!bill) return null;
  const subtotal = round(bill.lineItems.reduce((sum, item) => sum + item.amount, 0));
  const discount = round(Math.min(Math.max(0, bill.discount), subtotal));
  const netAmount = round(Math.max(0, subtotal - discount));
  const paidAmount = round(Math.min(bill.paidAmount, netAmount));
  const balanceAmount = round(Math.max(0, netAmount - paidAmount));
  return prisma.billingRecord.update({
    where: { id: billId },
    data: {
      subtotal,
      discount,
      netAmount,
      paidAmount,
      balanceAmount,
      paymentStatus: paidAmount <= 0 ? "UNPAID" : balanceAmount === 0 ? "PAID" : "PARTIAL",
    },
    include: { lineItems: { orderBy: { createdAt: "asc" } } },
  });
}

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const patientId = params.get("patientId")?.trim();
    const rawVisitId = params.get("visitId");

    if (patientId) {
      const patient = await prisma.patient.findUnique({
        where: { patientId },
        include: { opdVisits: { orderBy: { createdAt: "desc" }, take: 20 } },
      });
      if (!patient) return NextResponse.json({ error: "Patient not found." }, { status: 404 });
      return NextResponse.json({
        patient: { id: patient.id, patientId: patient.patientId, name: `${patient.firstName} ${patient.lastName}`.trim(), phone: patient.phone },
        visits: patient.opdVisits.map((visit) => ({ id: visit.id, tokenNumber: visit.tokenNumber, visitType: visit.visitType, status: visit.status, department: visit.department, createdAt: visit.createdAt })),
      });
    }

    const visitId = Number(rawVisitId);
    if (!Number.isInteger(visitId) || visitId <= 0) return NextResponse.json({ error: "Enter a Patient ID or valid OPD Visit ID." }, { status: 400 });
    const visit = await calculateVisit(visitId);
    if (!visit) return NextResponse.json({ error: "OPD visit not found." }, { status: 404 });

    const existingBill = visit.billingRecords[0] ?? null;
    await ensureSourceLines(visit.id, existingBill?.id);
    const refreshed = await calculateVisit(visit.id);
    if (!refreshed) return NextResponse.json({ error: "Unable to refresh billing information." }, { status: 500 });

    const bill = refreshed.billingRecords[0] ?? null;
    if (bill) await recalculateBill(bill.id);
    const finalVisit = await calculateVisit(visit.id);
    if (!finalVisit) return NextResponse.json({ error: "Unable to load billing information." }, { status: 500 });
    const finalBill = finalVisit.billingRecords[0] ?? null;
    const lineItems = finalBill?.lineItems ?? finalVisit.billingLineItems;

    return NextResponse.json({
      visit: { id: finalVisit.id, tokenNumber: finalVisit.tokenNumber, visitType: finalVisit.visitType, status: finalVisit.status, department: finalVisit.department, createdAt: finalVisit.createdAt },
      patient: { id: finalVisit.patient.id, patientId: finalVisit.patient.patientId, name: `${finalVisit.patient.firstName} ${finalVisit.patient.lastName}`.trim(), phone: finalVisit.patient.phone },
      encounter: finalVisit.clinicalEncounter ? { id: finalVisit.clinicalEncounter.id, treatmentPlan: finalVisit.clinicalEncounter.treatmentPlan, followUpDate: finalVisit.clinicalEncounter.followUpDate } : null,
      lineItems,
      totals: { subtotal: round(lineItems.reduce((sum, item) => sum + item.amount, 0)) },
      bill: finalBill,
    });
  } catch (error) {
    console.error("Billing lookup error:", error);
    return NextResponse.json({ error: "Unable to load billing information." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = String(body?.action || "generateBill");
    const visitId = Number(body?.visitId);
    if (!Number.isInteger(visitId) || visitId <= 0) return NextResponse.json({ error: "A valid OPD visit ID is required." }, { status: 400 });

    if (action === "addLine") {
      const description = String(body?.description || "").trim();
      const serviceType = String(body?.serviceType || "OTHER").trim().toUpperCase();
      const quantity = Number(body?.quantity ?? 1);
      const unitPrice = Number(body?.unitPrice ?? 0);
      if (!description || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) return NextResponse.json({ error: "Service, quantity and a valid rate are required." }, { status: 400 });
      const visit = await prisma.oPDVisit.findUnique({ where: { id: visitId }, include: { billingRecords: { orderBy: { createdAt: "desc" } } } });
      if (!visit) return NextResponse.json({ error: "OPD visit not found." }, { status: 404 });
      const bill = visit.billingRecords[0] ?? null;
      if (bill && bill.paidAmount > 0) return NextResponse.json({ error: "Cannot change bill charges after payment has started." }, { status: 400 });
      const line = await prisma.billingLineItem.create({ data: { opdVisitId: visitId, billingRecordId: bill?.id, serviceType, description, quantity: round(quantity), unitPrice: round(unitPrice), amount: round(quantity * unitPrice) } });
      const updatedBill = bill ? await recalculateBill(bill.id) : null;
      return NextResponse.json({ line, bill: updatedBill });
    }

    const visit = await prisma.oPDVisit.findUnique({ where: { id: visitId }, include: { billingRecords: { orderBy: { createdAt: "desc" } } } });
    if (!visit) return NextResponse.json({ error: "OPD visit not found." }, { status: 404 });
    if (visit.billingRecords[0]) return NextResponse.json({ bill: await recalculateBill(visit.billingRecords[0].id), existing: true });

    const bill = await prisma.billingRecord.create({ data: { billNumber: billNumber(), patientId: visit.patientId, opdVisitId: visit.id, subtotal: 0, netAmount: 0, balanceAmount: 0 } });
    await ensureSourceLines(visit.id, bill.id);
    const finalBill = await recalculateBill(bill.id);
    return NextResponse.json({ bill: finalBill, existing: false }, { status: 201 });
  } catch (error) {
    console.error("Bill creation error:", error);
    return NextResponse.json({ error: "Unable to process billing request." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const action = String(body?.action || "payment");
    const id = Number(body?.billId);
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "A valid bill is required." }, { status: 400 });
    const bill = await prisma.billingRecord.findUnique({ where: { id } });
    if (!bill) return NextResponse.json({ error: "Bill not found." }, { status: 404 });

    if (action === "discount") {
      if (bill.paidAmount > 0) return NextResponse.json({ error: "Cannot change discount after payment has started." }, { status: 400 });
      const discount = Number(body?.discount);
      if (!Number.isFinite(discount) || discount < 0) return NextResponse.json({ error: "Enter a valid discount." }, { status: 400 });
      const updated = await prisma.billingRecord.update({ where: { id }, data: { discount: round(discount) } });
      return NextResponse.json({ bill: await recalculateBill(updated.id) });
    }

    const paidAmount = Number(body?.paidAmount);
    const paymentMethod = String(body?.paymentMethod || "").trim();
    if (!Number.isFinite(paidAmount) || paidAmount <= 0 || !paymentMethod) return NextResponse.json({ error: "Valid payment amount and payment method are required." }, { status: 400 });
    if (bill.balanceAmount <= 0) return NextResponse.json({ error: "This bill is already fully paid." }, { status: 400 });
    if (paidAmount > bill.balanceAmount) return NextResponse.json({ error: "Payment cannot exceed the outstanding balance." }, { status: 400 });
    const newPaid = round(bill.paidAmount + paidAmount);
    const balance = round(Math.max(0, bill.netAmount - newPaid));
    const updated = await prisma.billingRecord.update({ where: { id }, data: { paidAmount: newPaid, balanceAmount: balance, paymentMethod, paymentStatus: balance === 0 ? "PAID" : "PARTIAL", paidAt: new Date(), receiptNumber: bill.receiptNumber ?? receiptNumber() } });
    return NextResponse.json({ bill: updated });
  } catch (error) {
    console.error("Billing update error:", error);
    return NextResponse.json({ error: "Unable to update billing information." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const lineId = Number(params.get("lineId"));
    if (!Number.isInteger(lineId) || lineId <= 0) return NextResponse.json({ error: "A valid charge line is required." }, { status: 400 });
    const line = await prisma.billingLineItem.findUnique({ where: { id: lineId }, include: { billingRecord: true } });
    if (!line) return NextResponse.json({ error: "Charge line not found." }, { status: 404 });
    if (line.billingRecord?.paidAmount && line.billingRecord.paidAmount > 0) return NextResponse.json({ error: "Cannot remove a charge after payment has started." }, { status: 400 });
    await prisma.billingLineItem.delete({ where: { id: lineId } });
    const bill = line.billingRecord ? await recalculateBill(line.billingRecord.id) : null;
    return NextResponse.json({ bill });
  } catch (error) {
    console.error("Billing line deletion error:", error);
    return NextResponse.json({ error: "Unable to remove charge." }, { status: 500 });
  }
}
