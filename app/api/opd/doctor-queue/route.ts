import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const visits = await prisma.oPDVisit.findMany({
      include: { patient: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(visits);
  } catch (error) {
    console.error("Doctor queue error:", error);
    return NextResponse.json(
      { error: "Unable to load doctor queue." },
      { status: 500 }
    );
  }
}
