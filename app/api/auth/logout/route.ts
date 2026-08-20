import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureAuthTables, audit, verifySessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function POST(){try{await ensureAuthTables();const c=await cookies();const s=verifySessionCookie(c.get("sams_session")?.value);if(s?.sid){await prisma.$executeRawUnsafe(`DELETE FROM "SamsSession" WHERE "id"=?`,s.sid);await audit(s.userId,s.username,"LOGOUT","SamsSession",`session:${s.sid}`)}c.set("sams_session","",{httpOnly:true,expires:new Date(0),path:"/",sameSite:"lax"});return NextResponse.json({ok:true})}catch{return NextResponse.json({ok:true})}}
