import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const round=(n:number)=>Math.round(n*100)/100;
const billNumber=()=>`SAMS-${Date.now().toString().slice(-10)}`;

export async function POST(request:Request){
  try{
    const body=await request.json();
    const visitId=Number(body?.visitId);
    const lineIds=Array.isArray(body?.lineIds)?body.lineIds.map(Number).filter((n:number)=>Number.isInteger(n)&&n>0):[];
    if(!Number.isInteger(visitId)||visitId<=0||!lineIds.length)return NextResponse.json({error:"Select at least one valid charge from one Visit."},{status:400});
    const visit=await prisma.oPDVisit.findUnique({where:{id:visitId},include:{patient:true}});
    if(!visit)return NextResponse.json({error:"OPD visit not found."},{status:404});
    const lines=await prisma.billingLineItem.findMany({where:{id:{in:lineIds},opdVisitId:visitId},orderBy:{createdAt:"asc"}});
    if(lines.length!==lineIds.length)return NextResponse.json({error:"One or more selected charges do not belong to this Visit."},{status:409});
    const paidOrPartial=lines.filter(l=>l.billingRecordId!==null);
    if(paidOrPartial.length)return NextResponse.json({error:"A selected charge is already attached to another bill. Refresh Patient Charges and select only Unpaid charges."},{status:409});
    const subtotal=round(lines.reduce((s,l)=>s+l.amount,0));
    const bill=await prisma.$transaction(async tx=>{
      const created=await tx.billingRecord.create({data:{billNumber:billNumber(),patientId:visit.patientId,opdVisitId:visit.id,subtotal,netAmount:subtotal,balanceAmount:subtotal,paymentStatus:"UNPAID"}});
      await tx.billingLineItem.updateMany({where:{id:{in:lineIds},billingRecordId:null},data:{billingRecordId:created.id}});
      return created;
    });
    return NextResponse.json({bill},{status:201});
  }catch(e){
    console.error(e);
    return NextResponse.json({error:e instanceof Error?e.message:"Unable to create selected-charge invoice."},{status:500});
  }
}

export async function GET(request:Request){
  try{
    const p=new URL(request.url).searchParams;
    const billId=Number(p.get("billId")||0);
    if(!Number.isInteger(billId)||billId<=0)return NextResponse.json({error:"A valid bill ID is required."},{status:400});
    const bill=await prisma.billingRecord.findUnique({where:{id:billId},include:{patient:true,opdVisit:{include:{departmentMaster:true}},lineItems:{orderBy:{createdAt:"asc"}}}});
    if(!bill)return NextResponse.json({error:"Bill not found."},{status:404});
    return NextResponse.json({bill:{id:bill.id,billNumber:bill.billNumber,receiptNumber:bill.receiptNumber,discount:bill.discount,netAmount:round(bill.netAmount),paymentStatus:bill.paymentStatus,paymentMethod:bill.paymentMethod,paidAmount:round(bill.paidAmount),balanceAmount:round(bill.balanceAmount),subtotal:round(bill.subtotal)},patient:{patientId:bill.patient.patientId,name:`${bill.patient.firstName} ${bill.patient.lastName}`.trim(),phone:bill.patient.phone},visit:bill.opdVisit?{id:bill.opdVisit.id,tokenNumber:bill.opdVisit.tokenNumber,visitType:bill.opdVisit.visitType,status:bill.opdVisit.status,department:bill.opdVisit.departmentMaster?.name??null}:null,lineItems:bill.lineItems.map(l=>({id:l.id,serviceType:l.serviceType,description:l.description,quantity:l.quantity,unitPrice:round(l.unitPrice),amount:round(l.amount),sourceType:l.sourceType}))});
  }catch(e){
    console.error(e);
    return NextResponse.json({error:"Unable to load selected-charge invoice."},{status:500});
  }
}
