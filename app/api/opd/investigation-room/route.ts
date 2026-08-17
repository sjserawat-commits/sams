import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.investigationOrder.findMany({
      where: {
        status: {
          in: ["ORDERED", "IN_PROGRESS"],
        },
      },
      include: {
        opdVisit: {
          include: {
            patient: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Investigation room error:", error);
    return NextResponse.json(
      { error: "Unable to load investigation orders." },
      { status: 500 }
    );
  }
}
