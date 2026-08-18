"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Navigation from "@/components/Navigation";

type Patient = { id: string; firstName?: string; lastName?: string; patientId?: string; gender?: string; phone?: string; dateOfBirth?: string };

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch("/api/patients").then((r) => r.json()).then((data) => setPatients(Array.isArray(data) ? data : [])).catch(() => setPatients([])).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => { const q = query.trim().toLowerCase(); if (!q) return patients; return patients.filter((p) => [p.firstName, p.lastName, p.patientId, p.phone, p.dateOfBirth, p.gender].filter(Boolean).join(" ").toLowerCase().includes(q)); }, [patients, query]);

  return (
    <main className="min-h-screen bg-[#eaf1ee] text-slate-900 lg:flex">
      <div className="lg:sticky lg:top-0 lg:h-screen lg:w-[270px] lg:shrink-0"><Sidebar variant="reception" /></div>
      <div className="min-w-0 flex-1">
        <Navigation variant="reception" />
        <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.pexels.com/photos/1582519/pexels-photo-1582519.jpeg?auto=compress&cs=tinysrgb&w=2200')" }} />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(232,241,238,0.84),rgba(240,246,243,0.94)_42%,rgba(235,242,239,0.98))]" />
          <div className="relative mx-auto max-w-[1500px] px-4 py-7 sm:px-7 lg:px-10 lg:py-9">
            <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#35705a]">SAMS · Clinical Operations</p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-[#12382a] sm:text-5xl">Patient Registry</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">A spacious directory for finding, verifying and continuing an existing patient&apos;s care.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-[#173f30]/20 bg-white/90 px-4 py-3 text-sm font-bold text-[#173f30] shadow-sm backdrop-blur-sm transition hover:bg-white hover:border-[#173f30]/40">← Back to Dashboard</Link>
                <Link href="/reception" className="inline-flex items-center gap-2 rounded-xl border border-[#35705a]/25 bg-white/90 px-4 py-3 text-sm font-bold text-[#25634b] shadow-sm backdrop-blur-sm transition hover:bg-white hover:border-[#35705a]/50">Reception</Link>
                <Link href="/patients/new" className="inline-flex items-center gap-2 rounded-xl bg-[#b88b2d] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#6b5524]/15 transition hover:bg-[#9f7724]">+ Register Patient</Link>
              </div>
            </header>

            <section className="rounded-[1.5rem] border border-white/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(35,70,55,0.10)] backdrop-blur-md sm:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#35705a]">Returning Patient Workflow</p><h2 className="mt-1 text-xl font-black text-[#173f30] sm:text-2xl">Find an existing patient</h2><p className="mt-1 text-sm text-slate-500">Search by Patient ID, name, mobile number, date of birth or gender.</p></div><div className="flex w-full max-w-2xl items-center rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#edf5f0] text-lg text-[#35705a]">⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search patient ID, name, mobile or DOB" className="h-10 w-full bg-transparent px-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400" aria-label="Search patients" />{query && <button type="button" onClick={() => setQuery("")} className="mr-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100">Clear</button>}</div></div>
            </section>

            <section className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/95 shadow-[0_18px_55px_rgba(35,70,55,0.12)]">
              <div className="flex flex-col gap-3 border-b border-slate-100 bg-white/90 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7"><div><p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#35705a]">Patient Directory</p><h2 className="mt-1 text-xl font-black text-[#173f30] sm:text-2xl">{loading ? "Loading records…" : `${filtered.length} matching record${filtered.length === 1 ? "" : "s"}`}</h2></div><span className="w-fit rounded-full border border-[#b88b2d]/30 bg-[#fff9ec] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#87671e]">Clinical Records</span></div>
              {loading ? <div className="px-6 py-16 text-center text-sm font-semibold text-slate-500">Loading patient records…</div> : filtered.length === 0 ? <div className="px-6 py-16 text-center"><p className="text-lg font-black text-[#173f30]">No matching patient found</p><p className="mt-2 text-sm text-slate-500">Try another search or register a new patient.</p><Link href="/patients/new" className="mt-5 inline-flex rounded-xl bg-[#173f30] px-5 py-3 text-sm font-bold text-white">Register New Patient</Link></div> : <div className="overflow-x-auto"><div className="min-w-[780px]"><div className="grid grid-cols-[1.5fr_170px_170px_120px] bg-[#173f30] px-6 py-3 text-[9px] font-black uppercase tracking-[0.18em] text-[#f2d58b]"><span>Patient</span><span>Patient ID</span><span>Contact</span><span className="text-right">Action</span></div>{filtered.slice(0, 100).map((p, index) => <div key={p.id} className={`grid grid-cols-[1.5fr_170px_170px_120px] items-center px-6 py-4 transition hover:bg-[#f1f7f3] ${index < Math.min(filtered.length, 100) - 1 ? "border-b border-slate-100" : ""}`}><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#b88b2d]/35 bg-[#fff8e8] text-sm font-black text-[#87671e]">{(p.firstName?.[0] || "P").toUpperCase()}</div><div><p className="font-bold text-[#173f30]">{[p.firstName, p.lastName].filter(Boolean).join(" ") || "Unnamed patient"}</p><p className="mt-0.5 text-[10px] font-medium text-slate-400">{p.dateOfBirth ? `DOB: ${new Date(p.dateOfBirth).toLocaleDateString("en-IN")}` : "Date of birth not recorded"}</p></div></div><span className="text-sm font-semibold text-slate-600">{p.patientId ?? p.id}</span><span className="text-sm text-slate-500">{p.phone ?? "Not provided"}</span><div className="text-right"><Link href={`/patients/profile/${p.id}`} className="inline-flex rounded-lg border border-[#35705a]/20 bg-[#edf5f0] px-3 py-2 text-xs font-black text-[#25634b] transition hover:bg-[#173f30] hover:text-white">Open Profile →</Link></div></div>)}</div></div>}
              {filtered.length > 100 && <p className="border-t border-slate-100 px-6 py-3 text-center text-xs font-semibold text-slate-400">Showing first 100 results. Refine your search to find a specific record.</p>}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
