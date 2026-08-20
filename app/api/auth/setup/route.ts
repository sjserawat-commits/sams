import { NextRequest, NextResponse } from "next/server";
import { ensureAuthTables, generateRecoveryKey, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    await ensureAuthTables();
    const body = await req.json();
    const username = String(body.username || "admin").trim().toLowerCase();
    const password = String(body.password || "");
    const displayName = String(body.displayName || "SAMS Administrator").trim();
    const setupKey = String(body.setupKey || "");
    const expectedKey = process.env.SAMS_SETUP_KEY;
    if (!expectedKey || setupKey !== expectedKey) return NextResponse.json({ error: "Invalid setup key." }, { status: 403 });
    if (password.length < 12) return NextResponse.json({ error: "Password must be at least 12 characters." }, { status: 400 });
    const existing = await prisma.$queryRawUnsafe<Array<{ id: number }>>(`SELECT "id" FROM "SamsUser" WHERE "username"=? LIMIT 1`, username);
    if (existing.length) return NextResponse.json({ error: "Username already exists." }, { status: 409 });
    const recoveryKey = generateRecoveryKey();
    await prisma.$executeRawUnsafe(`INSERT INTO "SamsUser" ("username","displayName","passwordHash","recoveryKeyHash","role","createdAt","updatedAt") VALUES (?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`, username, displayName, hashPassword(password), hashPassword(recoveryKey), "SUPER_ADMIN");
    return NextResponse.json({ ok: true, message: "Administrator created. Save your recovery key before continuing.", recoveryKey }, { status: 201 });
  } catch (error) {
    console.error("SAMS first-run setup failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create administrator." }, { status: 500 });
  }
}
