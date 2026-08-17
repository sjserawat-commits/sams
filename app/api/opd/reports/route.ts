import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const opdVisitId = Number(searchParams.get("opdVisitId"));

    if (!Number.isInteger(opdVisitId)) {
      return NextResponse.json(
        { error: "Invalid OPD visit ID." },
        { status: 400 }
      );
    }

    const reports = await prisma.investigationOrder.findMany({
      where: {
        opdVisitId,
        status: "COMPLETED",
      },
      orderBy: { reportedAt: "desc" },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Investigation reports error:", error);
    return NextResponse.json(
      { error: "Unable to load investigation reports." },
      { status: 500 }
    );
  }
}
