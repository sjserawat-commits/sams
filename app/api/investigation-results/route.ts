import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const visitId = Number(new URL(request.url).searchParams.get("opdVisitId"));
    if (!Number.isInteger(visitId) || visitId <= 0) return NextResponse.json({ error: "A valid OPD visit ID is required." }, { status: 400 });
    const rows = await prisma.investigationOrder.findMany({
      where: { opdVisitId: visitId },
      include: { master: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Investigation results GET failed:", error);
    return NextResponse.json({ error: "Unable to load investigation results." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const id = Number(body.id);
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Invalid investigation order ID." }, { status: 400 });
    const order = await prisma.investigationOrder.update({
      where: { id },
      data: {
        reportText: body.reportText ? String(body.reportText) : null,
        reportedAt: body.reportText ? new Date() : null,
        status: body.reportText ? "COMPLETED" : String(body.status || "ORDERED"),
      },
      include: { master: true },
    });
    return NextResponse.json(order);
  } catch (error) {
    console.error("Investigation result update failed:", error);
    return NextResponse.json({ error: "Unable to save investigation result." }, { status: 500 });
  }
}
