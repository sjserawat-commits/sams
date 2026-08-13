import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.investigationOrder.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Investigation billing error:", error);
    return NextResponse.json(
      { error: "Unable to load investigation billing." },
      { status: 500 }
    );
  }
}
