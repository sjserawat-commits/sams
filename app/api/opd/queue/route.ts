import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getIndiaDayBounds(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  if (!year || !month || !day) throw new Error("Unable to determine India calendar date.");
  const start = new Date(`${year}-${month}-${day}T00:00:00+05:30`);
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawDepartmentId = searchParams.get("departmentId");
    const rawDoctorId = searchParams.get("doctorId");
    const departmentId = rawDepartmentId ? Number(rawDepartmentId) : null;
    const doctorId = rawDoctorId ? Number(rawDoctorId) : null;
    if (!departmentId || !Number.isInteger(departmentId)) return NextResponse.json({ error: "Department desk is required." }, { status: 400 });
    if (rawDoctorId && !Number.isInteger(doctorId)) return NextResponse.json({ error: "Invalid consultant ID." }, { status: 400 });

    const department = await prisma.department.findUnique({ where: { id: departmentId }, select: { id: true, name: true, code: true } });
    if (!department) return NextResponse.json({ error: "Department not found." }, { status: 404 });

    const doctor = doctorId ? await prisma.doctor.findFirst({ where: { id: doctorId, departmentId, active: true }, select: { id: true, name: true, departmentId: true } }) : null;
    if (doctorId && !doctor) return NextResponse.json({ error: "Consultant not found for this department." }, { status: 404 });

    const { start, end } = getIndiaDayBounds();
    const visits = await prisma.oPDVisit.findMany({
      where: { departmentId, ...(doctorId ? { doctorId } : {}), createdAt: { gte: start, lt: end }, status: { in: ["WAITING", "IN_CONSULTATION", "COMPLETED"] } },
      include: { patient: true },
      orderBy: [{ tokenNumber: "asc" }, { id: "asc" }],
    });

    return NextResponse.json({ department, doctor, visits });
  } catch (error) {
    console.error("OPD queue error:", error);
    return NextResponse.json({ error: "Unable to load OPD queue." }, { status: 500 });
  }
}
