import { NextRequest, NextResponse } from "next/server";
import { ensureAuthTables, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    await ensureAuthTables();
    const body = await req.json();
    const username = String(body.username || "").trim().toLowerCase();
    const recoveryKey = String(body.recoveryKey || "");
    const newPassword = String(body.newPassword || "");
    const confirmPassword = String(body.confirmPassword || "");
    if (!username || !recoveryKey || !newPassword || !confirmPassword) return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    if (newPassword.length < 12) return NextResponse.json({ error: "New password must be at least 12 characters." }, { status: 400 });
    if (newPassword !== confirmPassword) return NextResponse.json({ error: "New passwords do not match." }, { status: 400 });
    const users = await prisma.$queryRawUnsafe<Array<{ id: number; active: number; recoveryKeyHash: string | null }>>(`SELECT "id","active","recoveryKeyHash" FROM "SamsUser" WHERE "username"=? LIMIT 1`, username);
    if (!users.length) return NextResponse.json({ error: "User not found." }, { status: 404 });
    if (!users[0].active) return NextResponse.json({ error: "This user account is inactive." }, { status: 403 });
    const valid = !!users[0].recoveryKeyHash && verifyPassword(recoveryKey, users[0].recoveryKeyHash);
    if (!valid) return NextResponse.json({ error: "Invalid recovery key. Use the recovery key generated during administrator setup." }, { status: 403 });
    await prisma.$executeRawUnsafe(`UPDATE "SamsUser" SET "passwordHash"=?,"updatedAt"=CURRENT_TIMESTAMP WHERE "id"=?`, hashPassword(newPassword), users[0].id);
    return NextResponse.json({ ok: true, message: "Password updated. You can now sign in." });
  } catch (error) {
    console.error("SAMS password reset failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to reset password." }, { status: 500 });
  }
}
