import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function appointmentNo() {
  return `APT-${Date.now().toString().slice(-8)}`;
}

export async function GET() {
  const appointments = await prisma.appointment.findMany({ orderBy: [{ appointmentDate: "asc" }, { appointmentTime: "asc" }, { id: "asc" }] });
  return NextResponse.json(appointments);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const required = ["patientName", "mobile", "doctorName", "appointmentDate", "appointmentTime"];
    for (const key of required) if (!String(body?.[key] || "").trim()) return NextResponse.json({ error: `${key} is required.` }, { status: 400 });
    const created = await prisma.appointment.create({
      data: {
        appointmentNo: appointmentNo(),
        patientId: body.patientId ? Number(body.patientId) : null,
        patientType: body.patientType === "existing" ? "EXISTING" : "NEW",
        patientName: String(body.patientName).trim(),
        mobile: String(body.mobile).trim(),
        dob: body.dob ? new Date(body.dob) : null,
        gender: body.gender ? String(body.gender) : null,
        email: body.email ? String(body.email) : null,
        reason: body.reason ? String(body.reason) : null,
        departmentId: body.departmentId ? Number(body.departmentId) : null,
        departmentName: body.departmentName ? String(body.departmentName) : null,
        doctorId: body.doctorId ? Number(body.doctorId) : null,
        doctorName: String(body.doctorName).trim(),
        appointmentDate: String(body.appointmentDate),
        appointmentTime: String(body.appointmentTime),
        source: body.source === "RECEPTION" ? "RECEPTION" : "ONLINE",
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Appointment create failed", error);
    return NextResponse.json({ error: "Unable to create appointment." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body?.id);
    if (!id) return NextResponse.json({ error: "Appointment id is required." }, { status: 400 });
    const updated = await prisma.appointment.update({ where: { id }, data: { ...(body.status ? { status: String(body.status) } : {}), ...(body.opdVisitId ? { opdVisitId: Number(body.opdVisitId) } : {}) } });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Appointment update failed", error);
    return NextResponse.json({ error: "Unable to update appointment." }, { status: 500 });
  }
}
