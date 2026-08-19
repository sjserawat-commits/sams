import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizeName(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}
function score(row: { smsBenchmarkRate: number | null; corporateBenchmarkRate: number | null; rate: number; id: number }) {
  return [row.smsBenchmarkRate != null && row.smsBenchmarkRate > 0 ? 4 : 0, row.corporateBenchmarkRate != null && row.corporateBenchmarkRate > 0 ? 2 : 0, row.rate > 0 ? 1 : 0, -row.id / 1_000_000_000].reduce((a, b) => a + b, 0);
}
function dedupeRows<T extends { id: number; name: string; smsBenchmarkRate: number | null; corporateBenchmarkRate: number | null; rate: number }>(rows: T[]) {
  const winners = new Map<string, T>();
  for (const row of rows) {
    const key = normalizeName(row.name);
    if (!key) continue;
    const current = winners.get(key);
    if (!current || score(row) > score(current)) winners.set(key, row);
  }
  return Array.from(winners.values());
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const category = searchParams.get("category")?.trim() ?? "";
    const department = searchParams.get("department")?.trim() ?? "";
    const rows = await prisma.investigationMaster.findMany({
      where: { active: true, ...(category ? { category } : {}), ...(department ? { department: { contains: department } } : {}), ...(q ? { OR: [{ name: { contains: q } }, { shortName: { contains: q } }, { code: { contains: q } }, { aliases: { contains: q } }] } : {}) },
      orderBy: [{ category: "asc" }, { name: "asc" }, { id: "asc" }],
    });
    return NextResponse.json(dedupeRows(rows));
  } catch (error) {
    console.error("GET /api/investigation-master failed:", error);
    return NextResponse.json({ error: "Investigation Master is unavailable. Restart the SAMS server so the Investigation Master seed can run." }, { status: 500 });
  }
}

/** Changes from the Investigation Master are submitted as requests and never become live until an administrator approves them. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const category = String(body.category ?? "").trim();
    if (!name || !category) return NextResponse.json({ error: "Investigation name and category are required." }, { status: 400 });
    const canonicalName = normalizeName(name);
    const existing = await prisma.investigationMaster.findMany({ where: { active: true } });
    const duplicate = existing.find((row) => normalizeName(row.name) === canonicalName);
    if (duplicate) return NextResponse.json({ error: `Investigation already exists: ${duplicate.name} (${duplicate.code}).` }, { status: 409 });
    const code = String(body.code ?? name).trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 50) || `INV_${Date.now()}`;
    const proposedData = { code, name, shortName: body.shortName || null, category, department: body.department || null, specimen: body.specimen || null, method: body.method || null, unit: body.unit || null, referenceRange: body.referenceRange || null, maleReferenceRange: body.maleReferenceRange || null, femaleReferenceRange: body.femaleReferenceRange || null, ageSpecificRange: body.ageSpecificRange || null, criticalValue: body.criticalValue || null, smsLabDepartment: body.smsLabDepartment || null, aliases: body.aliases || null, rate: Number.isFinite(Number(body.rate)) ? Number(body.rate) : 0, active: body.active !== false };
    const change = await prisma.investigationMasterChangeRequest.create({ data: { action: "CREATE", proposedData: JSON.stringify(proposedData), requestedBy: String(body.requestedBy || "SYSTEM_USER") } });
    return NextResponse.json({ status: "PENDING_APPROVAL", requestId: change.id, message: "Investigation submitted for admin approval. It will not become live until approved." }, { status: 202 });
  } catch (error) {
    console.error("POST /api/investigation-master failed:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body.id);
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "A valid investigation id is required." }, { status: 400 });
    const existing = await prisma.investigationMaster.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Investigation not found." }, { status: 404 });
    const name = body.name != null ? String(body.name).trim() : existing.name;
    const rate = body.rate != null ? Number(body.rate) : existing.rate;
    if (!name) return NextResponse.json({ error: "Investigation name is required." }, { status: 400 });
    if (!Number.isFinite(rate) || rate < 0) return NextResponse.json({ error: "Rate must be a valid non-negative number." }, { status: 400 });
    const canonicalName = normalizeName(name);
    const activeRows = await prisma.investigationMaster.findMany({ where: { active: true, NOT: { id } } });
    const duplicate = activeRows.find((row) => normalizeName(row.name) === canonicalName);
    if (duplicate) return NextResponse.json({ error: `Another investigation already uses this name: ${duplicate.name}.` }, { status: 409 });
    const clean = (value: unknown, current: string | null) => { if (value === undefined) return current; const text = String(value).trim(); return text || null; };
    const proposedData = {
      name, rate,
      category: body.category != null ? String(body.category).trim() : existing.category,
      active: body.active != null ? Boolean(body.active) : existing.active,
      shortName: clean(body.shortName, existing.shortName), department: clean(body.department, existing.department), specimen: clean(body.specimen, existing.specimen), method: clean(body.method, existing.method), unit: clean(body.unit, existing.unit), referenceRange: clean(body.referenceRange, existing.referenceRange), maleReferenceRange: clean(body.maleReferenceRange, existing.maleReferenceRange), femaleReferenceRange: clean(body.femaleReferenceRange, existing.femaleReferenceRange), ageSpecificRange: clean(body.ageSpecificRange, existing.ageSpecificRange), criticalValue: clean(body.criticalValue, existing.criticalValue), smsLabDepartment: clean(body.smsLabDepartment, existing.smsLabDepartment), aliases: clean(body.aliases, existing.aliases),
    };
    const change = await prisma.investigationMasterChangeRequest.create({ data: { investigationId: id, action: "UPDATE", proposedData: JSON.stringify(proposedData), requestedBy: String(body.requestedBy || "SYSTEM_USER") } });
    return NextResponse.json({ status: "PENDING_APPROVAL", requestId: change.id, message: "Master-data change submitted for admin approval. Current live data remains unchanged until approval." }, { status: 202 });
  } catch (error) {
    console.error("PATCH /api/investigation-master failed:", error);
    return NextResponse.json({ error: "Unable to submit investigation master change for approval." }, { status: 500 });
  }
}
