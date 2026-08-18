import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUS = [
  "ORDERED",
  "APPROVED_FOR_SAMPLING",
  "SAMPLE_COLLECTED",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
] as const;
type InvestigationStatus = (typeof ALLOWED_STATUS)[number];

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const q = params.get("q")?.trim() ?? "";
    const status = params.get("status")?.trim().toUpperCase() ?? "";
    const visitId = Number(params.get("opdVisitId") || 0);

    const orders = await prisma.investigationOrder.findMany({
      where: {
        ...(visitId > 0 ? { opdVisitId: visitId } : {}),
        ...(status && ALLOWED_STATUS.includes(status as InvestigationStatus) ? { status } : {}),
        ...(q
          ? {
              OR: [
                { investigation: { contains: q } },
                { opdVisit: { patient: { patientId: { contains: q } } } },
                { opdVisit: { patient: { firstName: { contains: q } } } },
                { opdVisit: { patient: { lastName: { contains: q } } } },
              ],
            }
          : {}),
      },
      include: {
        master: { select: { code: true, category: true, specimen: true, unit: true, referenceRange: true, method: true } },
        opdVisit: {
          select: {
            id: true,
            tokenNumber: true,
            visitType: true,
            patient: { select: { patientId: true, firstName: true, lastName: true } },
            billingRecords: {
              select: { id: true, paymentStatus: true, paidAmount: true, balanceAmount: true, netAmount: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      orders.map((order) => {
        const bill = order.opdVisit.billingRecords[0] ?? null;
        const billPaid = !bill || bill.balanceAmount <= 0;
        const samplingApproved = order.status === "APPROVED_FOR_SAMPLING";
        return {
          ...order,
          billing: bill,
          workflow: {
            paymentStatus: bill?.paymentStatus ?? order.paymentStatus,
            outstandingAmount: bill?.balanceAmount ?? Math.max(0, order.netAmount),
            samplingEligible: billPaid || samplingApproved,
            paymentRequiredBeforeSampling: !billPaid && !samplingApproved,
          },
        };
      }),
    );
  } catch (error) {
    console.error("Investigation room GET failed:", error);
    return NextResponse.json({ error: "Unable to load investigation room." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body?.id);
    const requestedStatus = String(body?.status ?? "").trim().toUpperCase();
    const reportText = body?.reportText == null ? undefined : String(body.reportText).trim();

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "A valid investigation order ID is required." }, { status: 400 });
    }
    if (!ALLOWED_STATUS.includes(requestedStatus as InvestigationStatus)) {
      return NextResponse.json({ error: "Invalid investigation status." }, { status: 400 });
    }

    const order = await prisma.investigationOrder.findUnique({
      where: { id },
      include: {
        opdVisit: {
          include: {
            billingRecords: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        },
      },
    });
    if (!order) return NextResponse.json({ error: "Investigation order not found." }, { status: 404 });

    const bill = order.opdVisit.billingRecords[0] ?? null;
    const billPaid = !bill || bill.balanceAmount <= 0;

    if (requestedStatus === "SAMPLE_COLLECTED" || requestedStatus === "PROCESSING" || requestedStatus === "COMPLETED") {
      if (!billPaid && order.status !== "APPROVED_FOR_SAMPLING") {
        return NextResponse.json({ error: "Payment is pending. The order must be paid or explicitly approved for sampling before processing." }, { status: 400 });
      }
    }

    if (requestedStatus === "COMPLETED" && !reportText) {
      return NextResponse.json({ error: "Report/result is required before completing the investigation." }, { status: 400 });
    }

    const updated = await prisma.investigationOrder.update({
      where: { id },
      data: {
        status: requestedStatus,
        ...(reportText !== undefined ? { reportText } : {}),
        reportedAt: requestedStatus === "COMPLETED" ? new Date() : null,
      },
      include: {
        master: true,
        opdVisit: { include: { patient: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Investigation room PATCH failed:", error);
    return NextResponse.json({ error: "Unable to update investigation workflow." }, { status: 500 });
  }
}
