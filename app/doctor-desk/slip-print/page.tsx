"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Patient = { id: number; patientId?: string; firstName: string; lastName?: string; gender?: string; phone?: string };
type Visit = { id: number; tokenNumber: number; visitType: string; status: string; createdAt: string; departmentMaster?: { name: string } | null; doctor?: { name: string } | null };

export default function SlipPrintSearchPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [visitLoading, setVisitLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/patients", { cache: "no-store" })
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d?.error || "Unable to load patients."); return d; })
      .then(d => setPatients(Array.isArray(d) ? d : []))
      .catch(e => setError(e instanceof Error ? e.message : "Unable to load patients."))
      .finally(() => setLoading(false));
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return patients.filter(p => `${p.firstName} ${p.lastName || ""} ${p.patientId || ""} ${p.phone || ""}`.toLowerCase().includes(q)).slice(0, 20);
  }, [patients, query]);

  async function choosePatient(patient: Patient) {
    setSelected(patient); setQuery(`${patient.firstName} ${patient.lastName || ""}`.trim()); setVisits([]); setVisitLoading(true); setError("");
    try {
      const r = await fetch(`/api/patients/${patient.id}/opd-visits`, { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || "Unable to load OPD visits.");
      setVisits(Array.isArray(d?.visits) ? d.visits : []);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load OPD visits."); }
    finally { setVisitLoading(false); }
  }

  return (
    <main className="min-h-screen bg-[#050c16] text-slate-100">
      <header className="border-b border-[#d6a443]/30 bg-[#061525] px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
          <Link href="/doctor-desk" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black hover:border-[#d6a443]/50">← Back</Link>
          <div className="flex items-center gap-3 text-right"><Image src="/serawat-logo.png" alt="SAMS logo" width={42} height={42} className="h-10 w-10 rounded-xl bg-white p-1 object-contain" /><div><p className="text-lg font-black text-[#d6a443]">SAMS</p><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-300">SERAWAT ADVANCED MULTISPECIALITY JOINT &amp; SPINE CENTRE</p></div></div>
        </div>
      </header>

      <div className="mx-auto max-w-[1100px] px-4 py-7 sm:px-7 lg:py-10">
        <section className="rounded-[2rem] border border-[#d6a443]/35 bg-[linear-gradient(135deg,#061525,#0c263d)] p-6 shadow-[0_25px_80px_rgba(0,0,0,.35)] sm:p-8">
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#d6a443]">SAMS · Slip Print</p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Search Patient &amp; Print OPD Slip</h1>
          <p className="mt-2 text-sm text-slate-300">Search by patient name or HID, select the required OPD visit, and print the existing OPD slip.</p>
          <div className="relative mt-6">
            <input value={query} onChange={e => { setQuery(e.target.value); if (!e.target.value) { setSelected(null); setVisits([]); } }} placeholder="Search by Name or HID · e.g. Suraj Serawat / SAMS-0001" className="w-full rounded-2xl border border-white/15 bg-[#071525] px-5 py-4 text-sm font-bold text-white outline-none placeholder:text-slate-500 focus:border-[#d6a443]" autoComplete="off" />
            {query.trim() && !selected && <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#071525] shadow-2xl">{loading ? <div className="p-4 text-sm text-slate-400">Loading patients…</div> : matches.length ? matches.map(p => <button key={p.id} type="button" onClick={() => choosePatient(p)} className="flex w-full items-center justify-between gap-4 border-b border-white/5 px-5 py-4 text-left hover:bg-white/5"><span><b className="block text-sm text-white">{p.firstName} {p.lastName || ""}</b><span className="text-xs text-slate-400">HID · {p.patientId || p.id} · Mobile · {p.phone || "—"}</span></span><span className="text-xs font-black text-[#d6a443]">Select →</span></button>) : <div className="p-4 text-sm text-slate-400">No matching patient found.</div>}</div>}
          </div>
        </section>

        {error && <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-200">{error}</div>}

        {selected && <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#d6a443]">Selected Patient</p><h2 className="mt-1 text-2xl font-black">{selected.firstName} {selected.lastName || ""}</h2><p className="mt-1 text-xs text-slate-400">HID · {selected.patientId || selected.id}</p></div><button type="button" onClick={() => { setSelected(null); setVisits([]); setQuery(""); }} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-black">Change Patient</button></div>
          {visitLoading ? <div className="mt-6 rounded-2xl bg-white/5 p-8 text-center text-sm text-slate-400">Loading OPD visits…</div> : visits.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">No OPD visit found for this patient.</div> : <div className="mt-6 space-y-3">{visits.map(v => <div key={v.id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#071525] p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#d6a443]">OPD · Token #{v.tokenNumber}</p><p className="mt-1 text-sm font-black text-white">{v.departmentMaster?.name || "Department"} · {v.doctor?.name || "Consultant not assigned"}</p><p className="mt-1 text-xs text-slate-400">{new Date(v.createdAt).toLocaleString("en-IN")} · {v.visitType === "FOLLOW_UP" ? "Follow-up" : "New Visit"} · {v.status}</p></div><Link href={`/patients/profile/${selected.id}/opd-slip/print?visitId=${v.id}`} className="rounded-xl bg-[#d6a443] px-5 py-3 text-center text-xs font-black text-[#071525]">Print OPD Slip →</Link></div>)}</div>}
        </section>}
      </div>
    </main>
  );
}
