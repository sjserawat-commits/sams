import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureAuthTables, audit } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function POST() { try { await ensureAuthTables(); const c=await cookies(); c.set("sams_session","",{httpOnly:true,expires:new Date(0),path:"/"}); return NextResponse.json({ok:true}); } catch { return NextResponse.json({ok:true}); } }
