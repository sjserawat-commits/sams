import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Human-facing investigation names are the canonical identity in the master.
 * Different source files often use punctuation, casing or spacing variations
 * (e.g. "Anti-CCP" vs "Anti CCP"). Keep one orderable master row per name.
 */
function normalizeName(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function score(row: {
  smsBenchmarkRate: number | null;
  corporateBenchmarkRate: number | null;
  rate: number;
  id: number;
}) {
  return [
    row.smsBenchmarkRate != null && row.smsBenchmarkRate > 0 ? 4 : 0,
    row.corporateBenchmarkRate != null && row.corporateBenchmarkRate > 0 ? 2 : 0,
    row.rate > 0 ? 1 : 0,
    -row.id / 1_000_000_000,
  ].reduce((a, b) => a + b, 0);
}

function dedupeRows<T extends {
  id: number;
  name: string;
  smsBenchmarkRate: number | null;
  corporateBenchmarkRate: number | null;
  rate: number;
}>(rows: T[]) {
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
      where: {
        active: true,
        ...(category ? { category } : {}),
        ...(department ? { department: { contains: department } } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { shortName: { contains: q } },
                { code: { contains: q } },
                { aliases: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy: [{ category: "asc" }, { name: "asc" }, { id: "asc" }],
    });

    return NextResponse.json(dedupeRows(rows));
  } catch (error) {
    console.error("GET /api/investigation-master failed:", error);
    return NextResponse.json(
      { error: "Investigation Master is unavailable. Restart the SAMS server so the Investigation Master seed can run." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const category = String(body.category ?? "").trim();

    if (!name || !category) {
      return NextResponse.json({ error: "Investigation name and category are required." }, { status: 400 });
    }

    const canonicalName = normalizeName(name);
    const existing = await prisma.investigationMaster.findMany({ where: { active: true } });
    const duplicate = existing.find((row) => normalizeName(row.name) === canonicalName);
    if (duplicate) {
      return NextResponse.json(
        { error: `Investigation already exists: ${duplicate.name} (${duplicate.code}). Duplicate names are not allowed in Investigation Master.` },
        { status: 409 }
      );
    }

    const code = String(body.code ?? name)
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 50);

    const row = await prisma.investigationMaster.create({
      data: {
        code: code || `INV_${Date.now()}`,
        name,
        shortName: body.shortName ? String(body.shortName).trim() : null,
        category,
        department: body.department ? String(body.department).trim() : null,
        specimen: body.specimen ? String(body.specimen).trim() : null,
        method: body.method ? String(body.method).trim() : null,
        unit: body.unit ? String(body.unit).trim() : null,
        referenceRange: body.referenceRange ? String(body.referenceRange).trim() : null,
        maleReferenceRange: body.maleReferenceRange ? String(body.maleReferenceRange).trim() : null,
        femaleReferenceRange: body.femaleReferenceRange ? String(body.femaleReferenceRange).trim() : null,
        ageSpecificRange: body.ageSpecificRange ? String(body.ageSpecificRange).trim() : null,
        criticalValue: body.criticalValue ? String(body.criticalValue).trim() : null,
        smsLabDepartment: body.smsLabDepartment ? String(body.smsLabDepartment).trim() : null,
        aliases: body.aliases ? String(body.aliases).trim() : null,
        rate: Number.isFinite(Number(body.rate)) ? Number(body.rate) : 0,
        smsBenchmarkRate: body.smsBenchmarkRate != null && Number.isFinite(Number(body.smsBenchmarkRate)) ? Number(body.smsBenchmarkRate) : null,
        corporateBenchmarkRate: body.corporateBenchmarkRate != null && Number.isFinite(Number(body.corporateBenchmarkRate)) ? Number(body.corporateBenchmarkRate) : null,
        pricingLastVerifiedAt: body.pricingLastVerifiedAt ? new Date(body.pricingLastVerifiedAt) : null,
        active: body.active !== false,
      },
    });

    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    console.error("POST /api/investigation-master failed:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
