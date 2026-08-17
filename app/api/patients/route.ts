import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizeAadhaar(value: unknown) {
  return String(value || "").replace(/\D/g, "");
}

function maskAadhaar(value: string | null | undefined) {
  if (!value) return null;
  return `XXXX XXXX ${value.slice(-4)}`;
}

async function ensurePatientTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Patient" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "patientId" TEXT NOT NULL,
      "firstName" TEXT NOT NULL,
      "lastName" TEXT NOT NULL,
      "dateOfBirth" DATETIME,
      "gender" TEXT,
      "phone" TEXT,
      "aadhaarNumber" TEXT,
      "address" TEXT,
      "emergencyContact" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Patient_patientId_key" ON "Patient"("patientId");`);
}

export async function GET() {
  try {
    await ensurePatientTable();
    const patients = await prisma.patient.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, patientId: true, firstName: true, lastName: true, gender: true, phone: true, dateOfBirth: true, aadhaarNumber: true } });
    return NextResponse.json(patients.map((patient) => ({ ...patient, aadhaarNumber: maskAadhaar(patient.aadhaarNumber) })));
  } catch (error) {
    console.error("Patient listing error:", error);
    return NextResponse.json({ error: "Unable to load patients." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensurePatientTable();
    const body = await request.json();
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const aadhaarNumber = normalizeAadhaar(body.aadhaarNumber);
    const phone = String(body.phone || "").replace(/\D/g, "");
    const emergencyContact = String(body.emergencyContact || "").trim();

    if (!firstName || !lastName) return NextResponse.json({ error: "First name and last name are required." }, { status: 400 });
    if (aadhaarNumber && aadhaarNumber.length !== 12) return NextResponse.json({ error: "Aadhaar number must contain exactly 12 digits." }, { status: 400 });
    if (phone && (phone.length < 10 || phone.length > 15)) return NextResponse.json({ error: "Please enter a valid mobile number." }, { status: 400 });

    if (aadhaarNumber) {
      const duplicate = await prisma.patient.findFirst({ where: { aadhaarNumber }, select: { patientId: true } });
      if (duplicate) return NextResponse.json({ error: "A patient with this Aadhaar number is already registered.", code: "DUPLICATE_AADHAAR", patientId: duplicate.patientId }, { status: 409 });
    }

    const lastPatient = await prisma.patient.findFirst({ orderBy: { id: "desc" }, select: { patientId: true } });
    const lastNumber = Number(lastPatient?.patientId?.match(/(\d+)$/)?.[1] || 0);
    const patientId = `SAMS-${String(lastNumber + 1).padStart(4, "0")}`;
    const patient = await prisma.patient.create({ data: { patientId, firstName, lastName, dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null, gender: body.gender || null, phone: phone || null, aadhaarNumber: aadhaarNumber || null, address: String(body.address || "").trim() || null, emergencyContact: emergencyContact || null }, select: { id: true, patientId: true, firstName: true, lastName: true, dateOfBirth: true, gender: true, phone: true, aadhaarNumber: true, address: true, emergencyContact: true } });
    return NextResponse.json({ ...patient, aadhaarNumber: maskAadhaar(patient.aadhaarNumber) }, { status: 201 });
  } catch (error) {
    console.error("Patient registration error:", error);
    const message = error instanceof Error ? error.message : "Unable to register patient.";
    return NextResponse.json({ error: process.env.NODE_ENV === "development" ? message : "Unable to register patient." }, { status: 500 });
  }
}
