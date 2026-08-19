import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const requests = await prisma.investigationMasterChangeRequest.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "desc" } });
    const enriched = await Promise.all(requests.map(async (item) => {
      const master = item.investigationId ? await prisma.investigationMaster.findUnique({ where: { id: item.investigationId }, select: { id: true, name: true, code: true } }) : null;
      let proposedData: Record<string, unknown> = {};
      try { proposedData = JSON.parse(item.proposedData); } catch { proposedData = {}; }
      return { ...item, proposedData, current: master };
    }));
    return NextResponse.json(enriched);
  } catch (error) {
    console.error("GET investigation master approvals failed", error);
    return NextResponse.json({ error: "Unable to load approval requests." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body.id);
    const decision = String(body.decision || "").toUpperCase();
    const reviewer = String(body.reviewedBy || "ADMIN").trim() || "ADMIN";
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Valid approval request id is required." }, { status: 400 });
    if (!["APPROVE", "REJECT"].includes(decision)) return NextResponse.json({ error: "Decision must be APPROVE or REJECT." }, { status: 400 });

    const change = await prisma.investigationMasterChangeRequest.findUnique({ where: { id } });
    if (!change || change.status !== "PENDING") return NextResponse.json({ error: "Approval request is not pending." }, { status: 404 });

    if (change.action === "ACCESS_REQUEST") {
      await prisma.investigationMasterChangeRequest.update({
        where: { id },
        data: {
          status: decision === "APPROVE" ? "APPROVED" : "REJECTED",
          reviewedBy: reviewer,
          reviewedAt: new Date(),
          reviewNote: String(body.reviewNote || (decision === "APPROVE" ? "Investigation Master settings access approved by administrator." : "Investigation Master settings access rejected by administrator.")),
        },
      });
      return NextResponse.json({ status: decision === "APPROVE" ? "APPROVED" : "REJECTED", scope: "INVESTIGATION_MASTER_ONLY" });
    }

    const data = JSON.parse(change.proposedData);

    if (decision === "REJECT") {
      await prisma.investigationMasterChangeRequest.update({ where: { id }, data: { status: "REJECTED", reviewedBy: reviewer, reviewedAt: new Date(), reviewNote: String(body.reviewNote || "Rejected by administrator") } });
      return NextResponse.json({ status: "REJECTED" });
    }

    if (change.action === "CREATE") {
      const existing = await prisma.investigationMaster.findFirst({ where: { name: data.name, active: true } });
      if (existing) return NextResponse.json({ error: `Investigation already exists: ${existing.name}.` }, { status: 409 });
      await prisma.investigationMaster.create({ data: { code: data.code, name: data.name, shortName: data.shortName ?? null, category: data.category, department: data.department ?? null, specimen: data.specimen ?? null, method: data.method ?? null, unit: data.unit ?? null, referenceRange: data.referenceRange ?? null, maleReferenceRange: data.maleReferenceRange ?? null, femaleReferenceRange: data.femaleReferenceRange ?? null, ageSpecificRange: data.ageSpecificRange ?? null, criticalValue: data.criticalValue ?? null, smsLabDepartment: data.smsLabDepartment ?? null, aliases: data.aliases ?? null, rate: Number(data.rate) || 0, active: data.active !== false } });
    } else {
      if (!change.investigationId) return NextResponse.json({ error: "Update request has no investigation id." }, { status: 400 });
      const duplicate = await prisma.investigationMaster.findFirst({ where: { active: true, NOT: { id: change.investigationId }, name: data.name } });
      if (duplicate) return NextResponse.json({ error: `Another investigation already uses this name: ${duplicate.name}.` }, { status: 409 });
      await prisma.investigationMaster.update({ where: { id: change.investigationId }, data: { name: data.name, category: data.category, rate: Number(data.rate) || 0, active: Boolean(data.active), shortName: data.shortName ?? null, department: data.department ?? null, specimen: data.specimen ?? null, method: data.method ?? null, unit: data.unit ?? null, referenceRange: data.referenceRange ?? null, maleReferenceRange: data.maleReferenceRange ?? null, femaleReferenceRange: data.femaleReferenceRange ?? null, ageSpecificRange: data.ageSpecificRange ?? null, criticalValue: data.criticalValue ?? null, smsLabDepartment: data.smsLabDepartment ?? null, aliases: data.aliases ?? null, pricingLastVerifiedAt: new Date() } });
    }

    await prisma.investigationMasterChangeRequest.update({ where: { id }, data: { status: "APPROVED", reviewedBy: reviewer, reviewedAt: new Date(), reviewNote: String(body.reviewNote || "Approved by administrator") } });
    return NextResponse.json({ status: "APPROVED" });
  } catch (error) {
    console.error("PATCH investigation master approvals failed", error);
    return NextResponse.json({ error: "Unable to process approval request." }, { status: 500 });
  }
}
