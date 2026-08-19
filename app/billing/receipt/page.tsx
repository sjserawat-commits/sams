"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Line={id:number;serviceType:string;description:string;quantity:number;unitPrice:number;amount:number};
type Bill={id:number;billNumber:string;receiptNumber:string|null;discount:number;netAmount:number;paymentStatus:string;paymentMethod:string|null;paidAmount:number;balanceAmount:number;paidAt:string|null};
type Data={visit:{id:number;tokenNumber:number;visitType:string;department:string|null};patient:{patientId:string;name:string;phone:string|null};lineItems:Line[];bill:Bill|null};
const label=(x:string)=>({CONSULTATION:"Consultation",INVESTIGATION:"Investigation",PROCEDURE:"Procedure / Surgery",ELECTRODIAGNOSIS:"Electrodiagnosis",PHYSIOTHERAPY:"Physiotherapy / Rehabilitation",PHARMACY:"Pharmacy / Medicine",OTHER:"Other Service"}[x]||x);
const money=(n:number)=>`₹${Number(n||0).toFixed(2)}`;

function Receipt(){
 const s=useSearchParams(); const [data,setData]=useState<Data|null>(null); const [error,setError]=useState("");
 useEffect(()=>{const v=Number(s.get("visitId")||0); if(!v)return; fetch(`/api/billing?visitId=${v}`).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to load receipt.");setData(d)}).catch(e=>setError(e instanceof Error?e.message:"Unable to load receipt."));},[s]);
 useEffect(()=>{if(data)window.setTimeout(()=>window.print(),250)},[data]);
 if(error)return <main className="grid min-h-screen place-items-center p-6 font-bold text-red-700">{error}</main>;
 if(!data)return <main className="grid min-h-screen place-items-center p-6 font-bold text-slate-500">Loading receipt…</main>;
 const b=data.bill; if(!b)return <main className="grid min-h-screen place-items-center p-6 font-bold text-red-700">No bill found.</main>;
 const subtotal=b.netAmount+b.discount;
 return <main className="min-h-screen bg-slate-100 p-4 text-slate-900 sm:p-8 print:bg-white print:p-0"><div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-xl print:max-w-none print:rounded-none print:p-0 print:shadow-none">
  <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5"><div><p className="text-[10px] font-black uppercase tracking-[.25em] text-blue-700">SAMS · Hospital Finance</p><h1 className="mt-1 text-3xl font-black text-[#082b61]">PAYMENT RECEIPT</h1><p className="mt-1 text-xs text-slate-500">Serawat Advanced Multispeciality Joint & Spine Centre</p></div><div className="text-right text-xs"><p className="font-black">Receipt No.</p><p>{b.receiptNumber||"—"}</p><p className="mt-2 font-black">Bill No.</p><p>{b.billNumber}</p></div></div>
  <div className="grid gap-3 border-b py-5 sm:grid-cols-2"><div><p className="text-[9px] font-black uppercase text-slate-400">Patient</p><p className="font-black">{data.patient.name}</p><p className="text-xs text-slate-500">ID: {data.patient.patientId}{data.patient.phone?` · ${data.patient.phone}`:""}</p></div><div className="sm:text-right"><p className="text-[9px] font-black uppercase text-slate-400">Visit</p><p className="font-black">OPD #{data.visit.id} · Token #{data.visit.tokenNumber}</p><p className="text-xs text-slate-500">{data.visit.visitType}{data.visit.department?` · ${data.visit.department}`:""}</p></div></div>
  <table className="mt-5 w-full text-sm"><thead><tr className="border-b text-left text-[10px] uppercase text-slate-500"><th className="py-2">Service</th><th className="py-2 text-center">Qty</th><th className="py-2 text-right">Amount</th></tr></thead><tbody>{data.lineItems.map(l=><tr key={l.id} className="border-b"><td className="py-3"><b>{l.description}</b><div className="text-[10px] text-slate-400">{label(l.serviceType)} · {money(l.unitPrice)} each</div></td><td className="py-3 text-center">{l.quantity}</td><td className="py-3 text-right font-bold">{money(l.amount)}</td></tr>)}</tbody></table>
  <div className="ml-auto mt-5 max-w-sm space-y-2 text-sm"><div className="flex justify-between"><span>Subtotal</span><b>{money(subtotal)}</b></div>{b.discount>0&&<div className="flex justify-between"><span>Discount</span><b>- {money(b.discount)}</b></div>}<div className="flex justify-between border-t pt-3 text-xl font-black text-[#082b61]"><span>Net Payable</span><span>{money(b.netAmount)}</span></div><div className="flex justify-between"><span>Paid</span><b>{money(b.paidAmount)}</b></div>{b.balanceAmount>0&&<div className="flex justify-between text-red-700"><span>Outstanding</span><b>{money(b.balanceAmount)}</b></div>}</div>
  <div className="mt-7 grid gap-3 border-t pt-5 text-xs sm:grid-cols-2"><p><b>Payment Method:</b> {b.paymentMethod||"—"}</p><p className="sm:text-right"><b>Payment Date:</b> {b.paidAt?new Date(b.paidAt).toLocaleString("en-IN"):"—"}</p></div>
  <div className="mt-8 text-center text-[10px] text-slate-400">This is a computer-generated payment receipt.</div>
  <div className="mt-5 text-center print:hidden"><button onClick={()=>window.print()} className="rounded-xl bg-[#082b61] px-6 py-3 text-sm font-black text-white">Print Receipt</button></div>
 </div></main>
}
export default function Page(){return <Suspense fallback={<main>Loading…</main>}><Receipt/></Suspense>}
