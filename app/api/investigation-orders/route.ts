import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const round = (value: number) => Math.round(value * 100) / 100;
const billNumber = () => `SAMS-${Date.now().toString().slice(-10)}`;

function tempPatientId(prefix: "WALKIN" | "REF") {
  return `${prefix}-${Date.now().toString().slice(-10)}-${Math.floor(Math.random() * 90 + 10)}`;
}

async function getOrCreateVisit(body: any) {
  const suppliedVisitId = Number(body?.opdVisitId || 0);
  if (Number.isInteger(suppliedVisitId) && suppliedVisitId > 0) {
    const visit = await prisma.oPDVisit.findUnique({ where: { id: suppliedVisitId }, include: { patient: true } });
    if (!visit) throw new Error("OPD visit not found.");
    return visit;
  }

  const suppliedPatientId = String(body?.patientId || "").trim();
  let patient = suppliedPatientId ? await prisma.patient.findUnique({ where: { patientId: suppliedPatientId } }) : null;
  const mode = String(body?.sourceType || "REGISTERED").toUpperCase();

  if (!patient && mode === "REGISTERED") throw new Error("Registered patient not found.");

  if (!patient) {
    const firstName = String(body?.firstName || "Walk-in").trim() || "Walk-in";
    const lastName = String(body?.lastName || "Patient").trim() || "Patient";
    patient = await prisma.patient.create({
      data: {
        patientId: tempPatientId(mode === "EXTERNAL_REFERRAL" ? "REF" : "WALKIN"),
        firstName,
        lastName,
        dateOfBirth: body?.dateOfBirth ? new Date(body.dateOfBirth) : null,
        gender: body?.gender ? String(body.gender) : null,
        phone: body?.phone ? String(body.phone) : null,
        address: body?.address ? String(body.address) : null,
      },
    });
  }

  const tokenNumber = Number(String(Date.now()).slice(-6));
  return prisma.oPDVisit.create({
    data: {
      patientId: patient.id,
      tokenNumber,
      visitType: mode === "EXTERNAL_REFERRAL" ? "EXTERNAL_DIAGNOSTIC" : "DIAGNOSTIC",
      status: "WAITING",
    },
    include: { patient: true },
  });
}

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const visitId = Number(params.get("opdVisitId") || 0);
    const patientId = params.get("patientId")?.trim() || "";
    const status = params.get("status")?.trim().toUpperCase() || "";

    const orders = await prisma.investigationOrder.findMany({
      where: {
        ...(visitId > 0 ? { opdVisitId: visitId } : {}),
        ...(status ? { status } : {}),
        ...(patientId ? { opdVisit: { patient: { patientId } } } : {}),
      },
      include: {
        master: true,
        opdVisit: { include: { patient: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Investigation order GET failed:", error);
    return NextResponse.json({ error: "Unable to load investigation orders." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sourceType = String(body?.sourceType || "REGISTERED").trim().toUpperCase();
    const requested = Array.isArray(body?.investigations) ? body.investigations : [];
    if (!requested.length) return NextResponse.json({ error: "Select at least one investigation." }, { status: 400 });

    const visit = await getOrCreateVisit(body);
    const ids = requested.map((x: any) => Number(x?.id)).filter((x: number) => Number.isInteger(x) && x > 0);
    const masters = await prisma.investigationMaster.findMany({ where: { id: { in: ids }, active: true } });
    if (masters.length !== ids.length) return NextResponse.json({ error: "One or more investigations are invalid or inactive." }, { status: 400 });

    const existingBill = (await prisma.billingRecord.findFirst({ where: { opdVisitId: visit.id }, orderBy: { createdAt: "desc" } }));
    if (existingBill?.paidAmount && existingBill.paidAmount > 0) {
      return NextResponse.json({ error: "This visit already has a paid bill and cannot be changed." }, { status: 409 });
    }

    const orders = [];
    for (const master of masters) {
      const order = await prisma.investigationOrder.create({
        data: {
          opdVisitId: visit.id,
          investigationId: master.id,
          investigation: master.name,
          price: round(master.rate),
          netAmount: round(master.rate),
          paymentStatus: "UNPAID",
          status: "ORDERED",
        },
        include: { master: true },
      });
      orders.push(order);
    }

    const addedTotal = round(orders.reduce((sum, order) => sum + order.netAmount, 0));
    const bill = existingBill
      ? await prisma.billingRecord.update({
          where: { id: existingBill.id },
          data: {
            subtotal: round(existingBill.subtotal + addedTotal),
            netAmount: round(existingBill.netAmount + addedTotal),
            balanceAmount: round(existingBill.balanceAmount + addedTotal),
          },
        })
      : await prisma.billingRecord.create({
          data: {
            billNumber: billNumber(),
            patientId: visit.patientId,
            opdVisitId: visit.id,
            subtotal: addedTotal,
            netAmount: addedTotal,
            balanceAmount: addedTotal,
            paymentStatus: "UNPAID",
          },
        });

    for (const order of orders) {
      await prisma.billingLineItem.create({
        data: {
          billingRecordId: bill.id,
          opdVisitId: visit.id,
          serviceType: "INVESTIGATION",
          description: order.investigation,
          quantity: 1,
          unitPrice: round(order.netAmount),
          amount: round(order.netAmount),
          sourceType: "INVESTIGATION_ORDER",
          sourceId: order.id,
        },
      });
    }

    return NextResponse.json({
      sourceType,
      visit: { id: visit.id, patientId: visit.patient.patientId, name: `${visit.patient.firstName} ${visit.patient.lastName}`.trim(), visitType: visit.visitType },
      orders,
      bill,
      message: "Investigation order sent to the diagnostic queue and added to billing.",
    }, { status: 201 });
  } catch (error) {
    console.error("Investigation order POST failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to place investigation order." }, { status: 500 });
  }
}
