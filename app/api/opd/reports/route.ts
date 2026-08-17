import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const opdVisitIdParam = searchParams.get("opdVisitId");
    const hid = String(searchParams.get("hid") || "").trim();

    if (opdVisitIdParam) {
      const opdVisitId = Number(opdVisitIdParam);
      if (!Number.isInteger(opdVisitId)) {
        return NextResponse.json({ error: "Invalid OPD visit ID." }, { status: 400 });
      }

      const reports = await prisma.investigationOrder.findMany({
        where: { opdVisitId, status: "COMPLETED" },
        orderBy: { reportedAt: "desc" },
        include: {
          opdVisit: {
            select: {
              id: true,
              tokenNumber: true,
              patientId: true,
              patient: { select: { id: true, patientId: true, firstName: true, lastName: true } },
            },
          },
        },
      });

      return NextResponse.json({ reports });
    }

    if (hid) {
      const reports = await prisma.investigationOrder.findMany({
        where: {
          status: "COMPLETED",
          opdVisit: { patient: { patientId: hid } },
        },
        orderBy: { reportedAt: "desc" },
        include: {
          opdVisit: {
            select: {
              id: true,
              tokenNumber: true,
              patientId: true,
              patient: { select: { id: true, patientId: true, firstName: true, lastName: true } },
            },
          },
        },
      });

      return NextResponse.json({ reports });
    }

    return NextResponse.json({ error: "OPD Visit ID or HID is required." }, { status: 400 });
  } catch (error) {
    console.error("Investigation reports error:", error);
    return NextResponse.json({ error: "Unable to load investigation reports." }, { status: 500 });
  }
}
