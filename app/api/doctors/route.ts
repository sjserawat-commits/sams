import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentIdParam = searchParams.get("departmentId");

    const departmentId = departmentIdParam
      ? Number(departmentIdParam)
      : null;

    const doctors = await prisma.doctor.findMany({
      where: {
        active: true,
        ...(departmentId !== null && Number.isInteger(departmentId)
          ? { departmentId }
          : {}),
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        qualification: true,
        introduction: true,
        photoUrl: true,
        departmentId: true,
        active: true,
      },
    });
    return NextResponse.json(doctors);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const doctor = await prisma.doctor.create({
      data: {
        name: body.name,
        qualification: body.qualification || null,
        introduction: body.introduction || null,
        photoUrl: body.photoUrl || null,
        departmentId: body.departmentId
          ? Number(body.departmentId)
          : null,
        active: true,
      },
    });

    return NextResponse.json(doctor, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const doctor = await prisma.doctor.update({
      where: { id: Number(body.id) },
      data: {
        name: body.name,
        qualification: body.qualification || null,
        introduction: body.introduction || null,
        photoUrl: body.photoUrl || null,
        departmentId: body.departmentId
          ? Number(body.departmentId)
          : null,
        active: body.active ?? true,
      },
    });

    return NextResponse.json(doctor);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    await prisma.doctor.update({
      where: { id: Number(body.id) },
      data: { active: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
