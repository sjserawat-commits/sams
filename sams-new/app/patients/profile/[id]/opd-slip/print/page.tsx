"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

type Patient = { id:number; patientId?:string; firstName:string; lastName?:string; gender?:string; phone?:string; mobile?:string; dateOfBirth?:string };
type Visit = { id:number; tokenNumber:number; visitType:string; departmentId?:number|null; doctorId?:number|null; createdAt?:string; status?:string };
type Department = { id:number; name:string };
type Doctor = { id:number; name?:string; firstName?:string; lastName?:string };

function dt(v?:string|null){ if(!v)return "—"; const d=new Date(v); return Number.isNaN(d.getTime())?"—":`${d.toLocaleDateString("en-IN")} · ${d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}`; }
function age(dob?:string){ if(!dob)return "—"; const d=new Date(dob),n=new Date(); let a=n.getFullYear()-d.getFullYear(); if(n.getMonth()<d.getMonth()||(n.getMonth()===d.getMonth()&&n.getDate()<d.getDate()))a--; return String(a); }

export default function PreConsultationOPDPrint(){
 const params=useParams<{id:string}>(); const qs=useSearchParams(); const patientId=String(params.id); const visitId=qs.get("visitId");
 const [patient,setPatient]=useState<Patient|null>(null); const [visit,setVisit]=useState<Visit|null>(null); const [department,setDepartment]=useState("—"); const [doctor,setDoctor]=useState("—");
 useEffect(()=>{(async()=>{try{
  const [pRes,vRes]=await Promise.all([fetch(`/api/patients/${patientId}`),visitId?fetch(`/api/opd/${visitId}`):Promise.resolve(null)]);
  if(pRes.ok)setPatient(await pRes.json()); if(vRes?.ok)setVisit(await vRes.json());
  const v=vRes?.ok?await vRes.clone().json():null;
  if(v){ const depRes=await fetch(`/api/departments`); const deps:Department[]=depRes.ok?await depRes.json():[]; setDepartment(deps.find(x=>x.id===Number(v.departmentId))?.name||"—"); const drRes=await fetch(`/api/doctors?departmentId=${v.departmentId}`); const ds:Doctor[]=drRes.ok?await drRes.json():[]; const dr=ds.find(x=>x.id===Number(v.doctorId)); setDoctor(dr?.name||`${dr?.firstName||""} ${dr?.lastName||""}`.trim()||"—"); }
 }catch{}})()},[patientId,visitId]);
 useEffect(()=>{const t=setTimeout(()=>window.print(),350); return()=>clearTimeout(t)},[]);
 if(!patient||!visit)return <div className="loading">Preparing OPD slip…</div>;
 return <main className="a4">
  <header className="head"><div className="brand"><img src="/serawat-logo.png" alt="S"/><div><div className="hospital">SERAWAT ADVANCED MUSCULOSKELETAL, JOINT &amp; SPINE CENTRE</div></div></div><div className="opd"><b>OPD · #{visit.tokenNumber}</b><span>Visit Registration</span><strong>{dt(visit.createdAt)}</strong></div></header>
  <section className="patient"><div><span>Patient</span><b>{patient.firstName} {patient.lastName||""}</b></div><div><span>Patient ID</span><b>{patient.patientId||patient.id}</b></div><div><span>Age / Sex</span><b>{age(patient.dateOfBirth)} / {patient.gender||"—"}</b></div><div><span>Mobile</span><b>{patient.phone||patient.mobile||"—"}</b></div><div><span>DOB</span><b>{patient.dateOfBirth?new Date(patient.dateOfBirth).toLocaleDateString("en-IN"):"—"}</b></div><div><span>Visit No.</span><b>{visit.id}</b></div><div><span>Department</span><b>{department}</b></div><div><span>Consultant</span><b>{doctor}</b></div></section>
  <section className="complaints"><div><h3>Chief Complaint</h3></div><div><h3>Clinical Diagnosis</h3></div></section>
  <section className="body"><aside></aside><div className="main"><div className="blank-treatment"><h3>Medicines / Prescription</h3></div><div className="footer"><div><span>Follow-up Date</span><b>—</b></div><div className="sign"><span>Consultant</span><b>{doctor}</b><i>Signature</i></div></div></div></section>
  <style jsx global>{`@page{size:A4 portrait;margin:0}*{box-sizing:border-box}html,body{margin:0!important;padding:0!important;background:#fff}.a4{width:210mm;height:297mm;overflow:hidden;padding:8mm 9mm 7mm;color:#172033;font-family:Arial,Helvetica,sans-serif}.head{height:25mm;border-bottom:1px solid #183d70;display:flex;align-items:center;justify-content:space-between}.brand{display:flex;align-items:center;gap:4mm}.brand img{width:14mm;height:14mm;object-fit:contain;display:block}.hospital{font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:700;letter-spacing:.045em;color:#082b61;line-height:1.15}.opd{display:flex;flex-direction:column;align-items:flex-end;gap:1mm;font-size:9px;color:#082b61;border:1px solid #d7c08a;padding:2mm 3mm;border-radius:2mm}.opd span{font-size:7px;color:#64748b}.opd strong{font-size:8px}.patient{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm 5mm;padding:4mm 0;border-bottom:1px solid #cbd5e1}.patient span,.footer span{display:block;font-size:7px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#64748b}.patient b{display:block;font-size:9px;margin-top:1mm}.complaints{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #cbd5e1}.complaints>div{height:25mm;padding:3.5mm 4mm}.complaints>div+div{border-left:1px solid #cbd5e1}.complaints h3,.blank-treatment h3{margin:0;font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:#082b61}.body{display:grid;grid-template-columns:39mm 1fr;height:166mm;border-bottom:1px solid #cbd5e1}.body aside{border-right:1px solid #cbd5e1}.main{padding:4mm 4.5mm;display:flex;flex-direction:column}.blank-treatment{min-height:45mm;border-bottom:1px solid #e2e8f0}.footer{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;padding-top:4mm}.footer b{display:block;font-size:9px;margin-top:1.2mm;color:#082b61}.sign{text-align:center;min-width:45mm}.sign i{display:block;font-style:normal;font-size:7px;color:#64748b;margin-top:7mm;border-top:1px solid #64748b;padding-top:1mm}.loading{font:700 14px Arial;padding:40px}`}</style>
 </main>
}
