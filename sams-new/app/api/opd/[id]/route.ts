import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const ALLOWED_STATUSES = [
  "WAITING",
  "IN_CONSULTATION",
  "COMPLETED",
  "CANCELLED",
] as const;

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const visitId = Number(id);
    if (!Number.isInteger(visitId)) {
      return NextResponse.json({ error: "Invalid OPD visit ID" }, { status: 400 });
    }

    const visit = await prisma.oPDVisit.findUnique({ where: { id: visitId } });
    if (!visit) {
      return NextResponse.json({ error: "OPD visit not found" }, { status: 404 });
    }

    return NextResponse.json(visit);
  } catch (error) {
    console.error("OPD visit fetch error:", error);
    return NextResponse.json({ error: "Unable to load OPD visit." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const visitId = Number(id);
    const body = await request.json();
    const status = String(body.status || "");

    if (!Number.isInteger(visitId)) {
      return NextResponse.json({ error: "Invalid OPD visit ID" }, { status: 400 });
    }

    if (!ALLOWED_STATUSES.includes(status as (typeof ALLOWED_STATUSES)[number])) {
      return NextResponse.json({ error: "Invalid OPD status" }, { status: 400 });
    }

    const visit = await prisma.oPDVisit.findUnique({ where: { id: visitId } });
    if (!visit) {
      return NextResponse.json({ error: "OPD visit not found" }, { status: 404 });
    }

    const updatedVisit = await prisma.oPDVisit.update({
      where: { id: visitId },
      data: { status },
    });

    return NextResponse.json(updatedVisit);
  } catch (error) {
    console.error("OPD status update error:", error);
    return NextResponse.json(
      { error: "Unable to update OPD visit status." },
      { status: 500 }
    );
  }
}
