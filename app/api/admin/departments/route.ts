import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true, active: true, _count: { select: { doctors: true, opdVisits: true } } },
    });
    return NextResponse.json(departments, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load departments." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const code = String(body.code || "").trim().toUpperCase();
    if (!name || !code) return NextResponse.json({ error: "Department name and code are required." }, { status: 400 });
    const department = await prisma.department.create({ data: { name, code, active: true } });
    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create department." }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const id = Number(body.id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Valid department id is required." }, { status: 400 });
    const data: { name?: string; code?: string; active?: boolean } = {};
    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.code !== undefined) data.code = String(body.code).trim().toUpperCase();
    if (body.active !== undefined) data.active = Boolean(body.active);
    const department = await prisma.department.update({ where: { id }, data });
    return NextResponse.json(department);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update department." }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const id = Number(body.id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Valid department id is required." }, { status: 400 });
    const linked = await prisma.opDVisit.count({ where: { departmentId: id } });
    if (linked > 0) return NextResponse.json({ error: "This department is linked to existing Visits. Deactivate it instead of deleting it." }, { status: 409 });
    await prisma.department.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to deactivate department." }, { status: 400 });
  }
}
