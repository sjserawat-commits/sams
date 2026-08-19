"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Visit={id:number;tokenNumber:number;visitType:string;status:string;department:string|null;createdAt:string};
type Line={id:number;serviceType:string;description:string;quantity:number;unitPrice:number;amount:number;sourceType:string|null;sourceId:number|null};
type Bill={id:number;billNumber:string;receiptNumber:string|null;discount:number;netAmount:number;paymentStatus:string;paymentMethod:string|null;paidAmount:number;balanceAmount:number};
type Data={visit:Visit;patient:{id:number;patientId:string;name:string;phone:string|null};lineItems:Line[];totals:{subtotal:number};bill:Bill|null;consultationFee:number};

const TYPES=["PROCEDURE","ELECTRODIAGNOSIS","PHYSIOTHERAPY","PHARMACY","OTHER"];
const labels:Record<string,string>={CONSULTATION:"Consultation",INVESTIGATION:"Investigation",PROCEDURE:"Procedure / Surgery",ELECTRODIAGNOSIS:"Electrodiagnosis",PHYSIOTHERAPY:"Physiotherapy / Rehabilitation",PHARMACY:"Pharmacy / Medicine",OTHER:"Other Service"};
const money=(n:number)=>`₹${Number(n||0).toFixed(2)}`;

export default function PatientChargesPage(){
  const router=useRouter();
  const search=useSearchParams();
  const [patientId,setPatientId]=useState(search.get("patientId")||"");
  const [visits,setVisits]=useState<Visit[]>([]);
  const [data,setData]=useState<Data|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [type,setType]=useState("PROCEDURE");
  const [description,setDescription]=useState("");
  const [quantity,setQuantity]=useState("1");
  const [rate,setRate]=useState("");
  const [discount,setDiscount]=useState("");

  const run=async(url:string,init?:RequestInit)=>{const r=await fetch(url,init);const d=await r.json();if(!r.ok)throw new Error(d.error||"Patient charges request failed.");return d;};
  const load=async(id:number)=>{
    setLoading(true);setError("");setMessage("");
    try{
      let d:Data=await run(`/api/billing?visitId=${id}`);
      // Opening Patient Charges creates the draft bill once, then adds the standard
      // consultation fee once. Removing a line later is preserved by the billing API.
      if(!d.bill){
        await run("/api/billing",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({visitId:id})});
        d=await run(`/api/billing?visitId=${id}`);
      }
      if(d.bill && !d.bill.paidAmount && d.bill.paymentStatus!=="PAID" && d.bill.paymentStatus!=="DISCARDED" && !d.lineItems.some((l)=>l.serviceType==="CONSULTATION"&&l.sourceType==="OPD_VISIT")){
        await run("/api/billing",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({visitId:id,action:"addConsultation"})});
        d=await run(`/api/billing?visitId=${id}`);
      }
      setData(d);setPatientId(d.patient.patientId);
    }catch(e){setError(e instanceof Error?e.message:"Unable to load patient charges.");}
    finally{setLoading(false);}
  };
  const findPatient=async()=>{
    const id=patientId.trim();if(!id){setError("Enter Patient ID first.");return;}
    setLoading(true);setError("");setMessage("");setData(null);setVisits([]);
    try{const d=await run(`/api/billing?patientId=${encodeURIComponent(id)}`);setVisits(d.visits||[]);if(!d.visits?.length)setMessage("Patient found, but no OPD Visit is available.");}
    catch(e){setError(e instanceof Error?e.message:"Unable to find patient.");}
    finally{setLoading(false);}
  };
  useEffect(()=>{const v=Number(search.get("visitId")||0);if(v>0)void load(v);},[]);

  const editable=Boolean(data?.bill)&&!data?.bill?.paidAmount&&data?.bill?.paymentStatus!=="PAID"&&data?.bill?.paymentStatus!=="DISCARDED";
  const subtotal=useMemo(()=>data?.lineItems.reduce((s,l)=>s+l.amount,0)||0,[data]);
  const currentDiscount=data?.bill?.discount||0;
  const net=data?.bill?.netAmount??Math.max(0,subtotal-currentDiscount);
  const ready=description.trim()&&Number(quantity)>0&&Number.isFinite(Number(quantity))&&rate!==""&&Number(rate)>=0&&Number.isFinite(Number(rate));

  const addCharge=async()=>{
    if(!data||!editable||!ready)return;
    setLoading(true);setError("");setMessage("");
    try{
      await run("/api/billing",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({visitId:data.visit.id,action:"addLine",serviceType:type,description:description.trim(),quantity:Number(quantity),unitPrice:Number(rate)})});
      setDescription("");setQuantity("1");setRate("");await load(data.visit.id);setMessage("Charge added to Patient Charges.");
    }catch(e){setError(e instanceof Error?e.message:"Unable to add charge.");setLoading(false);}
  };
  const removeCharge=async(id:number)=>{
    if(!data||!editable)return;
    setLoading(true);setError("");setMessage("");
    try{await run(`/api/billing?lineId=${id}`,{method:"DELETE"});await load(data.visit.id);setMessage("Charge removed. The source order/service remains unchanged.");}
    catch(e){setError(e instanceof Error?e.message:"Unable to remove charge.");setLoading(false);}
  };
  const applyDiscount=async()=>{
    if(!data?.bill||!editable)return;
    const d=Number(discount);if(!Number.isFinite(d)||d<0||d>subtotal){setError("Enter a valid discount within the subtotal.");return;}
    setLoading(true);setError("");
    try{await run("/api/billing",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"discount",billId:data.bill.id,discount:d})});await load(data.visit.id);setMessage("Discount updated.");}
    catch(e){setError(e instanceof Error?e.message:"Unable to update discount.");setLoading(false);}
  };
  const process=async()=>{
    if(!data?.bill)return;
    setLoading(true);setError("");setMessage("");
    try{await run("/api/billing",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({visitId:data.visit.id,action:"processBill"})});router.push(`/billing?visitId=${data.visit.id}`);}
    catch(e){setError(e instanceof Error?e.message:"Unable to process bill.");setLoading(false);}
  };

  return <main className="min-h-screen bg-[#fffaf0] p-4 text-[#172b3a] sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl space-y-5">
    <header className="overflow-hidden rounded-[2rem] border border-[#d7a93d]/40 bg-gradient-to-br from-[#08483d] via-[#0d5b4c] to-[#176f5e] p-6 text-white shadow-xl sm:p-8"><div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.28em] text-[#f5d47b]">SAMS · Patient Charges</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Patient Charges</h1><p className="mt-2 max-w-2xl text-sm text-emerald-50">Build the patient bill from the selected OPD Visit — review, add, remove and discount charges before payment.</p></div><div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-xs"><p className="font-black uppercase tracking-widest text-[#f5d47b]">Workflow</p><p className="mt-1 font-bold">Patient → Visit → Charges → Review → Payment</p></div></div></header>
    <section className="rounded-[1.5rem] border border-[#eadfca] bg-white p-5 shadow-sm"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-[9px] font-black uppercase tracking-widest text-[#0d5b4c]">Step 01</p><h2 className="text-xl font-black text-[#0b2748]">Find Patient & Select OPD Visit</h2></div><span className="rounded-full bg-[#edf5ee] px-3 py-1.5 text-[10px] font-black text-[#0d5b4c]">Visit-based billing</span></div><div className="mt-4 flex flex-col gap-3 sm:flex-row"><input value={patientId} onChange={e=>setPatientId(e.target.value)} onKeyDown={e=>e.key==="Enter"&&void findPatient()} placeholder="Enter Patient ID" className="flex-1 rounded-xl border border-[#d8dfe3] bg-[#fbfcfb] px-4 py-3 outline-none focus:border-[#0d5b4c]"/><button onClick={()=>void findPatient()} disabled={loading} className="rounded-xl bg-[#0d5b4c] px-6 py-3 font-black text-white shadow-sm disabled:opacity-50">{loading?"Loading…":"Find Patient"}</button></div>{visits.length>0&&<div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{visits.map(v=><button key={v.id} onClick={()=>void load(v.id)} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-[#0d5b4c] hover:shadow-md ${data?.visit.id===v.id?"border-[#0d5b4c] bg-[#edf5ee]":"border-[#eadfca] bg-white"}`}><div className="flex items-center justify-between"><b className="text-[#0b2748]">OPD Visit #{v.id}</b><span className="rounded-full bg-[#fff7dd] px-2 py-1 text-[9px] font-black text-[#8a6713]">Token #{v.tokenNumber}</span></div><p className="mt-2 text-xs text-slate-500">{v.visitType} · {v.department||"General"}</p><p className="mt-1 text-[10px] font-bold text-slate-400">{new Date(v.createdAt).toLocaleString()}</p></button>)}</div>}</section>
    {data&&<><section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Info title="Patient" value={data.patient.name}/><Info title="Patient ID" value={data.patient.patientId}/><Info title="OPD Visit" value={`#${data.visit.id} · Token #${data.visit.tokenNumber}`}/><Info title="Bill" value={data.bill?.billNumber||"Not created"}/></section>
      <section className="rounded-[1.5rem] border border-[#eadfca] bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-[#eadfca] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[9px] font-black uppercase tracking-widest text-[#0d5b4c]">Step 02</p><h2 className="text-xl font-black text-[#0b2748]">Review Patient Charges</h2><p className="mt-1 text-xs text-slate-500">Consultation fee is added automatically. Investigation charges appear only when they belong to this Visit bill.</p></div><span className={`rounded-full px-3 py-1.5 text-[10px] font-black ${data.bill?.paymentStatus==="PAID"?"bg-emerald-50 text-emerald-700":"bg-amber-50 text-amber-700"}`}>{data.bill?.paymentStatus||"DRAFT"}</span></div><div className="p-5"><div className="overflow-x-auto rounded-2xl border border-[#eadfca]"><table className="w-full min-w-[760px] text-sm"><thead className="bg-[#fbf7ed] text-left text-[9px] font-black uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Charge</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Source</th><th className="px-4 py-3 text-right">Qty</th><th className="px-4 py-3 text-right">Rate</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3"></th></tr></thead><tbody>{data.lineItems.map(l=><tr key={l.id} className="border-t border-[#eee5d4]"><td className="px-4 py-3"><b className="text-[#0b2748]">{l.description}</b></td><td className="px-4 py-3 text-xs font-bold text-slate-500">{labels[l.serviceType]||l.serviceType}</td><td className="px-4 py-3 text-[10px] font-bold text-slate-400">{l.sourceType==="INVESTIGATION_ORDER"?"Investigation Order":l.sourceType==="OPD_VISIT"?"OPD Visit":l.sourceType==="PRESCRIPTION"?"Prescription":"Manual"}</td><td className="px-4 py-3 text-right">{l.quantity}</td><td className="px-4 py-3 text-right">{money(l.unitPrice)}</td><td className="px-4 py-3 text-right font-black">{money(l.amount)}</td><td className="px-4 py-3 text-right">{editable?<button onClick={()=>void removeCharge(l.id)} disabled={loading} className="text-[10px] font-black text-red-600 hover:underline disabled:opacity-40">Remove</button>:<span className="text-[10px] text-slate-400">Locked</span>}</td></tr>)}</tbody></table></div>
        {editable&&<div className="mt-5 rounded-2xl border border-[#eadfca] bg-[#fbf7ed] p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-end"><div className="w-full lg:w-48"><label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-slate-500">Category</label><select value={type} onChange={e=>setType(e.target.value)} className="w-full rounded-xl border bg-white px-3 py-3 text-sm font-bold">{TYPES.map(t=><option key={t}>{t}</option>)}</select></div><div className="flex-1"><label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-slate-500">Description</label><input value={description} onChange={e=>setDescription(e.target.value)} placeholder={type==="PROCEDURE"?"Procedure / surgery name":"Service description"} className="w-full rounded-xl border bg-white px-3 py-3 text-sm"/></div><div className="w-full lg:w-28"><label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-slate-500">Qty</label><input value={quantity} onChange={e=>setQuantity(e.target.value)} type="number" min="0.01" step="0.01" className="w-full rounded-xl border bg-white px-3 py-3 text-sm"/></div><div className="w-full lg:w-32"><label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-slate-500">Rate ₹</label><input value={rate} onChange={e=>setRate(e.target.value)} type="number" min="0" step="0.01" className="w-full rounded-xl border bg-white px-3 py-3 text-sm"/></div><button onClick={()=>void addCharge()} disabled={loading||!ready} className="rounded-xl bg-[#0d5b4c] px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40">＋ Add Charge</button></div><p className="mt-2 text-[10px] text-slate-400">Use this for procedures, electrodiagnosis, physiotherapy, pharmacy or other services not already present in the Visit charges.</p></div>}
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]"><div className="rounded-2xl bg-[#edf5ee] p-4"><p className="text-[9px] font-black uppercase tracking-widest text-[#0d5b4c]">Charge integrity</p><ul className="mt-2 space-y-2 text-xs text-[#17344b]"><li>✓ Every investigation charge is linked to its Investigation Order.</li><li>✓ Removing a line removes it from this bill only.</li><li>✓ Paid bills are locked against charge modification.</li></ul></div><div className="rounded-2xl border border-[#eadfca] bg-white p-4"><div className="flex justify-between text-sm"><span>Subtotal</span><b>{money(subtotal)}</b></div><div className="mt-3 flex items-center justify-between gap-3 text-sm"><span>Discount</span><div className="flex gap-2"><input value={discount} onChange={e=>setDiscount(e.target.value)} disabled={!editable} placeholder={money(currentDiscount)} className="w-28 rounded-lg border px-2 py-1.5 text-right disabled:bg-slate-100"/><button onClick={()=>void applyDiscount()} disabled={loading||!editable} className="rounded-lg bg-[#d7a93d] px-3 py-1.5 text-xs font-black text-white disabled:opacity-40">Apply</button></div></div><div className="mt-4 flex justify-between border-t pt-3 text-xl font-black text-[#0b2748]"><span>Net Payable</span><span>{money(net)}</span></div></div></div></div></section>
      <section className="rounded-[1.5rem] border border-[#eadfca] bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[9px] font-black uppercase tracking-widest text-[#0d5b4c]">Step 03</p><h2 className="text-xl font-black text-[#0b2748]">Confirm & Continue to Payment</h2><p className="mt-1 text-xs text-slate-500">Once processed, this charge set becomes the bill used by the payment workflow.</p></div><div className="flex flex-wrap gap-2"><Link href={`/billing?visitId=${data.visit.id}`} className="rounded-xl border border-[#eadfca] bg-white px-5 py-3 text-xs font-black text-[#0b2748]">Open Bill</Link><button onClick={()=>void process()} disabled={loading||!data.bill||data.bill.paymentStatus==="PAID"||data.bill.paymentStatus==="DISCARDED"} className="rounded-xl bg-[#0d5b4c] px-6 py-3 text-xs font-black text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40">✓ Confirm Charges & Continue</button></div></div></section>
    </>}
    {error&&<div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}{message&&<div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{message}</div>}{!data&&<section className="rounded-2xl border border-dashed border-[#d7c8a8] bg-white p-10 text-center"><div className="mx-auto max-w-lg"><p className="text-3xl">₹</p><h2 className="mt-3 text-xl font-black text-[#0b2748]">Start with a Patient ID</h2><p className="mt-1 text-sm text-slate-500">Select the correct OPD Visit and SAMS will build the Visit-based charge workspace.</p></div></section>}
  </div></main>;
}

function Info({title,value}:{title:string;value:string}){return <div className="rounded-2xl border border-[#eadfca] bg-white p-4 shadow-sm"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{title}</p><p className="mt-1 font-black text-[#0b2748]">{value}</p></div>}
