import { NextRequest, NextResponse } from "next/server";

function base64urlDecode(value: string) {
  const s = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const bytes = atob(s);
  return new Uint8Array([...bytes].map(c => c.charCodeAt(0)));
}

async function validSession(value: string | undefined) {
  try {
    const secret = process.env.SAMS_SESSION_SECRET;
    if (!secret || !value) return null;
    const [payload, sig] = value.split(".");
    if (!payload || !sig) return null;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      base64urlDecode(sig),
      enc.encode(payload),
    );
    if (!ok) return null;
    const data = JSON.parse(new TextDecoder().decode(base64urlDecode(payload)));
    if (!data.exp || Date.now() >= data.exp) return null;
    return data as { userId: number; username: string; role: string; exp: number };
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Public authentication/setup pages and authentication APIs must remain
  // reachable before a session exists. Password recovery is intentionally
  // public because it is the mechanism used when the administrator is locked out.
  if (
    path.startsWith("/_next") ||
    path.startsWith("/favicon") ||
    path === "/login" ||
    path === "/forgot-password" ||
    path.startsWith("/setup") ||
    path.startsWith("/api/auth/")
  ) {
    return NextResponse.next();
  }

  const session = await validSession(req.cookies.get("sams_session")?.value);
  if (!session) {
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (path.startsWith("/admin") && !(["SUPER_ADMIN", "ADMIN"].includes(session.role))) {
    return NextResponse.json({ error: "Administrator permission required." }, { status: 403 });
  }

  const res = NextResponse.next();
  res.headers.set("x-sams-user", session.username);
  res.headers.set("x-sams-role", session.role);
  return res;
}

export const config = { matcher: ["/((?!.*\\..*).*)"] };
