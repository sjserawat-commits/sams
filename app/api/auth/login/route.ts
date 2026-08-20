import { NextRequest, NextResponse } from "next/server";
import { ensureAuthTables, verifyPassword, sessionCookieValue, audit, type SamsRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    await ensureAuthTables();
    const { username, password } = await req.json();
    const rows = await prisma.$queryRawUnsafe<Array<{id:number;username:string;displayName:string;passwordHash:string;role:string;active:boolean;forcePasswordChange:boolean}>>(`SELECT "id","username","displayName","passwordHash","role","active","forcePasswordChange" FROM "SamsUser" WHERE "username"=? LIMIT 1`, String(username || "").trim().toLowerCase());
    const user = rows[0];
    if (!user || !user.active || !verifyPassword(String(password || ""), user.passwordHash)) return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    const role = user.role as SamsRole;
    const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
    const sessionId = crypto.randomUUID();
    await prisma.$executeRawUnsafe(`INSERT INTO "SamsSession" ("id","userId","expiresAt") VALUES (?,?,?)`, sessionId, user.id, new Date(expiresAt).toISOString());
    await audit(user.id, user.username, "LOGIN", "SamsSession", `session:${sessionId}`);
    const response = NextResponse.json({ ok: true, requiresPasswordChange: Boolean(user.forcePasswordChange), user: { id:user.id, username:user.username, displayName:user.displayName, role } });
    response.cookies.set("sams_session", sessionCookieValue(user.id, user.username, role, expiresAt, sessionId), { httpOnly:true, secure:process.env.NODE_ENV === "production", sameSite:"lax", path:"/", maxAge:8*60*60 });
    return response;
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to sign in." }, { status: 500 }); }
}
