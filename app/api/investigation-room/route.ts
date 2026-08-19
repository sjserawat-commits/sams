import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUS = ["ORDERED","APPROVED_FOR_SAMPLING","ACCEPTED","SAMPLE_COLLECTED","PROCESSING","COMPLETED","VERIFIED","PUBLISHED","CANCELLED"] as const;
type InvestigationStatus = (typeof ALLOWED_STATUS)[number];

function accession(id: number) { return `SAMSLAB-${new Date().getFullYear()}-${String(id).padStart(7, "0")}`; }

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
        ...(q ? { OR: [
          { investigation: { contains: q } },
          { opdVisit: { patient: { patientId: { contains: q } } } },
          { opdVisit: { patient: { firstName: { contains: q } } } },
          { opdVisit: { patient: { lastName: { contains: q } } } },
        ] } : {}),
      },
      include: {
        master: { select: { code: true, category: true, specimen: true, unit: true, referenceRange: true, method: true, criticalValue: true } },
        opdVisit: {
          select: {
            id: true,
            tokenNumber: true,
            visitType: true,
            patient: { select: { patientId: true, firstName: true, lastName: true, gender: true, dateOfBirth: true } },
            billingRecords: { select: { id: true, paymentStatus: true, paidAmount: true, balanceAmount: true, netAmount: true }, orderBy: { createdAt: "desc" }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders.map((order) => {
      const bill = order.opdVisit.billingRecords[0] ?? null;
      const paid = !bill || bill.balanceAmount <= 0 || bill.paymentStatus === "PAID";
      const approved = ["APPROVED_FOR_SAMPLING","ACCEPTED","SAMPLE_COLLECTED","PROCESSING","COMPLETED","VERIFIED","PUBLISHED"].includes(order.status);
      return { ...order, billing: bill, workflow: { paymentStatus: bill?.paymentStatus ?? order.paymentStatus, outstandingAmount: bill?.balanceAmount ?? Math.max(0, order.netAmount), samplingEligible: paid || approved, paymentRequiredBeforeSampling: !paid && !approved } };
    }));
  } catch { return NextResponse.json({ error: "Unable to load investigation room." }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body?.id);
    const requestedStatus = String(body?.status ?? "").trim().toUpperCase();
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "A valid investigation order ID is required." }, { status: 400 });
    if (!ALLOWED_STATUS.includes(requestedStatus as InvestigationStatus)) return NextResponse.json({ error: "Invalid investigation status." }, { status: 400 });
    const order = await prisma.investigationOrder.findUnique({ where: { id }, include: { opdVisit: { include: { billingRecords: { orderBy: { createdAt: "desc" }, take: 1 } } }, master: true } });
    if (!order) return NextResponse.json({ error: "Investigation order not found." }, { status: 404 });
    const bill = order.opdVisit.billingRecords[0] ?? null;
    const paid = !bill || bill.balanceAmount <= 0 || bill.paymentStatus === "PAID";
    const samplingApproved = ["APPROVED_FOR_SAMPLING","ACCEPTED"].includes(order.status);
    if (requestedStatus === "APPROVED_FOR_SAMPLING" && paid) return NextResponse.json({ error: "This bill is already paid. Accept the order directly." }, { status: 400 });
    if (["ACCEPTED","SAMPLE_COLLECTED","PROCESSING"].includes(requestedStatus) && !paid && !samplingApproved) return NextResponse.json({ error: "Payment is pending. Approve the order for sampling before continuing." }, { status: 400 });
    const now = new Date();
    const data: any = { status: requestedStatus };
    if (requestedStatus === "ACCEPTED") data.specimen = body?.specimen ? String(body.specimen) : order.specimen ?? order.master?.specimen ?? null;
    if (requestedStatus === "SAMPLE_COLLECTED") { data.sampleCollectedAt = now; data.sampleCollectedBy = body?.sampleCollectedBy ? String(body.sampleCollectedBy) : "Laboratory"; data.accessionNumber = order.accessionNumber ?? accession(id); data.barcodeValue = order.barcodeValue ?? order.accessionNumber ?? accession(id); }
    if (requestedStatus === "PROCESSING") data.processingStartedAt = now;
    if (requestedStatus === "COMPLETED") { if (!String(body?.reportText ?? order.reportText ?? "").trim()) return NextResponse.json({ error: "Result/report is required before completing the investigation." }, { status: 400 }); data.processingCompletedAt = now; data.reportText = String(body?.reportText ?? order.reportText).trim(); data.resultData = body?.resultData ? JSON.stringify(body.resultData) : order.resultData; data.abnormalFlag = Boolean(body?.abnormalFlag ?? order.abnormalFlag); data.criticalFlag = Boolean(body?.criticalFlag ?? order.criticalFlag); data.reportedAt = now; data.verificationStatus = "PENDING"; }
    if (requestedStatus === "VERIFIED") { if (!order.reportText) return NextResponse.json({ error: "Complete the result before verification." }, { status: 400 }); data.verificationStatus = "VERIFIED"; data.verifiedBy = body?.verifiedBy ? String(body.verifiedBy) : "Authorized Laboratory User"; data.verifiedAt = now; }
    if (requestedStatus === "PUBLISHED") { if (order.verificationStatus !== "VERIFIED") return NextResponse.json({ error: "Report must be verified before publication." }, { status: 400 }); data.publishedAt = now; }
    const updated = await prisma.investigationOrder.update({ where: { id }, data, include: { master: true, opdVisit: { include: { patient: true } } } });
    return NextResponse.json(updated);
  } catch (error) { console.error("Investigation room PATCH failed:", error); return NextResponse.json({ error: "Unable to update investigation workflow." }, { status: 500 }); }
}
