import { NextRequest, NextResponse } from "next/server";
import { ensureAuthTables, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    await ensureAuthTables();

    const body = await req.json();
    const username = String(body.username || "").trim().toLowerCase();
    const newPassword = String(body.newPassword || "");
    const confirmPassword = String(body.confirmPassword || "");

    if (!username || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (newPassword.length < 12) {
      return NextResponse.json(
        { error: "New password must be at least 12 characters." },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "New passwords do not match." }, { status: 400 });
    }

    const users = await prisma.$queryRawUnsafe<
      Array<{ id: number; active: number }>
    >(
      `SELECT "id","active" FROM "SamsUser" WHERE "username"=? LIMIT 1`,
      username,
    );

    // Prisma db push can recreate the auth table during first-run development.
    // If the database is completely empty, allow the standard admin account
    // to be bootstrapped directly from the simple password-reset screen.
    if (!users.length) {
      const countRows = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
        `SELECT COUNT(*) as count FROM "SamsUser"`,
      );
      const userCount = Number(countRows[0]?.count ?? 0);

      if (userCount === 0 && username === "admin") {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "SamsUser" ("username","displayName","passwordHash","role","active","createdAt","updatedAt") VALUES (?,?,?,?,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`,
          "admin",
          "SAMS Administrator",
          hashPassword(newPassword),
          "SUPER_ADMIN",
        );

        return NextResponse.json({
          ok: true,
          message: "Administrator password created. You can now sign in.",
        });
      }

      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (!users[0].active) {
      return NextResponse.json({ error: "This user account is inactive." }, { status: 403 });
    }

    await prisma.$executeRawUnsafe(
      `UPDATE "SamsUser" SET "passwordHash"=?,"updatedAt"=CURRENT_TIMESTAMP WHERE "id"=?`,
      hashPassword(newPassword),
      users[0].id,
    );

    return NextResponse.json({
      ok: true,
      message: "Password updated. You can now sign in.",
    });
  } catch (error) {
    console.error("SAMS password reset failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to reset password." },
      { status: 500 },
    );
  }
}
