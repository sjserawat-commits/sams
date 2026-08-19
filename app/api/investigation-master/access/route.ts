import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const requesterKey = String(body.requesterKey || "").trim();
    if (!requesterKey || requesterKey.length < 16) {
      return NextResponse.json({ error: "A valid Lab Room requester key is required." }, { status: 400 });
    }

    const existing = await prisma.investigationMasterChangeRequest.findFirst({
      where: {
        action: "ACCESS_REQUEST",
        requestedBy: "LAB_ROOM",
        status: "PENDING",
        proposedData: { contains: requesterKey },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      return NextResponse.json({ requestId: existing.id, status: existing.status });
    }

    const change = await prisma.investigationMasterChangeRequest.create({
      data: {
        action: "ACCESS_REQUEST",
        requestedBy: "LAB_ROOM",
        proposedData: JSON.stringify({ requesterKey, scope: "INVESTIGATION_MASTER_ONLY", source: "LAB_ROOM_SETTINGS" }),
      },
    });

    return NextResponse.json({ requestId: change.id, status: change.status }, { status: 202 });
  } catch (error) {
    console.error("POST /api/investigation-master/access failed", error);
    return NextResponse.json({ error: "Unable to send the settings access request to Admin." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("requestId"));
    const requesterKey = String(searchParams.get("requesterKey") || "").trim();
    if (!Number.isInteger(id) || id <= 0 || !requesterKey) {
      return NextResponse.json({ error: "Request id and requester key are required." }, { status: 400 });
    }

    const item = await prisma.investigationMasterChangeRequest.findUnique({ where: { id } });
    if (!item || item.action !== "ACCESS_REQUEST") return NextResponse.json({ error: "Access request not found." }, { status: 404 });

    let data: { requesterKey?: string; scope?: string } = {};
    try { data = JSON.parse(item.proposedData); } catch { /* invalid legacy request */ }
    if (data.requesterKey !== requesterKey) return NextResponse.json({ error: "Access request does not match this Lab Room session." }, { status: 403 });

    return NextResponse.json({ requestId: item.id, status: item.status, reviewNote: item.reviewNote || null, reviewedAt: item.reviewedAt || null });
  } catch (error) {
    console.error("GET /api/investigation-master/access failed", error);
    return NextResponse.json({ error: "Unable to check settings access status." }, { status: 500 });
  }
}
