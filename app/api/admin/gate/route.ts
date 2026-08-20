import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { verifySessionCookie } from "@/lib/auth";
const ADMIN_USERNAME=process.env.SAMS_ADMIN_GATE_USERNAME||"admin";
const ADMIN_PASSWORD_SALT="96cbf778428e3fc1218cb62f13709ca7";
const ADMIN_PASSWORD_HASH="17ccaed2668e32df402207727916e98be59d65bf7981f664b2a95cb141412a3c07a96dbfc6350bd263048cbfda4c3856ec742f189c34f4cc77e4239b0f1110d5";
function verifyGatePassword(password:string){const actual=crypto.scryptSync(password,Buffer.from(ADMIN_PASSWORD_SALT,"hex"),64).toString("hex");return crypto.timingSafeEqual(Buffer.from(actual,"hex"),Buffer.from(ADMIN_PASSWORD_HASH,"hex"));}
function sign(payload:string){const secret=process.env.SAMS_SESSION_SECRET;if(!secret)throw new Error("SAMS_SESSION_SECRET is not configured.");return crypto.createHmac("sha256",secret).update(payload).digest("base64url");}
export async function POST(req:Request){try{const c=await cookies();const session=verifySessionCookie(c.get("sams_session")?.value);if(!session?.sid||!session.roles?.some(r=>["ADMIN","SUPER_ADMIN"].includes(r)))return NextResponse.json({error:"Administrator permission required."},{status:403});const body=await req.json();const username=String(body.username||"").trim();const password=String(body.password||"");if(username!==ADMIN_USERNAME||!verifyGatePassword(password))return NextResponse.json({error:"Invalid Admin User ID or password."},{status:401});const exp=Date.now()+8*60*60*1000;const payload=`${session.sid}|${exp}`;const token=`${payload}.${sign(payload)}`;const res=NextResponse.json({ok:true});res.cookies.set("sams_admin_gate",token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",expires:new Date(exp)});return res}catch{return NextResponse.json({error:"Unable to authenticate Admin."},{status:500})}}
export async function DELETE(){const res=NextResponse.json({ok:true});res.cookies.set("sams_admin_gate","",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:0});return res}
