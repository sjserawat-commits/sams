import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function startOfTomorrow() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
}

export async function GET() {
  try {
    const today = startOfToday();
    const tomorrow = startOfTomorrow();

    const [patientsToday, encountersToday, diagnosesToday] = await Promise.all([
      prisma.patient.count({
        where: { createdAt: { gte: today, lt: tomorrow } },
      }),
      prisma.clinicalEncounter.count({
        where: { encounterDate: { gte: today, lt: tomorrow } },
      }),
      prisma.clinicalEncounter.count({
        where: {
          encounterDate: { gte: today, lt: tomorrow },
          diagnosis: { not: null },
        },
      }),
    ]);

    return NextResponse.json({
      patientsToday,
      encountersToday,
      diagnosesToday,
      systemStatus: "Operational",
    });
  } catch (error) {
    console.error("Home summary error:", error);
    return NextResponse.json(
      { error: "Unable to load home summary." },
      { status: 500 }
    );
  }
}
