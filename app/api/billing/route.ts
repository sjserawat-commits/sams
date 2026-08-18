import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const round = (value: number) => Math.round(value * 100) / 100;
const billNumber = () => `SAMS-${Date.now().toString().slice(-10)}`;
const receiptNumber = () => `RCP-${Date.now().toString().slice(-10)}`;
const CONSULTATION_FEE = 500;

async function syncVisitCharges(visitId: number) {
  const visit = await prisma.oPDVisit.findUnique({
    where: { id: visitId },
    include: { patient: true, departmentMaster: true, clinicalEncounter: true, investigationOrders: { orderBy: { createdAt: "asc" } }, prescriptions: { where: { status: "ACTIVE" }, orderBy: { createdAt: "asc" } }, billingRecords: { orderBy: { createdAt: "desc" } }, billingLineItems: { orderBy: { createdAt: "asc" } } },
  });
  if (!visit) return null;
  const latestBill = visit.billingRecords[0];
  const billLocked = Boolean(latestBill?.paidAmount);
  const hasConsultation = visit.billingLineItems.some((line) => line.serviceType === "CONSULTATION" && line.sourceType === "OPD_VISIT");
  if (!hasConsultation && !billLocked) await prisma.billingLineItem.create({ data: { opdVisitId: visit.id, serviceType: "CONSULTATION", description: "OPD Consultation Fee", quantity: 1, unitPrice: CONSULTATION_FEE, amount: CONSULTATION_FEE, sourceType: "OPD_VISIT", sourceId: visit.id } });
  for (const order of visit.investigationOrders) {
    const existing = visit.billingLineItems.find((line) => line.sourceType === "INVESTIGATION_ORDER" && line.sourceId === order.id);
    if (!existing && !billLocked) await prisma.billingLineItem.create({ data: { opdVisitId: visit.id, serviceType: "INVESTIGATION", description: order.investigation, quantity: 1, unitPrice: round(order.netAmount), amount: round(order.netAmount), sourceType: "INVESTIGATION_ORDER", sourceId: order.id } });
  }
  for (const prescription of visit.prescriptions) {
    const existing = visit.billingLineItems.find((line) => line.sourceType === "PRESCRIPTION" && line.sourceId === prescription.id);
    if (!existing && !billLocked) await prisma.billingLineItem.create({ data: { opdVisitId: visit.id, serviceType: "PHARMACY", description: prescription.medicineName, quantity: prescription.quantity, unitPrice: round(prescription.unitPrice), amount: round(prescription.quantity * prescription.unitPrice), sourceType: "PRESCRIPTION", sourceId: prescription.id } });
  }
  const refreshed = await prisma.oPDVisit.findUnique({ where: { id: visitId }, include: { patient: true, departmentMaster: true, clinicalEncounter: true, billingLineItems: { orderBy: { createdAt: "asc" } }, billingRecords: { orderBy: { createdAt: "desc" } } } });
  if (!refreshed) return null;
  const bill = refreshed.billingRecords[0];
  if (bill && bill.paidAmount === 0) {
    const subtotal = round(refreshed.billingLineItems.reduce((sum, line) => sum + line.amount, 0));
    const netAmount = round(Math.max(0, subtotal - bill.discount));
    await prisma.billingRecord.update({ where: { id: bill.id }, data: { subtotal, netAmount, balanceAmount: round(Math.max(0, netAmount - bill.paidAmount)) } });
    refreshed.billingRecords[0] = { ...bill, subtotal, netAmount, balanceAmount: round(Math.max(0, netAmount - bill.paidAmount)) };
  }
  return refreshed;
}

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const patientId = params.get("patientId")?.trim() ?? "";
    const visitIdParam = params.get("visitId")?.trim() ?? "";
    const visitId = visitIdParam ? Number(visitIdParam) : null;
    if (patientId && visitId === null) {
      const patient = await prisma.patient.findUnique({ where: { patientId } });
      if (!patient) return NextResponse.json({ error: "Patient not found." }, { status: 404 });
      const visits = await prisma.oPDVisit.findMany({ where: { patientId: patient.id }, include: { departmentMaster: true }, orderBy: { createdAt: "desc" } });
      return NextResponse.json({ patient: { id: patient.id, patientId: patient.patientId, name: `${patient.firstName} ${patient.lastName}`.trim(), phone: patient.phone }, visits: visits.map((visit) => ({ id: visit.id, tokenNumber: visit.tokenNumber, visitType: visit.visitType, status: visit.status, department: visit.departmentMaster?.name ?? null, createdAt: visit.createdAt })) });
    }
    if (!Number.isInteger(visitId) || visitId <= 0) return NextResponse.json({ error: "A valid OPD visit ID or patient ID is required." }, { status: 400 });
    const validVisitId = visitId;
    const visit = await syncVisitCharges(validVisitId);
    if (!visit) return NextResponse.json({ error: "OPD visit not found." }, { status: 404 });
    const lineItems = visit.billingLineItems.map((line) => ({ id: line.id, serviceType: line.serviceType, description: line.description, quantity: line.quantity, unitPrice: round(line.unitPrice), amount: round(line.amount), sourceType: line.sourceType, sourceId: line.sourceId }));
    const subtotal = round(lineItems.reduce((sum, line) => sum + line.amount, 0));
    const bill = visit.billingRecords[0] ?? null;
    return NextResponse.json({ visit: { id: visit.id, tokenNumber: visit.tokenNumber, visitType: visit.visitType, status: visit.status, department: visit.departmentMaster?.name ?? null, createdAt: visit.createdAt }, patient: { id: visit.patient.id, patientId: visit.patient.patientId, name: `${visit.patient.firstName} ${visit.patient.lastName}`.trim(), phone: visit.patient.phone }, encounter: visit.clinicalEncounter ? { id: visit.clinicalEncounter.id, treatmentPlan: visit.clinicalEncounter.treatmentPlan, followUpDate: visit.clinicalEncounter.followUpDate } : null, lineItems, totals: { subtotal }, bill, consultationFee: CONSULTATION_FEE });
  } catch (error) { console.error("Billing lookup error:", error); return NextResponse.json({ error: "Unable to load billing information." }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const visitId = Number(body?.visitId);
    if (!Number.isInteger(visitId) || visitId <= 0) return NextResponse.json({ error: "A valid OPD visit ID is required." }, { status: 400 });
    const visit = await syncVisitCharges(visitId);
    if (!visit) return NextResponse.json({ error: "OPD visit not found." }, { status: 404 });
    if (body?.action === "addLine") {
      const serviceType = String(body.serviceType ?? "OTHER").trim().toUpperCase(); const description = String(body.description ?? "").trim(); const quantity = Number(body.quantity); const unitPrice = Number(body.unitPrice);
      if (!description || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) return NextResponse.json({ error: "Enter service, quantity and valid rate." }, { status: 400 });
      if (visit.billingRecords[0]?.paidAmount) return NextResponse.json({ error: "Paid bills cannot be modified." }, { status: 400 });
      const line = await prisma.billingLineItem.create({ data: { opdVisitId: visitId, serviceType, description, quantity, unitPrice: round(unitPrice), amount: round(quantity * unitPrice) } });
      return NextResponse.json({ line }, { status: 201 });
    }
    const subtotal = round(visit.billingLineItems.reduce((sum, line) => sum + line.amount, 0));
    if (visit.billingRecords[0]) return NextResponse.json({ bill: visit.billingRecords[0], existing: true });
    const bill = await prisma.billingRecord.create({ data: { billNumber: billNumber(), patientId: visit.patientId, opdVisitId: visit.id, subtotal, netAmount: subtotal, balanceAmount: subtotal } });
    await prisma.billingLineItem.updateMany({ where: { opdVisitId: visitId, billingRecordId: null }, data: { billingRecordId: bill.id } });
    const updated = await prisma.billingRecord.findUnique({ where: { id: bill.id }, include: { lineItems: true } });
    return NextResponse.json({ bill: updated, existing: false }, { status: 201 });
  } catch (error) { console.error("Billing write error:", error); return NextResponse.json({ error: "Unable to update billing." }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json(); const id = Number(body?.billId);
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "A valid bill ID is required." }, { status: 400 });
    const bill = await prisma.billingRecord.findUnique({ where: { id } });
    if (!bill) return NextResponse.json({ error: "Bill not found." }, { status: 404 });
    if (body?.action === "discount") {
      if (bill.paidAmount > 0) return NextResponse.json({ error: "Paid bills cannot be discounted." }, { status: 400 });
      const discount = Number(body.discount); if (!Number.isFinite(discount) || discount < 0 || discount > bill.subtotal) return NextResponse.json({ error: "Enter a valid discount." }, { status: 400 });
      const netAmount = round(bill.subtotal - discount); const updated = await prisma.billingRecord.update({ where: { id }, data: { discount: round(discount), netAmount, balanceAmount: netAmount } });
      return NextResponse.json({ bill: updated });
    }
    const paidAmount = Number(body?.paidAmount); const paymentMethod = String(body?.paymentMethod ?? "").trim().toUpperCase();
    if (!Number.isFinite(paidAmount) || paidAmount <= 0 || !paymentMethod) return NextResponse.json({ error: "Bill, valid payment amount and payment method are required." }, { status: 400 });
    if (paidAmount > bill.balanceAmount) return NextResponse.json({ error: "Payment exceeds outstanding balance." }, { status: 400 });
    const newPaid = round(bill.paidAmount + paidAmount); const balance = round(Math.max(0, bill.netAmount - newPaid));
    const updated = await prisma.billingRecord.update({ where: { id }, data: { paidAmount: newPaid, balanceAmount: balance, paymentMethod, paymentStatus: balance === 0 ? "PAID" : "PARTIAL", paidAt: new Date(), receiptNumber: bill.receiptNumber ?? receiptNumber() } });
    if (bill.opdVisitId) await prisma.investigationOrder.updateMany({ where: { opdVisitId: bill.opdVisitId }, data: { paymentStatus: balance === 0 ? "PAID" : "PARTIAL" } });
    return NextResponse.json({ bill: updated });
  } catch (error) { console.error("Billing patch error:", error); return NextResponse.json({ error: "Unable to update billing." }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  try {
    const lineId = Number(new URL(request.url).searchParams.get("lineId"));
    if (!Number.isInteger(lineId) || lineId <= 0) return NextResponse.json({ error: "A valid line item ID is required." }, { status: 400 });
    const line = await prisma.billingLineItem.findUnique({ where: { id: lineId }, include: { billingRecord: true } });
    if (!line) return NextResponse.json({ error: "Charge not found." }, { status: 404 });
    if (line.billingRecord?.paidAmount) return NextResponse.json({ error: "Paid bills cannot be modified." }, { status: 400 });
    await prisma.billingLineItem.delete({ where: { id: lineId } });
    if (line.billingRecordId) {
      const remaining = await prisma.billingLineItem.findMany({ where: { billingRecordId: line.billingRecordId } });
      const subtotal = round(remaining.reduce((sum, item) => sum + item.amount, 0));
      await prisma.billingRecord.update({ where: { id: line.billingRecordId }, data: { subtotal, netAmount: round(Math.max(0, subtotal - line.billingRecord!.discount)), balanceAmount: round(Math.max(0, subtotal - line.billingRecord!.discount - line.billingRecord!.paidAmount)) } });
    }
    return NextResponse.json({ ok: true });
  } catch (error) { console.error("Billing delete error:", error); return NextResponse.json({ error: "Unable to remove charge." }, { status: 500 }); }
}
