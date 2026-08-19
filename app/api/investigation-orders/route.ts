import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const round=(v:number)=>Math.round(v*100)/100;
const billNumber=()=>`SAMS-${Date.now().toString().slice(-10)}`;
function tempPatientId(prefix:"WALKIN"|"REF"){return `${prefix}-${Date.now().toString().slice(-10)}-${Math.floor(Math.random()*90+10)}`;}
type Rate={rate:number|null;smsBenchmarkRate:number|null;corporateBenchmarkRate:number|null;specimen?:string|null};
function effectiveRate(m:Rate|null){if(!m)return 1;const sms=Number(m.smsBenchmarkRate||0),corp=Number(m.corporateBenchmarkRate||0),rate=Number(m.rate||0);if(sms>0)return Math.max(1,Math.round(sms*1.65));if(corp>0)return Math.max(1,Math.round(corp*.65));if(rate>0)return Math.max(1,Math.round(rate));return 1;}

async function getOrCreateVisit(body:any){
 const supplied=Number(body?.opdVisitId||0);
 if(Number.isInteger(supplied)&&supplied>0){const v=await prisma.oPDVisit.findUnique({where:{id:supplied},include:{patient:true}});if(!v)throw new Error("OPD Visit not found.");return v;}
 const suppliedPatient=String(body?.patientId||"").trim();
 let patient=suppliedPatient?await prisma.patient.findUnique({where:{patientId:suppliedPatient}}):null;
 const mode=String(body?.sourceType||"REGISTERED").toUpperCase();
 if(!patient&&mode==="REGISTERED")throw new Error("Registered patient not found.");
 if(!patient){const firstName=String(body?.firstName||"Walk-in").trim()||"Walk-in",lastName=String(body?.lastName||"Patient").trim()||"Patient";patient=await prisma.patient.create({data:{patientId:tempPatientId(mode==="EXTERNAL_REFERRAL"?"REF":"WALKIN"),firstName,lastName,dateOfBirth:body?.dateOfBirth?new Date(body.dateOfBirth):null,gender:body?.gender?String(body.gender):null,phone:body?.phone?String(body.phone):null,address:body?.address?String(body.address):null}});}
 return prisma.oPDVisit.create({data:{patientId:patient.id,tokenNumber:Number(String(Date.now()).slice(-6)),visitType:mode==="EXTERNAL_REFERRAL"?"EXTERNAL_DIAGNOSTIC":"DIAGNOSTIC",status:"WAITING"},include:{patient:true}});
}

export async function GET(request:Request){
 try{const p=new URL(request.url).searchParams,visitId=Number(p.get("opdVisitId")||0),patientId=p.get("patientId")?.trim()||"",status=p.get("status")?.trim().toUpperCase()||"";
 const orders=await prisma.investigationOrder.findMany({where:{...(visitId>0?{opdVisitId:visitId}:{}),...(status?{status}:{}),...(patientId?{opdVisit:{patient:{patientId}}}:{})},include:{master:true,opdVisit:{include:{patient:true}}},orderBy:{createdAt:"desc"}});
 return NextResponse.json(orders.map(o=>({...o,price:effectiveRate(o.master),netAmount:effectiveRate(o.master)})));
 }catch(e){console.error(e);return NextResponse.json({error:"Unable to load investigation orders."},{status:500});}
}

export async function POST(request:Request){
 try{
  const body=await request.json(),sourceType=String(body?.sourceType||"REGISTERED").trim().toUpperCase(),requested:any[]=Array.isArray(body?.investigations)?body.investigations:[];
  if(!requested.length)return NextResponse.json({error:"Select at least one investigation."},{status:400});
  const visit=await getOrCreateVisit(body);
  const ids:number[]=Array.from(new Set<number>(requested.map((x:any)=>Number(x?.id)).filter((x:number)=>Number.isInteger(x)&&x>0)));
  if(!ids.length)return NextResponse.json({error:"Select valid investigations."},{status:400});
  const masters=await prisma.investigationMaster.findMany({where:{id:{in:ids},active:true}});
  if(masters.length!==ids.length)return NextResponse.json({error:"One or more investigations are invalid or inactive."},{status:400});

  const result=await prisma.$transaction(async tx=>{
   const bill=await tx.billingRecord.findFirst({where:{opdVisitId:visit.id},orderBy:{createdAt:"desc"}});
   if(bill?.paidAmount||bill?.paymentStatus==="PAID"||bill?.paymentStatus==="PARTIAL")throw new Error("This Visit already has a processed or paid bill and cannot be changed.");
   if(bill&&bill.paymentStatus!=="DRAFT"&&bill.paymentStatus!=="UNPAID")throw new Error("This Visit does not have an editable billing record.");
   const existing=await tx.investigationOrder.findMany({where:{opdVisitId:visit.id,investigationId:{in:ids},status:{not:"CANCELLED"}}});
   const existingIds=new Set(existing.map(x=>x.investigationId).filter((x):x is number=>typeof x==="number"));
   const newMasters=masters.filter(m=>!existingIds.has(m.id));
   const orders=[] as Array<{id:number;netAmount:number;investigation:string;specimen:string|null}>;
   for(const m of newMasters){const rate=effectiveRate(m);const o=await tx.investigationOrder.create({data:{opdVisitId:visit.id,investigationId:m.id,investigation:m.name,price:rate,netAmount:rate,paymentStatus:"UNPAID",status:"ORDERED",specimen:m.specimen||null}});orders.push({id:o.id,netAmount:o.netAmount,investigation:o.investigation,specimen:o.specimen});}
   let draft=bill;
   if(draft&&orders.length){for(const o of orders)await tx.billingLineItem.create({data:{billingRecordId:draft.id,opdVisitId:visit.id,serviceType:"INVESTIGATION",description:o.investigation,quantity:1,unitPrice:round(o.netAmount),amount:round(o.netAmount),sourceType:"INVESTIGATION_ORDER",sourceId:o.id}});const lines=await tx.billingLineItem.findMany({where:{billingRecordId:draft.id}});const subtotal=round(lines.reduce((s,l)=>s+l.amount,0));draft=await tx.billingRecord.update({where:{id:draft.id},data:{subtotal,netAmount:round(Math.max(0,subtotal-draft.discount)),balanceAmount:round(Math.max(0,subtotal-draft.discount)),paymentStatus:draft.paymentStatus==="UNPAID"?"UNPAID":"DRAFT"}});}
   return{orders,existingOrders:existing,bill:draft,added:round(orders.reduce((s,o)=>s+o.netAmount,0)),duplicateCount:masters.length-newMasters.length};
  });
  return NextResponse.json({sourceType,visit:{id:visit.id,patientId:visit.patient.patientId,name:`${visit.patient.firstName} ${visit.patient.lastName}`.trim(),visitType:visit.visitType},...result,message:result.added>0?`Investigation order placed successfully. ${result.orders.length} investigation(s) added.`:"These investigations are already ordered for this Visit; no duplicate order was created."},{status:201});
 }catch(e){console.error(e);const message=e instanceof Error?e.message:"Unable to place investigation order.";return NextResponse.json({error:message},{status:message.includes("processed")||message.includes("paid")?409:500});}
}

export async function DELETE(request:Request){
 try{
  const id=Number(new URL(request.url).searchParams.get("orderId")||0);if(!Number.isInteger(id)||id<=0)return NextResponse.json({error:"A valid investigation order ID is required."},{status:400});
  const order=await prisma.investigationOrder.findUnique({where:{id}});if(!order)return NextResponse.json({error:"Investigation order not found."},{status:404});
  const bill=await prisma.billingRecord.findFirst({where:{opdVisitId:order.opdVisitId},orderBy:{createdAt:"desc"}});
  if(bill?.paidAmount||bill?.paymentStatus==="PAID"||bill?.paymentStatus==="PARTIAL")return NextResponse.json({error:"Only draft investigation orders can be edited."},{status:409});
  await prisma.$transaction(async tx=>{if(bill)await tx.billingLineItem.deleteMany({where:{billingRecordId:bill.id,sourceType:"INVESTIGATION_ORDER",sourceId:id}});await tx.investigationOrder.update({where:{id},data:{status:"CANCELLED",paymentStatus:"UNPAID"}});if(bill){const lines=await tx.billingLineItem.findMany({where:{billingRecordId:bill.id}});const subtotal=round(lines.reduce((s,l)=>s+l.amount,0));await tx.billingRecord.update({where:{id:bill.id},data:{subtotal,netAmount:Math.max(0,subtotal-bill.discount),balanceAmount:Math.max(0,subtotal-bill.discount)}});}});
  return NextResponse.json({ok:true});
 }catch(e){console.error(e);return NextResponse.json({error:"Unable to remove investigation order."},{status:500});}
}
