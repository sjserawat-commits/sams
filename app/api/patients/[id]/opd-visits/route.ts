import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patientId = Number(id);
    if (!Number.isInteger(patientId)) return NextResponse.json({ error: "Invalid patient ID." }, { status: 400 });

    const visits = await prisma.oPDVisit.findMany({
      where: { patientId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        tokenNumber: true,
        visitType: true,
        status: true,
        createdAt: true,
        departmentId: true,
        doctorId: true,
        departmentMaster: { select: { name: true } },
        doctor: { select: { name: true } },
      },
    });

    return NextResponse.json({ visits });
  } catch (error) {
    console.error("Patient OPD visits lookup failed:", error);
    return NextResponse.json({ error: "Unable to load OPD visits." }, { status: 500 });
  }
}
