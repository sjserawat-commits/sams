import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const amount = (v: unknown) => Number(v || 0);
const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const startOfMonth = (d: Date) => { const x = new Date(d.getFullYear(), d.getMonth(), 1); x.setHours(0,0,0,0); return x; };
const startOfYear = (d: Date) => { const x = new Date(d.getFullYear(), 0, 1); x.setHours(0,0,0,0); return x; };
const endNext = (d: Date) => { const x = new Date(d); x.setDate(x.getDate()+1); return x; };
const sumPaid = (rows: { paidAmount: number }[]) => rows.reduce((s,b)=>s+amount(b.paidAmount),0);
const sumBilled = (rows: { netAmount: number }[]) => rows.reduce((s,b)=>s+amount(b.netAmount),0);

export async function GET() {
  try {
    const now = new Date();
    const day = startOfDay(now);
    const month = startOfMonth(now);
    const year = startOfYear(now);
    const tomorrow = endNext(day);
    const nextMonth = new Date(now.getFullYear(), now.getMonth()+1, 1);
    const nextYear = new Date(now.getFullYear()+1, 0, 1);

    const [all, todayBills, monthBills, yearBills, recent] = await Promise.all([
      prisma.billingRecord.findMany({ orderBy:{createdAt:"desc"}, include:{patient:true,lineItems:true} }),
      prisma.billingRecord.findMany({ where:{createdAt:{gte:day,lt:tomorrow}}, include:{patient:true,lineItems:true}, orderBy:{createdAt:"desc"} }),
      prisma.billingRecord.findMany({ where:{createdAt:{gte:month,lt:nextMonth}}, include:{patient:true,lineItems:true}, orderBy:{createdAt:"desc"} }),
      prisma.billingRecord.findMany({ where:{createdAt:{gte:year,lt:nextYear}}, include:{patient:true,lineItems:true}, orderBy:{createdAt:"desc"} }),
      prisma.billingRecord.findMany({ take:12, orderBy:{updatedAt:"desc"}, include:{patient:true,lineItems:true} }),
    ]);

    const outstanding = all.reduce((s,b)=>s+amount(b.balanceAmount),0);
    const pending = all.filter(b=>b.paymentStatus!=="PAID").length;
    const paid = all.filter(b=>b.paymentStatus==="PAID").length;
    const partial = all.filter(b=>b.paymentStatus==="PARTIAL").length;

    const serviceTotals: Record<string,number> = {};
    for (const bill of all) for (const line of bill.lineItems) serviceTotals[line.serviceType]=(serviceTotals[line.serviceType]||0)+amount(line.amount);

    const paymentMethods: Record<string,number> = {};
    for (const bill of all) if (bill.paymentMethod) paymentMethods[bill.paymentMethod]=(paymentMethods[bill.paymentMethod]||0)+amount(bill.paidAmount);

    const monthTrend = Array.from({length:12},(_,i)=>({month:new Date(now.getFullYear(),i,1).toLocaleString("en-IN",{month:"short"}),revenue:0,billing:0}));
    for (const b of yearBills) { const i=new Date(b.createdAt).getMonth(); monthTrend[i].revenue+=amount(b.paidAmount); monthTrend[i].billing+=amount(b.netAmount); }

    const dayTrend = Array.from({length:7},(_,i)=>({label:new Date(day.getTime()-((6-i)*86400000)).toLocaleString("en-IN",{weekday:"short"}),revenue:0,billing:0,date:new Date(day.getTime()-((6-i)*86400000)).toISOString().slice(0,10)}));
    const dayMap = new Map(dayTrend.map(x=>[x.date,x]));
    const weekStart = new Date(day); weekStart.setDate(weekStart.getDate()-6);
    const weekBills = await prisma.billingRecord.findMany({where:{createdAt:{gte:weekStart,lt:tomorrow}}});
    for (const b of weekBills) { const x=dayMap.get(new Date(b.createdAt).toISOString().slice(0,10)); if(x){x.revenue+=amount(b.paidAmount);x.billing+=amount(b.netAmount);} }

    return NextResponse.json({
      asOf: now.toISOString(),
      summary:{todayCollection:sumPaid(todayBills),todayBilling:sumBilled(todayBills),monthRevenue:sumPaid(monthBills),monthBilling:sumBilled(monthBills),yearRevenue:sumPaid(yearBills),yearBilling:sumBilled(yearBills),pendingBills:pending,outstanding,paidBills:paid,partialBills:partial},
      revenue:{day:sumPaid(todayBills),month:sumPaid(monthBills),year:sumPaid(yearBills)},
      trends:{last7Days:dayTrend,yearMonths:monthTrend},
      serviceTotals,paymentMethods,
      recent:recent.map(b=>({billNumber:b.billNumber,patient:`${b.patient.firstName} ${b.patient.lastName}`.trim(),patientId:b.patient.patientId,amount:b.netAmount,paid:b.paidAmount,balance:b.balanceAmount,status:b.paymentStatus,createdAt:b.createdAt}))
    });
  } catch(error) {
    console.error("Admin billing dashboard error",error);
    return NextResponse.json({error:"Unable to load billing dashboard."},{status:500});
  }
}
