"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Line={id:number;serviceType:string;description:string;quantity:number;unitPrice:number;amount:number};
type Bill={id:number;billNumber:string;receiptNumber:string|null;discount:number;netAmount:number;paymentStatus:string;paymentMethod:string|null;paidAmount:number;balanceAmount:number;paidAt:string|null};
type Data={visit:{id:number;tokenNumber:number;visitType:string;department:string|null};patient:{patientId:string;name:string;phone:string|null};lineItems:Line[];bill:Bill|null};
const label=(x:string)=>({CONSULTATION:"Consultation",INVESTIGATION:"Investigation",PROCEDURE:"Procedure / Surgery",ELECTRODIAGNOSIS:"Electrodiagnosis",PHYSIOTHERAPY:"Physiotherapy / Rehabilitation",PHARMACY:"Pharmacy / Medicine",OTHER:"Other Service"}[x]||x);
const money=(n:number)=>`₹${Number(n||0).toFixed(2)}`;

function Receipt(){
 const s=useSearchParams();
 const [data,setData]=useState<Data|null>(null);
 const [error,setError]=useState("");
 useEffect(()=>{const v=Number(s.get("visitId")||0);if(!v)return;fetch(`/api/billing?visitId=${v}`).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to load receipt.");setData(d)}).catch(e=>setError(e instanceof Error?e.message:"Unable to load receipt."));},[s]);
 useEffect(()=>{if(data)window.setTimeout(()=>window.print(),350)},[data]);
 if(error)return <main className="state">{error}</main>;
 if(!data)return <main className="state">Loading receipt…</main>;
 const b=data.bill;
 if(!b)return <main className="state error">No bill found.</main>;
 const subtotal=b.netAmount+b.discount;
 return <main className="page"><section className="receipt">
  <header className="header">
   <div className="brand">
    <img src="/serawat-logo.png" alt="Serawat logo" className="logo"/>
    <div className="brandText">
     <div className="hospital">SERAWAT ADVANCED</div>
     <div className="hospital second">MULTISPECIALITY JOINT &amp; SPINE CENTRE</div>
     <div className="receiptTitle">PAYMENT RECEIPT</div>
    </div>
   </div>
   <div className="numbers"><div><span>Receipt No.</span><b>{b.receiptNumber||"—"}</b></div><div><span>Bill No.</span><b>{b.billNumber}</b></div></div>
  </header>
  <section className="patient">
   <div><span>Patient</span><b>{data.patient.name}</b><small>ID: {data.patient.patientId}{data.patient.phone?` · ${data.patient.phone}`:""}</small></div>
   <div className="right"><span>Visit</span><b>OPD #{data.visit.id} · Token #{data.visit.tokenNumber}</b><small>{data.visit.visitType}{data.visit.department?` · ${data.visit.department}`:""}</small></div>
  </section>
  <table className="items"><thead><tr><th>Service</th><th>Qty</th><th>Amount</th></tr></thead><tbody>
   {data.lineItems.map(l=><tr key={l.id}><td><strong>{l.description}</strong><small>{label(l.serviceType)} · {money(l.unitPrice)} each</small></td><td>{l.quantity}</td><td>{money(l.amount)}</td></tr>)}
  </tbody></table>
  <section className="totals">
   <div><span>Subtotal</span><b>{money(subtotal)}</b></div>
   {b.discount>0&&<div><span>Discount</span><b>- {money(b.discount)}</b></div>}
   <div className="net"><span>Net Payable</span><b>{money(b.netAmount)}</b></div>
   <div><span>Paid</span><b>{money(b.paidAmount)}</b></div>
   {b.balanceAmount>0&&<div className="outstanding"><span>Outstanding</span><b>{money(b.balanceAmount)}</b></div>}
  </section>
  <section className="paymentMeta"><div><span>Payment Method</span><b>{b.paymentMethod||"—"}</b></div><div className="right"><span>Payment Date</span><b>{b.paidAt?new Date(b.paidAt).toLocaleString("en-IN"):"—"}</b></div></section>
  <footer>Thank you for choosing SERAWAT ADVANCED MULTISPECIALITY JOINT &amp; SPINE CENTRE</footer>
  <div className="printButton"><button onClick={()=>window.print()}>Print Receipt</button></div>
 </section>
 <style jsx global>{`@page{size:auto;margin:0}html,body{margin:0!important;padding:0!important;background:#fff!important}body{font-family:Arial,Helvetica,sans-serif;color:#172033}.page{box-sizing:border-box;min-height:100vh;background:#f1f4f8;padding:18px;display:flex;justify-content:center}.receipt{box-sizing:border-box;width:190mm;max-width:100%;height:auto;background:#fff;border:1px solid #d7dee8;border-radius:14px;padding:10mm 11mm 7mm;box-shadow:0 12px 35px rgba(8,43,97,.10)}.header{display:flex;align-items:center;justify-content:space-between;gap:8mm;border-bottom:1.5px solid #183d70;padding-bottom:5mm}.brand{display:flex;align-items:center;gap:4mm;min-width:0}.logo{width:17mm;height:17mm;object-fit:contain;flex:none}.brandText{min-width:0}.hospital{font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.08;font-weight:800;letter-spacing:.035em;color:#082b61;white-space:nowrap}.hospital.second{font-size:14px;margin-top:1mm}.receiptTitle{font-size:10px;line-height:1;margin-top:3mm;font-weight:900;letter-spacing:.16em;color:#64748b}.numbers{min-width:31mm;text-align:right;font-size:8px;line-height:1.3}.numbers div+div{margin-top:2.5mm}.numbers span{display:block;font-size:6.5px;text-transform:uppercase;letter-spacing:.1em;color:#64748b}.numbers b{display:block;color:#082b61;font-size:8.5px}.patient{display:grid;grid-template-columns:1fr 1fr;gap:8mm;padding:4mm 0;border-bottom:1px solid #d7dee8}.patient span,.paymentMeta span{display:block;font-size:6.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#64748b;margin-bottom:1mm}.patient b{display:block;font-size:9.5px;color:#172033}.patient small,.items small{display:block;font-size:7px;color:#64748b;margin-top:1mm}.right{text-align:right}.items{width:100%;border-collapse:collapse;margin-top:4mm;font-size:8.5px}.items th{padding:2.5mm 1.5mm;border-bottom:1px solid #183d70;text-align:left;font-size:6.5px;letter-spacing:.12em;text-transform:uppercase;color:#64748b}.items th:nth-child(2),.items th:nth-child(3),.items td:nth-child(2),.items td:nth-child(3){text-align:right}.items td{padding:2.7mm 1.5mm;border-bottom:1px solid #e2e8f0;vertical-align:top}.items strong{font-size:8.5px;font-weight:700;color:#172033}.items td:nth-child(2){width:13mm}.items td:nth-child(3){width:28mm;font-weight:800;color:#082b61}.totals{margin:5mm 0 0 auto;width:62mm;font-size:8px}.totals>div{display:flex;justify-content:space-between;gap:8mm;padding:1.2mm 0}.totals .net{margin-top:1.5mm;padding-top:2.5mm;border-top:1px solid #cbd5e1;font-size:11px;font-weight:900;color:#082b61}.totals .outstanding{color:#a11b1b}.paymentMeta{display:grid;grid-template-columns:1fr 1fr;gap:8mm;margin-top:5mm;padding-top:3.5mm;border-top:1px solid #d7dee8;font-size:8px}.paymentMeta b{font-size:8px}.paymentMeta .right{text-align:right}footer{text-align:center;margin-top:6mm;padding-top:3mm;border-top:1px solid #e2e8f0;font-size:6.5px;font-weight:700;letter-spacing:.05em;color:#64748b}.printButton{text-align:center;margin-top:5mm}.printButton button{border:0;border-radius:8px;background:#082b61;color:#fff;padding:9px 18px;font-weight:800;font-size:12px}@media print{html,body{background:#fff!important;width:auto!important;height:auto!important;min-height:0!important}.page{display:block;background:#fff!important;padding:0!important;min-height:0!important}.receipt{width:190mm!important;max-width:none!important;height:auto!important;min-height:0!important;margin:0 auto!important;border:0!important;border-radius:0!important;box-shadow:none!important;padding:8mm 9mm 5mm!important}.header,.patient,.items tr,.totals,.paymentMeta,footer{break-inside:avoid;page-break-inside:avoid}.items{break-inside:auto}.printButton{display:none!important}}`}</style>
 </main>;
}
export default function Page(){return <Suspense fallback={<main className="state">Loading…</main>}><Receipt/></Suspense>}
