import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const round = (value: number) => Math.round(value * 100) / 100;
const billNumber = () => `SAMS-${Date.now().toString().slice(-10)}`;
const CONSULTATION_FEE = 500;
function tempPatientId(prefix: "WALKIN" | "REF") { return `${prefix}-${Date.now().toString().slice(-10)}-${Math.floor(Math.random() * 90 + 10)}`; }
type InvestigationMasterRate = { rate: number | null; smsBenchmarkRate: number | null; corporateBenchmarkRate: number | null };
function effectiveRate(master: InvestigationMasterRate | null) { if (!master) return 1; const sms = Number(master.smsBenchmarkRate || 0), corporate = Number(master.corporateBenchmarkRate || 0), rate = Number(master.rate || 0); if (sms > 0) return Math.max(1, Math.round(sms * 1.65)); if (corporate > 0) return Math.max(1, Math.round(corporate * 0.65)); if (rate > 0) return Math.max(1, Math.round(rate)); return 1; }

async function getOrCreateVisit(body: any) {
  const suppliedVisitId = Number(body?.opdVisitId || 0);
  if (Number.isInteger(suppliedVisitId) && suppliedVisitId > 0) { const visit = await prisma.oPDVisit.findUnique({ where: { id: suppliedVisitId }, include: { patient: true } }); if (!visit) throw new Error("OPD visit not found."); return visit; }
  const suppliedPatientId = String(body?.patientId || "").trim(); let patient = suppliedPatientId ? await prisma.patient.findUnique({ where: { patientId: suppliedPatientId } }) : null; const mode = String(body?.sourceType || "REGISTERED").toUpperCase();
  if (!patient && mode === "REGISTERED") throw new Error("Registered patient not found.");
  if (!patient) { const firstName = String(body?.firstName || "Walk-in").trim() || "Walk-in"; const lastName = String(body?.lastName || "Patient").trim() || "Patient"; patient = await prisma.patient.create({ data: { patientId: tempPatientId(mode === "EXTERNAL_REFERRAL" ? "REF" : "WALKIN"), firstName, lastName, dateOfBirth: body?.dateOfBirth ? new Date(body.dateOfBirth) : null, gender: body?.gender ? String(body.gender) : null, phone: body?.phone ? String(body.phone) : null, address: body?.address ? String(body.address) : null } }); }
  return prisma.oPDVisit.create({ data: { patientId: patient.id, tokenNumber: Number(String(Date.now()).slice(-6)), visitType: mode === "EXTERNAL_REFERRAL" ? "EXTERNAL_DIAGNOSTIC" : "DIAGNOSTIC", status: "WAITING" }, include: { patient: true } });
}

export async function GET(request: Request) {
  try { const params = new URL(request.url).searchParams; const visitId = Number(params.get("opdVisitId") || 0), patientId = params.get("patientId")?.trim() || "", status = params.get("status")?.trim().toUpperCase() || ""; const orders = await prisma.investigationOrder.findMany({ where: { ...(visitId > 0 ? { opdVisitId: visitId } : {}), ...(status ? { status } : {}), ...(patientId ? { opdVisit: { patient: { patientId } } } : {}) }, include: { master: true, opdVisit: { include: { patient: true } } }, orderBy: { createdAt: "desc" } }); return NextResponse.json(orders.map((order) => ({ ...order, price: effectiveRate(order.master), netAmount: effectiveRate(order.master) }))); } catch (error) { console.error("Investigation order GET failed:", error); return NextResponse.json({ error: "Unable to load investigation orders." }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json(); const sourceType = String(body?.sourceType || "REGISTERED").trim().toUpperCase(); const requested: any[] = Array.isArray(body?.investigations) ? body.investigations : [];
    if (!requested.length) return NextResponse.json({ error: "Select at least one investigation." }, { status: 400 });
    const visit = await getOrCreateVisit(body); const ids: number[] = Array.from(new Set<number>(requested.map((x: any) => Number(x?.id)).filter((x: number) => Number.isInteger(x) && x > 0)));
    if (!ids.length) return NextResponse.json({ error: "Select valid investigations." }, { status: 400 });
    const masters = await prisma.investigationMaster.findMany({ where: { id: { in: ids }, active: true } });
    if (masters.length !== ids.length) return NextResponse.json({ error: "One or more investigations are invalid or inactive." }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      const existingBill = await tx.billingRecord.findFirst({ where: { opdVisitId: visit.id }, orderBy: { createdAt: "desc" } });
      if (existingBill && existingBill.paidAmount > 0) throw new Error("This visit already has a paid bill and cannot be changed.");
      if (existingBill && !["DRAFT", "UNPAID"].includes(existingBill.paymentStatus)) throw new Error("This visit already has a processed bill and cannot be changed from Investigation Orders.");
      const existingOrders = await tx.investigationOrder.findMany({ where: { opdVisitId: visit.id, investigationId: { in: ids }, status: { not: "CANCELLED" } } });
      const existingIds = new Set<number>(existingOrders.map(x => x.investigationId).filter((x): x is number => typeof x === "number")); const newMasters = masters.filter(m => !existingIds.has(m.id));
      const orders: Array<{ id: number; netAmount: number; investigation: string; specimen: string | null }> = [];
      for (const master of newMasters) { const rate = effectiveRate(master); const order = await tx.investigationOrder.create({ data: { opdVisitId: visit.id, investigationId: master.id, investigation: master.name, price: rate, netAmount: rate, paymentStatus: "UNPAID", status: "ORDERED", specimen: master.specimen || null } }); orders.push({ id: order.id, netAmount: order.netAmount, investigation: order.investigation, specimen: order.specimen }); }
      const addedInvestigationTotal = round(orders.reduce((sum, order) => sum + order.netAmount, 0));
      let bill = existingBill;
      if (addedInvestigationTotal > 0) {
        if (!bill) bill = await tx.billingRecord.create({ data: { billNumber: billNumber(), patientId: visit.patientId, opdVisitId: visit.id, subtotal: 0, netAmount: 0, balanceAmount: 0, paymentStatus: "DRAFT" } });
        const hasConsultation = await tx.billingLineItem.findFirst({ where: { billingRecordId: bill.id, serviceType: "CONSULTATION", sourceType: "OPD_VISIT" } });
        if (!hasConsultation) await tx.billingLineItem.create({ data: { billingRecordId: bill.id, opdVisitId: visit.id, serviceType: "CONSULTATION", description: "OPD Consultation Fee", quantity: 1, unitPrice: CONSULTATION_FEE, amount: CONSULTATION_FEE, sourceType: "OPD_VISIT", sourceId: visit.id } });
        for (const order of orders) await tx.billingLineItem.create({ data: { billingRecordId: bill.id, opdVisitId: visit.id, serviceType: "INVESTIGATION", description: order.investigation, quantity: 1, unitPrice: round(order.netAmount), amount: round(order.netAmount), sourceType: "INVESTIGATION_ORDER", sourceId: order.id } });
        const lines = await tx.billingLineItem.findMany({ where: { billingRecordId: bill.id } }); const subtotal = round(lines.reduce((sum, line) => sum + line.amount, 0)); const netAmount = round(Math.max(0, subtotal - bill.discount));
        bill = await tx.billingRecord.update({ where: { id: bill.id }, data: { subtotal, netAmount, balanceAmount: netAmount, paymentStatus: "DRAFT" } });
      }
      return { orders, existingOrders, bill, addedInvestigationTotal, duplicateCount: masters.length - newMasters.length };
    });
    return NextResponse.json({ sourceType, visit: { id: visit.id, patientId: visit.patient.patientId, name: `${visit.patient.firstName} ${visit.patient.lastName}`.trim(), visitType: visit.visitType }, orders: result.orders, existingOrders: result.existingOrders, bill: result.bill, duplicateCount: result.duplicateCount, message: result.addedInvestigationTotal > 0 ? `Investigation order placed successfully. ${result.orders.length} investigation(s) added to the draft bill.` : "These investigations are already ordered for this Visit; no duplicate order was created." }, { status: 201 });
  } catch (error) { console.error("Investigation order POST failed:", error); const message = error instanceof Error ? error.message : "Unable to place investigation order."; return NextResponse.json({ error: message }, { status: message.includes("paid bill") || message.includes("processed bill") ? 409 : 500 }); }
}
