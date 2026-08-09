import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First name and last name are required." },
        { status: 400 }
      );
    }

    const patientCount = await prisma.patient.count();

    const patientId = `SAMS-${String(patientCount + 1).padStart(4, "0")}`;

    const patient = await prisma.patient.create({
      data: {
        patientId,
        firstName,
        lastName,
        dateOfBirth: body.dateOfBirth
          ? new Date(body.dateOfBirth)
          : null,
        gender: body.gender || null,
        phone: body.phone || null,
        address: body.address || null,
      },
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error("Patient registration error:", error);

    return NextResponse.json(
      { error: "Unable to register patient." },
      { status: 500 }
    );
  }
}
