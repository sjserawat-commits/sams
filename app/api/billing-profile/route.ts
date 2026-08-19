import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const round=(n:number)=>Math.round(n*100)/100;
const age=(dob:Date|null)=>{if(!dob)return null;const now=new Date();let n=now.getFullYear()-dob.getFullYear();const m=now.getMonth()-dob.getMonth();if(m<0||(m===0&&now.getDate()<dob.getDate()))n--;return n;};

export async function GET(request:Request){
 try{
  const id=Number(new URL(request.url).searchParams.get("patientId"));
  if(!Number.isInteger(id)||id<=0)return NextResponse.json({error:"Valid patient ID is required."},{status:400});
  const p=await prisma.patient.findUnique({where:{id},include:{opdVisits:{orderBy:{createdAt:"desc"},include:{doctor:true,departmentMaster:true,billingLineItems:{orderBy:{createdAt:"asc"}},billingRecords:{orderBy:{createdAt:"desc"}}}}}});
  if(!p)return NextResponse.json({error:"Patient not found."},{status:404});
  const lines=p.opdVisits.flatMap(v=>v.billingLineItems.map(l=>({id:l.id,visitId:v.id,visitDate:v.createdAt,doctor:v.doctor?.name||null,department:v.departmentMaster?.name||null,tokenNumber:v.tokenNumber,serviceType:l.serviceType,description:l.description,quantity:l.quantity,unitPrice:round(l.unitPrice),amount:round(l.amount),sourceType:l.sourceType,sourceId:l.sourceId,billStatus:v.billingRecords.find(b=>b.id===l.billingRecordId)?.paymentStatus||"UNBILLED",billingRecordId:l.billingRecordId})));
  const bills=p.opdVisits.flatMap(v=>v.billingRecords).map(b=>({id:b.id,billNumber:b.billNumber,visitId:b.opdVisitId,paymentStatus:b.paymentStatus,netAmount:round(b.netAmount),paidAmount:round(b.paidAmount),balanceAmount:round(b.balanceAmount),discount:round(b.discount),createdAt:b.createdAt}));
  return NextResponse.json({patient:{id:p.id,patientId:p.patientId,name:`${p.firstName} ${p.lastName}`.trim(),age:age(p.dateOfBirth),gender:p.gender,phone:p.phone},visits:p.opdVisits.map(v=>({id:v.id,tokenNumber:v.tokenNumber,visitType:v.visitType,status:v.status,department:v.departmentMaster?.name||null,doctor:v.doctor?.name||null,createdAt:v.createdAt})),lines,bills,outstanding:round(bills.reduce((s,b)=>s+b.balanceAmount,0))});
 }catch(e){console.error(e);return NextResponse.json({error:"Unable to load patient billing profile."},{status:500});}
}
