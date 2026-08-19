import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUS = ["ORDERED","APPROVED_FOR_SAMPLING","ACCEPTED","SAMPLE_COLLECTED","PROCESSING","COMPLETED","VERIFIED","PUBLISHED","CANCELLED"] as const;
type InvestigationStatus = (typeof ALLOWED_STATUS)[number];
const LAB_CATEGORIES = ["Hematology","Coagulation","Biochemistry","Immunoassay","Immunology","Cardiology","Endocrinology","Vitamins & Nutrition","Tumor Markers","Serology","Autoimmunity","Clinical Pathology","Cytology","Histopathology","Hematopathology","Microbiology","Molecular Diagnostics"];
function accession(id:number){return `SAMSLAB-${new Date().getFullYear()}-${String(id).padStart(7,"0")}`;}
function normalise(value:string|null|undefined){return String(value||"").normalize("NFKC").toLowerCase().replace(/&/g," and ").replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim();}

/**
 * Runtime safety net for existing installations whose database was created
 * before the Investigation Master reference-range configuration was added.
 * Master data remains the source of truth; this only fills an empty value.
 */
function commonReference(name:string, code?:string|null){
 const n=normalise(name), c=normalise(code);
 const exact:Record<string,string>={
  "bilirubin total":"0.2–1.2 mg/dL",
  "ck total":"Male ~39–308 U/L; Female ~26–192 U/L",
  "total bilirubin":"0.2–1.2 mg/dL",
  "creatine kinase total":"Male ~39–308 U/L; Female ~26–192 U/L",
  "24 hour urine copper":"Approximately 15–60 µg/day (adult; laboratory dependent)",
  "24 hour urine citrate":">320 mg/day (adult; collection/laboratory dependent)",
  "24 hour urine oxalate":"Adult approximately 4–31 mg/day",
  "24 hour urine calcium":"Male <300 mg/day; Female <250 mg/day",
  "24 hour urine uric acid":"Male <800 mg/day; Female <750 mg/day",
  "24 hour urine protein":"<150 mg/day",
  "24 hour urine creatinine":"Male ~14–26 mg/kg/day; Female ~11–20 mg/kg/day",
  "24 hour urine sodium":"Approximately 40–220 mmol/day (diet dependent)",
  "24 hour urine potassium":"Approximately 25–125 mmol/day (diet dependent)",
  "hemoglobin":"Male 13–17 g/dL; Female 12–15 g/dL",
  "total leukocyte count":"4,000–11,000/µL",
  "platelet count":"150,000–450,000/µL",
  "blood sugar fasting":"70–99 mg/dL",
  "serum creatinine":"Male 0.74–1.35 mg/dL; Female 0.59–1.04 mg/dL",
  "serum calcium":"8.5–10.5 mg/dL",
  "serum sodium":"135–145 mmol/L",
  "serum potassium":"3.5–5.1 mmol/L",
  "thyroid stimulating hormone":"0.4–4.0 mIU/L",
  "free t4":"0.8–1.8 ng/dL",
  "free t3":"2.3–4.2 pg/mL",
  "vitamin b12":"200–900 pg/mL",
  "vitamin d3 25 oh vitamin d":"30–100 ng/mL",
  "c reactive protein":"<5 mg/L",
  "prostate specific antigen":"<4.0 ng/mL (age dependent)",
 };
 if(exact[n])return exact[n];
 if(c==="bilt")return "0.2–1.2 mg/dL";
 if(c==="ck"||c==="cpk")return "Male ~39–308 U/L; Female ~26–192 U/L";
 if(/24 hour urine.*copper|urine.*copper.*24 hour/.test(n))return "Approximately 15–60 µg/day (adult; laboratory dependent)";
 if(/24 hour urine.*citrate|urine.*citrate.*24 hour/.test(n))return ">320 mg/day (adult; collection/laboratory dependent)";
 if(/24 hour urine.*protein|urine.*protein.*24 hour/.test(n))return "<150 mg/day";
 if(/24 hour urine.*calcium|urine.*calcium.*24 hour/.test(n))return "Male <300 mg/day; Female <250 mg/day";
 if(/24 hour urine.*oxalate|urine.*oxalate.*24 hour/.test(n))return "Adult approximately 4–31 mg/day";
 if(/24 hour urine.*uric acid|urine.*uric acid.*24 hour/.test(n))return "Male <800 mg/day; Female <750 mg/day";
 return null;
}

async function resolveMaster(order:any){
 const current=order.master;
 if(current?.referenceRange)return current;
 const candidates=await prisma.investigationMaster.findMany({where:{active:true,name:order.investigation},select:{id:true,code:true,category:true,specimen:true,unit:true,referenceRange:true,method:true,criticalValue:true},orderBy:{id:"asc"}});
 const configured=candidates.find((x)=>x.referenceRange?.trim());
 if(configured)return configured;
 const reference=commonReference(order.investigation,current?.code);
 if(reference){
  const target=current?.code?candidates.find(x=>x.code===current.code):candidates[0];
  if(target){await prisma.investigationMaster.update({where:{id:target.id},data:{referenceRange:reference}});return {...target,referenceRange:reference};}
 }
 return current;
}

export async function GET(request:Request){
 try{
  const params=new URL(request.url).searchParams,q=params.get("q")?.trim()??"",status=params.get("status")?.trim().toUpperCase()??"",visitId=Number(params.get("opdVisitId")||0);
  const orders=await prisma.investigationOrder.findMany({
   where:{
    master:{category:{in:LAB_CATEGORIES}},
    paymentStatus:"PAID",
    ...(visitId>0?{opdVisitId:visitId}:{}),
    ...(status&&ALLOWED_STATUS.includes(status as InvestigationStatus)?{status}:{}),
    ...(q?{OR:[{investigation:{contains:q}},{opdVisit:{patient:{patientId:{contains:q}}}},{opdVisit:{patient:{firstName:{contains:q}}}},{opdVisit:{patient:{lastName:{contains:q}}}}]}:{})
   },
   include:{
    master:{select:{id:true,code:true,category:true,specimen:true,unit:true,referenceRange:true,method:true,criticalValue:true}},
    opdVisit:{select:{id:true,tokenNumber:true,visitType:true,patient:{select:{patientId:true,firstName:true,lastName:true,gender:true,dateOfBirth:true}},billingRecords:{select:{id:true,paymentStatus:true,paidAmount:true,balanceAmount:true,netAmount:true},orderBy:{createdAt:"desc"},take:1}}}
   },orderBy:{createdAt:"desc"}
  });
  const hydrated=await Promise.all(orders.map(async order=>{const master=await resolveMaster(order);const bill=order.opdVisit.billingRecords[0]??null;return {...order,master,billing:bill,workflow:{paymentStatus:order.paymentStatus,outstandingAmount:Math.max(0,order.netAmount-(order.paymentStatus==="PAID"?order.netAmount:0)),samplingEligible:order.paymentStatus==="PAID",paymentRequiredBeforeSampling:order.paymentStatus!=="PAID"}};}));
  return NextResponse.json(hydrated);
 }catch(error){console.error("Lab room GET failed:",error);return NextResponse.json({error:"Unable to load lab room."},{status:500});}
}

export async function PATCH(request:Request){
 try{
  const body=await request.json(),id=Number(body?.id),requestedStatus=String(body?.status??"").trim().toUpperCase();
  if(!Number.isInteger(id)||id<=0)return NextResponse.json({error:"A valid laboratory investigation order ID is required."},{status:400});
  if(!ALLOWED_STATUS.includes(requestedStatus as InvestigationStatus))return NextResponse.json({error:"Invalid laboratory investigation status."},{status:400});
  const order=await prisma.investigationOrder.findUnique({where:{id},include:{master:true,opdVisit:{include:{billingRecords:{orderBy:{createdAt:"desc"},take:1}}}}});
  if(!order)return NextResponse.json({error:"Laboratory investigation order not found."},{status:404});
  if(!LAB_CATEGORIES.includes(order.master?.category||""))return NextResponse.json({error:"This investigation is not assigned to the Lab Room."},{status:400});
  const paid=order.paymentStatus==="PAID";
  if(!paid&&!(["CANCELLED"] as string[]).includes(requestedStatus))return NextResponse.json({error:"Payment is pending. This investigation will appear in the Lab Room only after Billing clears the payment."},{status:403});
  if(requestedStatus==="APPROVED_FOR_SAMPLING")return NextResponse.json({error:"Billing clearance is automatic after full payment. Laboratory users cannot approve sampling."},{status:403});
  const now=new Date(),data:any={status:requestedStatus};
  if(requestedStatus==="ACCEPTED")data.specimen=body?.specimen?String(body.specimen):order.specimen??order.master?.specimen??null;
  if(requestedStatus==="SAMPLE_COLLECTED"){data.sampleCollectedAt=now;data.sampleCollectedBy=body?.sampleCollectedBy?String(body.sampleCollectedBy):"Laboratory";data.accessionNumber=order.accessionNumber??accession(id);data.barcodeValue=order.barcodeValue??order.accessionNumber??accession(id);}
  if(requestedStatus==="PROCESSING")data.processingStartedAt=now;
  if(requestedStatus==="COMPLETED"){if(!String(body?.reportText??order.reportText??"").trim())return NextResponse.json({error:"Result/report is required before completing the investigation."},{status:400});data.processingCompletedAt=now;data.reportText=String(body?.reportText??order.reportText).trim();data.resultData=body?.resultData?JSON.stringify(body.resultData):order.resultData;data.abnormalFlag=Boolean(body?.abnormalFlag??order.abnormalFlag);data.criticalFlag=Boolean(body?.criticalFlag??order.criticalFlag);data.reportedAt=now;data.verificationStatus="PENDING";}
  if(requestedStatus==="VERIFIED"){if(!order.reportText)return NextResponse.json({error:"Complete the result before verification."},{status:400});data.verificationStatus="VERIFIED";data.verifiedBy=body?.verifiedBy?String(body.verifiedBy):"Authorized Laboratory User";data.verifiedAt=now;}
  if(requestedStatus==="PUBLISHED"){if(order.verificationStatus!=="VERIFIED")return NextResponse.json({error:"Report must be verified before publication."},{status:400});data.publishedAt=now;}
  const updated=await prisma.investigationOrder.update({where:{id},data,include:{master:true,opdVisit:{include:{patient:true}}}});return NextResponse.json(updated);
 }catch(error){console.error("Lab room PATCH failed:",error);return NextResponse.json({error:"Unable to update laboratory workflow."},{status:500});}
}
