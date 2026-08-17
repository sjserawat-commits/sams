import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getIndiaDayBounds(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(now);
  const value=(type:string)=>parts.find(p=>p.type===type)?.value;
  const year=value("year"),month=value("month"),day=value("day");
  if(!year||!month||!day)throw new Error("Unable to determine India calendar date.");
  const start=new Date(`${year}-${month}-${day}T00:00:00+05:30`);
  return {start,end:new Date(start.getTime()+24*60*60*1000)};
}

function appointmentPriority(appointment: {appointmentDate:string;appointmentTime:string}|null, now=new Date()) {
  if(!appointment) return {priority:1,slotMinutes:null as number|null};
  const {start}=getIndiaDayBounds(now);
  const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata"}).format(now);
  if(appointment.appointmentDate!==today) return {priority:1,slotMinutes:null as number|null};
  const match=appointment.appointmentTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if(!match)return {priority:1,slotMinutes:null as number|null};
  let hour=Number(match[1])%12;if(match[3].toUpperCase()==="PM")hour+=12;
  const slotMinutes=hour*60+Number(match[2]);
  const currentParts=new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:false}).formatToParts(now);
  const currentMinutes=Number(currentParts.find(p=>p.type==="hour")?.value||0)*60+Number(currentParts.find(p=>p.type==="minute")?.value||0);
  return {priority:slotMinutes<=currentMinutes?0:1,slotMinutes};
}

export async function GET(request: Request) {
  try {
    const {searchParams}=new URL(request.url);
    const rawDepartmentId=searchParams.get("departmentId");
    const rawDoctorId=searchParams.get("doctorId");
    const departmentId=rawDepartmentId?Number(rawDepartmentId):null;
    const doctorId=rawDoctorId?Number(rawDoctorId):null;
    if(!departmentId||!Number.isInteger(departmentId))return NextResponse.json({error:"Department desk is required."},{status:400});
    if(rawDoctorId&&!Number.isInteger(doctorId))return NextResponse.json({error:"Invalid consultant ID."},{status:400});
    const department=await prisma.department.findUnique({where:{id:departmentId},select:{id:true,name:true,code:true}});
    if(!department)return NextResponse.json({error:"Department not found."},{status:404});
    const doctor=doctorId?await prisma.doctor.findFirst({where:{id:doctorId,departmentId,active:true},select:{id:true,name:true,departmentId:true}}):null;
    if(doctorId&&!doctor)return NextResponse.json({error:"Consultant not found for this department."},{status:404});
    const {start,end}=getIndiaDayBounds();
    const rows=await prisma.oPDVisit.findMany({
      where:{departmentId,...(doctorId?{doctorId}:{}),createdAt:{gte:start,lt:end},status:{in:["WAITING","IN_CONSULTATION","COMPLETED"]}},
      include:{patient:true,appointment:true},
      orderBy:[{tokenNumber:"asc"},{id:"asc"}],
    });
    const visits=rows.map(v=>{const p=appointmentPriority(v.appointment);return {...v,queuePriority:p.priority,appointmentSlotMinutes:p.slotMinutes}}).sort((a,b)=>a.queuePriority-b.queuePriority||(a.queuePriority===0&&b.queuePriority===0?(a.appointmentSlotMinutes??99999)-(b.appointmentSlotMinutes??99999):a.tokenNumber-b.tokenNumber)||a.id-b.id);
    return NextResponse.json({department,doctor,visits});
  }catch(error){console.error("OPD queue error:",error);return NextResponse.json({error:"Unable to load OPD queue."},{status:500});}
}
