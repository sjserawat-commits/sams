"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Patient = { id: number; patientId: string; firstName: string; lastName?: string; gender?: string };
type Visit = { id: number; tokenNumber: number; visitType: string; status?: string; createdAt?: string; departmentMaster?: { name?: string } | null; doctor?: { name?: string } | null };

const nav = [
  ["Home", "/"], ["Dashboard", "/dashboard"], ["Patient", "/patients"],
  ["Clinical", "/clinical"], ["Admin", "/admin"], ["Patient Portal", "/portal"],
];

export default function SlipPrintSearchPage() {
  const [fromReception, setFromReception] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [visitsLoading, setVisitsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFromReception(new URLSearchParams(window.location.search).get("from") === "reception");
    (async () => {
      try {
        const r = await fetch("/api/patients", { cache: "no-store" });
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || "Unable to load patients.");
        setPatients(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load patients.");
      } finally { setLoading(false); }
    })();
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return patients.filter(p => `${p.firstName} ${p.lastName || ""} ${p.patientId || ""}`.toLowerCase().includes(q)).slice(0, 12);
  }, [patients, query]);

  async function choosePatient(patient: Patient) {
    setSelected(patient); setQuery(`${patient.firstName} ${patient.lastName || ""}`.trim()); setError(""); setVisitsLoading(true);
    try {
      const r = await fetch(`/api/patients/${patient.id}/opd-visits`, { cache: "no-store" });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Unable to load OPD visits.");
      setVisits(Array.isArray(data?.visits) ? data.visits : []);
    } catch (e) { setVisits([]); setError(e instanceof Error ? e.message : "Unable to load OPD visits."); }
    finally { setVisitsLoading(false); }
  }

  const dateLabel = (v?: string) => v ? new Date(v).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
  const backHref = fromReception ? "/reception" : "/doctor-desk";
  const backLabel = fromReception ? "← Back to Reception" : "← Back to Doctor Desk";

  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f7efe2_0%,#fffaf2_48%,#eef5f3_100%)] text-slate-900">
      <header className="border-b border-white/15 bg-[#102b3b]/95 text-white shadow-[0_12px_40px_rgba(16,43,59,.18)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-7 lg:px-9">
          <div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg font-black text-[#102b3b]">S</div><div><p className="text-[9px] font-black uppercase tracking-[.24em] text-amber-200">SAMS · Clinical Operations</p><p className="text-sm font-black sm:text-base">Consultation Slip Print</p></div></div>
          <nav className="hidden items-center gap-1 md:flex">{nav.map(([label,path]) => <Link key={label} href={path} className="rounded-lg px-3 py-2 text-[10px] font-black text-white/75 hover:bg-white/10 hover:text-white">{label}</Link>)}</nav>
          <Link href={backHref} className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-[10px] font-black backdrop-blur hover:bg-white/15">{backLabel}</Link>
        </div>
      </header>

      <div className="relative mx-auto max-w-[1280px] px-4 py-6 sm:px-7 lg:py-8">
        <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-56 h-80 w-80 rounded-full bg-teal-100/60 blur-3xl" />

        <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(135deg,rgba(83,54,31,.97),rgba(166,111,52,.93),rgba(47,100,96,.94))] px-6 py-7 text-white shadow-[0_25px_75px_rgba(83,54,31,.22)] sm:px-8 sm:py-8">
          <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full border-[48px] border-white/10" /><div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-amber-200/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div className="max-w-3xl"><p className="text-[9px] font-black uppercase tracking-[.28em] text-amber-100">SAMS · Consultation Documentation</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Print Consultation Slip</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">Find the patient, choose the required OPD visit, and generate a clean consultation slip for the front desk or clinical record.</p></div><div className="shrink-0 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur"><p className="text-[8px] font-black uppercase tracking-[.2em] text-amber-100">Workflow</p><p className="mt-1 text-sm font-black">Search → Select → Print</p></div></div>
        </section>

        <section className="relative -mt-5 mx-2 rounded-[1.6rem] border border-white/80 bg-white/95 p-5 shadow-[0_20px_55px_rgba(37,58,63,.10)] backdrop-blur sm:mx-6 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-teal-700">01 · Find Patient</p><h2 className="mt-1 text-xl font-black text-slate-800">Search Patient</h2><p className="mt-1 text-xs font-semibold text-slate-400">Search by patient name or HID.</p></div><span className="rounded-full bg-teal-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-teal-700">Ready to print</span></div>
          <div className="relative mt-4"><input value={query} onChange={e=>{setQuery(e.target.value);setSelected(null);setVisits([])}} placeholder="Search by Name / HID…" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold outline-none transition focus:border-teal-500 focus:bg-white" autoFocus />
            {!selected && query.trim() && <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">{loading?<p className="p-5 text-sm text-slate-500">Loading patients…</p>:matches.length?matches.map(p=><button key={p.id} onClick={()=>choosePatient(p)} className="flex w-full items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 text-left hover:bg-teal-50 last:border-0"><div><p className="font-black text-slate-800">{p.firstName} {p.lastName||""}</p><p className="mt-1 text-xs font-semibold text-slate-500">HID · {p.patientId}{p.gender?` · ${p.gender}`:""}</p></div><span className="text-xs font-black text-teal-700">Select →</span></button>):<p className="p-5 text-sm font-semibold text-slate-500">No patient found for “{query}”.</p>}</div>}
          </div>
        </section>

        {!selected && !error && <section className="relative mt-5 grid gap-4 md:grid-cols-3">
          {[['01','Find patient','Search using the patient name or HID.'],['02','Choose OPD visit','Select the correct token, department and consultant.'],['03','Print slip','Open the print-ready consultation document.']].map(([step,title,description])=><div key={step} className="rounded-[1.5rem] border border-white/80 bg-white/90 p-5 shadow-[0_14px_40px_rgba(37,58,63,.07)]"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#102b3b] text-[10px] font-black text-amber-200">{step}</span><h3 className="text-sm font-black text-slate-800">{title}</h3></div><p className="mt-3 text-xs font-semibold leading-5 text-slate-500">{description}</p></div>)}
        </section>}

        {!selected && !error && <section className="relative mt-4 rounded-[1.5rem] border border-teal-100 bg-[linear-gradient(110deg,rgba(236,249,247,.92),rgba(255,250,242,.95))] p-5 sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-teal-700">Print Desk</p><h3 className="mt-1 text-lg font-black text-slate-800">A clean slip for a clean handover</h3><p className="mt-1 max-w-2xl text-xs font-semibold leading-5 text-slate-500">Select the visit first. The final document will use the patient and OPD data already stored in SAMS.</p></div><span className="rounded-xl border border-teal-200 bg-white/70 px-4 py-2 text-[9px] font-black uppercase tracking-wide text-teal-700">Patient-safe workflow</span></div></section>}

        {error&&<div className="relative mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

        {selected&&<section className="relative mt-5 rounded-[1.75rem] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_55px_rgba(37,58,63,.08)] sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-teal-700">02 · Select Visit</p><h2 className="mt-1 text-2xl font-black text-slate-800">{selected.firstName} {selected.lastName||""}</h2><p className="mt-1 text-xs font-bold text-slate-500">HID · {selected.patientId}</p></div><button onClick={()=>{setSelected(null);setVisits([]);setQuery("")}} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-50">Change Patient</button></div>
          {visitsLoading?<div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">Loading OPD visits…</div>:visits.length?<div className="mt-6 grid gap-3">{visits.map(v=><div key={v.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 transition hover:border-teal-200 hover:bg-white sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-amber-800">Token #{v.tokenNumber}</span><span className="rounded-full bg-teal-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-teal-800">{v.visitType==='FOLLOW_UP'?"Follow-up":"New Visit"}</span></div><h3 className="mt-2 font-black text-slate-800">{v.departmentMaster?.name||"Department"} · {v.doctor?.name||"Consultant"}</h3><p className="mt-1 text-xs font-semibold text-slate-500">{dateLabel(v.createdAt)} · Status · {v.status||"—"}</p></div><Link href={`/patients/profile/${selected.id}/opd-slip/print?visitId=${v.id}`} className="shrink-0 rounded-xl bg-[#102b3b] px-5 py-3 text-center text-xs font-black text-white shadow-sm hover:bg-teal-800">Print Consultation Slip →</Link></div>)}</div>:<div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">No OPD visits found for this patient.</div>}
        </section>}
      </div>
    </main>
  );
}
