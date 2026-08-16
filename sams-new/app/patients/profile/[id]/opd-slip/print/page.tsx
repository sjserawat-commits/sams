"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

type Patient = { id:number; patientId?:string; firstName:string; lastName?:string; gender?:string; phone?:string; mobile?:string; dateOfBirth?:string };
type Visit = { id:number; tokenNumber:number; visitType:string; departmentId?:number|null; doctorId?:number|null; createdAt?:string; status?:string };
type Department = { id:number; name:string };
type Doctor = { id:number; name?:string; firstName?:string; lastName?:string };
type Consultation = { chiefComplaint?:string|null; diagnosis?:string|null; clinicalNotes?:string|null; followUpDate?:string|null };

function dt(v?:string|null){if(!v)return "—";const d=new Date(v);return Number.isNaN(d.getTime())?"—":`${d.toLocaleDateString("en-IN")} · ${d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}`;}
function age(dob?:string){if(!dob)return "—";const d=new Date(dob),n=new Date();let a=n.getFullYear()-d.getFullYear();if(n.getMonth()<d.getMonth()||(n.getMonth()===d.getMonth()&&n.getDate()<d.getDate()))a--;return String(a);}
function section(notes:string|undefined|null,label:string){const text=String(notes||"");const marker=`${label}:`;const i=text.indexOf(marker);if(i<0)return "";const rest=text.slice(i+marker.length);const next=rest.search(/\n\n[A-Za-z /]+:/);return (next>=0?rest.slice(0,next):rest).trim();}

export default function OPDSlipPrint(){
 const params=useParams<{id:string}>();const qs=useSearchParams();const patientId=String(params.id);const visitId=qs.get("visitId");
 const [patient,setPatient]=useState<Patient|null>(null);const [visit,setVisit]=useState<Visit|null>(null);const [consultation,setConsultation]=useState<Consultation|null>(null);const [department,setDepartment]=useState("—");const [doctor,setDoctor]=useState("—");
 useEffect(()=>{(async()=>{try{
   const [pRes,vRes,cRes]=await Promise.all([
    fetch(`/api/patients/${patientId}`,{cache:"no-store"}),
    visitId?fetch(`/api/opd/${visitId}`,{cache:"no-store"}):Promise.resolve(null),
    visitId?fetch(`/api/patients/encounters?opdVisitId=${visitId}`,{cache:"no-store"}):Promise.resolve(null)
   ]);
   if(pRes.ok)setPatient(await pRes.json());
   let v:any=null;if(vRes?.ok){v=await vRes.json();setVisit(v);}
   if(cRes?.ok){const c=await cRes.json();if(c)setConsultation(c);}
   if(v){
    try{
     if(v.departmentId!=null){const r=await fetch(`/api/departments`,{cache:"no-store"});const ds:Department[]=r.ok?await r.json():[];setDepartment(ds.find(x=>x.id===Number(v.departmentId))?.name||"—");}
     if(v.doctorId!=null&&v.departmentId!=null){const r=await fetch(`/api/doctors?departmentId=${v.departmentId}`,{cache:"no-store"});const ds:Doctor[]=r.ok?await r.json():[];const dr=ds.find(x=>x.id===Number(v.doctorId));setDoctor(dr?.name||`${dr?.firstName||""} ${dr?.lastName||""}`.trim()||"—");}
    }catch{}
   }
  }catch{}})()},[patientId,visitId]);
 useEffect(()=>{if(!patient||!visit)return;let cancelled=false;const go=async()=>{try{if(document.fonts?.ready)await document.fonts.ready;}catch{}await new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r())));if(!cancelled)window.print();};const t=window.setTimeout(go,1000);return()=>{cancelled=true;window.clearTimeout(t)}},[patient,visit,consultation]);
 if(!patient||!visit)return <div className="loading">Preparing OPD visit slip…</div>;
 const notes=consultation?.clinicalNotes||"";
 const physical=section(notes,"Physical / Clinical Findings");
 const advice=section(notes,"General Advice");
 const investigations=section(notes,"Investigations");
 const medicines=section(notes,"Medicines / Prescription");
 const finalized=visit.status==="COMPLETED";
 return <main className="a4">
  <header className="head"><div className="brand"><img src="/serawat-logo.png" alt="S"/><div><div className="kicker">SAMS · OPD VISIT RECORD</div><div className="hospital">SAMS SERAWAT ADVANCED MULTISPECIALTY JOINT &amp; SPINE CENTER</div></div></div><div className="opd"><b>OPD · #{visit.tokenNumber}</b><span>{finalized?"FINALIZED VISIT":"VISIT REGISTRATION"}</span><strong>{dt(visit.createdAt)}</strong></div></header>
  <section className="patient"><div><span>Patient</span><b>{patient.firstName} {patient.lastName||""}</b></div><div><span>Patient ID</span><b>{patient.patientId||patient.id}</b></div><div><span>Age / Sex</span><b>{age(patient.dateOfBirth)} / {patient.gender||"—"}</b></div><div><span>Mobile</span><b>{patient.phone||patient.mobile||"—"}</b></div><div><span>DOB</span><b>{patient.dateOfBirth?new Date(patient.dateOfBirth).toLocaleDateString("en-IN"):"—"}</b></div><div><span>Visit No.</span><b>{visit.id}</b></div><div><span>Department</span><b>{department}</b></div><div><span>Consultant</span><b>{doctor}</b></div></section>
  <section className="status"><span>VISIT STATUS</span><b>{finalized?"FINALIZED · CONSULTATION COMPLETED":"OPEN · CONSULTATION IN PROGRESS"}</b></section>
  <section className="two"><div><h3>Chief Complaint</h3><p>{consultation?.chiefComplaint||"—"}</p></div><div><h3>Clinical Diagnosis</h3><p>{consultation?.diagnosis||"—"}</p></div></section>
  <section className="content">
   {physical&&<div className="block"><h3>Physical / Clinical Findings</h3><p>{physical}</p></div>}
   {investigations&&<div className="block"><h3>Investigations</h3><p>{investigations}</p></div>}
   {medicines&&<div className="block"><h3>Medicines / Prescription</h3><p className="pre">{medicines}</p></div>}
   {advice&&<div className="block"><h3>General Advice</h3><p>{advice}</p></div>}
   {!physical&&!investigations&&!medicines&&!advice&&<div className="blank"><h3>Consultation Details</h3><p>No additional consultation notes recorded.</p></div>}
  </section>
  <section className="footer"><div><span>Follow-up Date</span><b>{consultation?.followUpDate?new Date(consultation.followUpDate).toLocaleDateString("en-IN"):"—"}</b></div><div className="sign"><span>Consultant</span><b>{doctor}</b><i>Signature</i></div></section>
  <div className="print-note">{finalized?"Finalized OPD Visit / Consultation Record":"OPD Visit Registration Record"}</div>
  <style jsx global>{`@page{size:A4 portrait;margin:0}html,body{margin:0!important;padding:0!important;background:#fff!important;width:210mm!important;min-width:210mm!important}body{overflow:visible!important}.a4{box-sizing:border-box;width:210mm;height:297mm;min-height:297mm;max-height:297mm;overflow:hidden;position:relative;margin:0;padding:8mm 9mm 7mm;color:#172033;background:#fff;font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}.head{height:25mm;border-bottom:1px solid #183d70;display:flex;align-items:center;justify-content:space-between}.brand{display:flex;align-items:center;gap:4mm;max-width:145mm}.brand img{width:14mm;height:14mm;object-fit:contain}.kicker{font-size:7px;font-weight:800;letter-spacing:.2em;color:#0b63ce;margin-bottom:1.5mm}.hospital{font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:700;letter-spacing:.035em;color:#082b61;line-height:1.15}.opd{display:flex;flex-direction:column;align-items:flex-end;gap:1mm;font-size:9px;color:#082b61;border:1px solid #d7c08a;padding:2mm 3mm;border-radius:2mm;white-space:nowrap}.opd span{font-size:7px;color:#64748b}.opd strong{font-size:8px}.patient{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm 5mm;padding:4mm 0;border-bottom:1px solid #cbd5e1}.patient span,.footer span{display:block;font-size:7px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#64748b}.patient b{display:block;font-size:9px;margin-top:1mm}.status{display:flex;justify-content:space-between;align-items:center;padding:3mm 4mm;margin-top:3mm;border:1px solid #dbe4ef;border-radius:2mm;background:#f8fafc}.status span{font-size:7px;font-weight:800;letter-spacing:.14em;color:#64748b}.status b{font-size:8px;letter-spacing:.08em;color:#087443}.two{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #cbd5e1;margin-top:3mm}.two>div{min-height:30mm;padding:4mm;border:1px solid #cbd5e1;border-bottom:0}.two>div+div{border-left:0}.two h3,.block h3,.blank h3{margin:0 0 2mm;font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:#082b61}.two p,.block p,.blank p{margin:0;font-size:9px;line-height:1.5;white-space:pre-wrap}.content{padding:3mm 0;min-height:135mm}.block{border:1px solid #dbe4ef;border-radius:2mm;padding:3.5mm 4mm;margin-bottom:3mm}.block h3{color:#0b63ce}.pre{white-space:pre-wrap}.blank{min-height:40mm;border:1px solid #dbe4ef;border-radius:2mm;padding:4mm}.footer{border-top:1px solid #cbd5e1;padding-top:4mm;display:flex;justify-content:space-between;align-items:flex-end}.footer b{display:block;font-size:9px;margin-top:1.2mm;color:#082b61}.sign{text-align:center;min-width:45mm}.sign i{display:block;font-style:normal;font-size:7px;color:#64748b;margin-top:7mm;border-top:1px solid #64748b;padding-top:1mm}.print-note{position:absolute;bottom:3mm;left:9mm;font-size:6.5px;color:#94a3b8}@media print{html,body{width:210mm!important;height:297mm!important;min-height:297mm!important;max-height:297mm!important;overflow:hidden!important;background:#fff!important}.a4{width:210mm!important;height:297mm!important;min-height:297mm!important;max-height:297mm!important;overflow:hidden!important;margin:0!important;box-shadow:none!important;page-break-before:avoid!important;page-break-after:avoid!important;page-break-inside:avoid!important}.loading{display:none!important}}`}</style>
 </main>;
}
