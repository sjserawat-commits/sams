import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const [all, todayBills, recent] = await Promise.all([
      prisma.billingRecord.findMany({
        orderBy: { createdAt: "desc" },
        include: { patient: true, lineItems: true },
      }),
      prisma.billingRecord.findMany({
        where: { createdAt: { gte: start, lt: end } },
        include: { patient: true, lineItems: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.billingRecord.findMany({
        take: 12,
        orderBy: { updatedAt: "desc" },
        include: { patient: true, lineItems: true },
      }),
    ]);

    const collection = all.reduce((s, b) => s + Number(b.paidAmount || 0), 0);
    const billing = todayBills.reduce((s, b) => s + Number(b.netAmount || 0), 0);
    const outstanding = all.reduce((s, b) => s + Number(b.balanceAmount || 0), 0);
    const pending = all.filter((b) => b.paymentStatus !== "PAID").length;
    const paid = all.filter((b) => b.paymentStatus === "PAID").length;
    const partial = all.filter((b) => b.paymentStatus === "PARTIAL").length;

    const serviceTotals: Record<string, number> = {};
    for (const bill of all) for (const line of bill.lineItems) {
      serviceTotals[line.serviceType] = (serviceTotals[line.serviceType] || 0) + Number(line.amount || 0);
    }

    const paymentMethods: Record<string, number> = {};
    for (const bill of all) if (bill.paymentMethod) {
      paymentMethods[bill.paymentMethod] = (paymentMethods[bill.paymentMethod] || 0) + Number(bill.paidAmount || 0);
    }

    return NextResponse.json({
      summary: { todayCollection: todayBills.reduce((s, b) => s + Number(b.paidAmount || 0), 0), todayBilling: billing, pendingBills: pending, outstanding, paidBills: paid, partialBills: partial },
      serviceTotals,
      paymentMethods,
      recent: recent.map((b) => ({ billNumber: b.billNumber, patient: `${b.patient.firstName} ${b.patient.lastName}`.trim(), patientId: b.patient.patientId, amount: b.netAmount, paid: b.paidAmount, balance: b.balanceAmount, status: b.paymentStatus, createdAt: b.createdAt })),
    });
  } catch (error) {
    console.error("Admin billing dashboard error", error);
    return NextResponse.json({ error: "Unable to load billing dashboard." }, { status: 500 });
  }
}
