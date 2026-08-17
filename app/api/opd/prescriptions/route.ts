import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const opdVisitId = Number(body.opdVisitId);
    const medicines = Array.isArray(body.medicines) ? body.medicines : [];

    if (!Number.isInteger(opdVisitId) || medicines.length === 0) {
      return NextResponse.json(
        { error: "OPD visit and medicines are required." },
        { status: 400 }
      );
    }

    const visit = await prisma.oPDVisit.findUnique({
      where: { id: opdVisitId },
    });

    if (!visit) {
      return NextResponse.json(
        { error: "OPD visit not found." },
        { status: 404 }
      );
    }

    const prescriptions = [];

    for (const medicine of medicines) {
      const prescription = await prisma.prescription.create({
        data: {
          opdVisitId,
          medicineName: String(medicine.medicineName),
          dose: medicine.dose || null,
          frequency: medicine.frequency || null,
          duration: medicine.duration || null,
          instructions: medicine.instructions || null,
          status: "ACTIVE",
        },
      });

      prescriptions.push(prescription);
    }

    return NextResponse.json(prescriptions, { status: 201 });
  } catch (error) {
    console.error("Prescription error:", error);
    return NextResponse.json(
      { error: "Unable to save prescription." },
      { status: 500 }
    );
  }
}
