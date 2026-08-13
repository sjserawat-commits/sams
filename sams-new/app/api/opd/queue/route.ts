import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const visits = await prisma.oPDVisit.findMany({
      where: {
        status: {
          in: ["WAITING", "IN_CONSULTATION"],
        },
      },
      include: {
        patient: true,
      },
      orderBy: {
        tokenNumber: "asc",
      },
    });

    return NextResponse.json(visits);
  } catch (error) {
    console.error("OPD queue error:", error);
    return NextResponse.json(
      { error: "Unable to load OPD queue." },
      { status: 500 }
    );
  }
}
