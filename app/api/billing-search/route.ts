import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const round=(n:number)=>Math.round(n*100)/100;
const age=(dob:Date|null)=>{if(!dob)return null;const now=new Date();let n=now.getFullYear()-dob.getFullYear();const m=now.getMonth()-dob.getMonth();if(m<0||(m===0&&now.getDate()<dob.getDate()))n--;return n;};

export async function GET(request:Request){
 try{
  const p=new URL(request.url).searchParams,q=p.get("q")?.trim()||"",by=p.get("by")||"hid";
  if(!q)return NextResponse.json({patients:[]});
  const where=by==="name"?{OR:[{firstName:{contains:q}},{lastName:{contains:q}}]}:by==="mobile"?{phone:{contains:q}}:{patientId:{contains:q}};
  const patients=await prisma.patient.findMany({where,include:{opdVisits:{orderBy:{createdAt:"desc"},take:5,include:{departmentMaster:true,doctor:true}},billingRecords:{where:{balanceAmount:{gt:0}},select:{balanceAmount:true}}},orderBy:{updatedAt:"desc"},take:20});
  return NextResponse.json({patients:patients.map(x=>({id:x.id,patientId:x.patientId,name:`${x.firstName} ${x.lastName}`.trim(),age:age(x.dateOfBirth),gender:x.gender,phone:x.phone,outstanding:round(x.billingRecords.reduce((s,b)=>s+b.balanceAmount,0)),visits:x.opdVisits.map(v=>({id:v.id,tokenNumber:v.tokenNumber,visitType:v.visitType,status:v.status,department:v.departmentMaster?.name||null,doctor:v.doctor?.name||null,createdAt:v.createdAt}))}))});
 }catch(e){console.error(e);return NextResponse.json({error:"Unable to search patients."},{status:500});}
}
