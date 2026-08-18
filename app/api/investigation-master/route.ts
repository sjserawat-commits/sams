import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/investigation-master failed:", error);
    return NextResponse.json({ error: "Investigation Master is unavailable. Restart the SAMS server so the Investigation Master seed can run." }, { status: 500 });
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
