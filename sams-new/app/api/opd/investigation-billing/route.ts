import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const opdVisitId = Number(searchParams.get("opdVisitId") || 0);

    const orders = await prisma.investigationOrder.findMany({
      where: opdVisitId ? { opdVisitId } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Investigation billing error:", error);
    return NextResponse.json({ error: "Unable to load investigation billing." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const opdVisitId = Number(body.opdVisitId);
    const requested: Array<{ investigationId?: unknown }> = Array.isArray(body.investigations) ? body.investigations : [];
    const discountType = String(body.discountType || "PERCENT").toUpperCase();
    const requestedDiscount = Number(body.discountValue || 0);

    if (!Number.isInteger(opdVisitId) || opdVisitId <= 0) {
      return NextResponse.json({ error: "A valid OPD Visit ID is required." }, { status: 400 });
    }
    if (!requested.length) {
      return NextResponse.json({ error: "At least one investigation is required." }, { status: 400 });
    }
    if (!Number.isFinite(requestedDiscount) || requestedDiscount < 0) {
      return NextResponse.json({ error: "Discount value must be zero or greater." }, { status: 400 });
    }
    if (discountType !== "PERCENT" && discountType !== "AMOUNT") {
      return NextResponse.json({ error: "Discount type must be PERCENT or AMOUNT." }, { status: 400 });
    }

    const visit = await prisma.oPDVisit.findUnique({
      where: { id: opdVisitId },
      select: { id: true, billingRecords: { select: { id: true, paymentStatus: true, paidAmount: true }, orderBy: { createdAt: "desc" }, take: 1 } },
    });
    if (!visit) return NextResponse.json({ error: "OPD Visit not found." }, { status: 404 });

    if (visit.billingRecords[0]) {
      return NextResponse.json({ error: "This OPD Visit already has an invoice. Add further charges only before invoice generation." }, { status: 400 });
    }

    const investigationIds: number[] = Array.from(
      new Set<number>(
        requested
          .map((item): number => Number(item?.investigationId))
          .filter((id): id is number => Number.isInteger(id) && id > 0)
      )
    );
    if (!investigationIds.length) {
      return NextResponse.json({ error: "No valid Investigation Master entries were supplied." }, { status: 400 });
    }

    const masters = await prisma.investigationMaster.findMany({
      where: { id: { in: investigationIds }, active: true },
      select: { id: true, code: true, name: true, rate: true },
    });
    if (masters.length !== investigationIds.length) {
      return NextResponse.json({ error: "One or more selected investigations are missing or inactive in Investigation Master." }, { status: 400 });
    }

    const subtotal = masters.reduce((sum, item) => sum + Number(item.rate || 0), 0);
    const discount = discountType === "PERCENT"
      ? Math.min(subtotal, Math.max(0, (subtotal * requestedDiscount) / 100))
      : Math.min(subtotal, Math.max(0, requestedDiscount));

    const created = await prisma.$transaction(
      masters.map((item) =>
        prisma.investigationOrder.create({
          data: {
            opdVisitId,
            investigationId: item.id,
            investigation: item.name,
            price: Number(item.rate || 0),
            discountType,
            discountValue: masters.length === 1 ? discount : 0,
            netAmount: masters.length === 1 ? Math.max(0, Number(item.rate || 0) - discount) : Number(item.rate || 0),
            paymentStatus: "UNPAID",
            status: "ORDERED",
          },
        })
      )
    );

    return NextResponse.json({ createdCount: created.length, subtotal, discount, netAmount: Math.max(0, subtotal - discount), orders: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/opd/investigation-billing failed:", error);
    return NextResponse.json({ error: "Unable to save investigation orders." }, { status: 500 });
  }
}
