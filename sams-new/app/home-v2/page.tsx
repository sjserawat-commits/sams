"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const actions = [
  ["Register Patient", "Register a new patient", "/patients", "♙"],
  ["New Encounter", "Start clinical documentation", "/encounters", "✚"],
  ["Clinical Modules", "Open clinical tools", "/clinical", "⌁"],
  ["PM&R Workspace", "Rehabilitation workflows", "/pmr", "◈"],
  ["Billing & Finance", "Manage financial workflows", "/billing", "₹"],
  ["Reports & Analytics", "Review operational insights", "/reports", "▤"],
];

type Summary = {
  patientsToday: number;
  encountersToday: number;
  diagnosesToday: number;
  systemStatus: string;
};

export default function HomeV2() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    fetch("/api/home-v2/summary")
      .then((response) => response.json())
      .then((data) => setSummary(data))
      .catch(() => setSummary(null));
  }, []);

  const cards = [
    ["Patients Today", "Patients registered today", summary ? String(summary.patientsToday) : "—", "♙"],
    ["Encounters Today", "Clinical encounters today", summary ? String(summary.encountersToday) : "—", "✚"],
    ["Diagnoses", "Encounters with diagnosis", summary ? String(summary.diagnosesToday) : "—", "✓"],
    ["System Status", "Core SAMS services", summary?.systemStatus ?? "Checking…", "●"],
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0b63ce] text-xl font-black text-white shadow-lg shadow-blue-900/20">S</div>
            <div><div className="text-xl font-bold text-[#082b61]">SAMS</div><div className="text-xs font-medium text-slate-400">Smart Advanced Medical System</div></div>
          </div>
          <Link href="/dashboard" className="rounded-xl bg-[#0b63ce] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#0958b5]">Open Command Center →</Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] space-y-8 px-5 py-8 sm:px-8 sm:py-10">
        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0b63ce] via-[#0a56b4] to-[#082b61] p-7 text-white shadow-xl shadow-blue-900/15 sm:p-10 lg:p-12">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold">CLINICAL OPERATIONS</span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Everything important, at a glance.</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">A secure, modern workspace for patient care, clinical encounters and hospital workflows.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/patients" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0b4ea2] shadow-lg hover:bg-blue-50">+ New Patient</Link>
              <Link href="/encounters" className="rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/20">+ New Encounter</Link>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0b63ce]">Today at a glance</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-[#082b61]">Clinical command center</h2></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(([title, note, value, icon]) => <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{title}</p><p className="mt-3 text-2xl font-bold text-[#082b61]">{value}</p></div><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 font-bold text-[#0b63ce]">{icon}</span></div><p className="mt-3 text-xs font-medium text-slate-400">{note}</p></div>)}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0b63ce]">Clinical activity</p><h2 className="mt-2 text-xl font-bold text-[#082b61]">A focused workspace for your team</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Move from registration to encounter documentation, rehabilitation workflows, billing and reporting without leaving the SAMS workspace.</p><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-400">PATIENT CARE</p><p className="mt-2 text-sm font-bold text-slate-700">Registration & records</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-400">DOCUMENTATION</p><p className="mt-2 text-sm font-bold text-slate-700">Encounters & clinical notes</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-400">OPERATIONS</p><p className="mt-2 text-sm font-bold text-slate-700">Reports & finance</p></div></div></div>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-6 py-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0b63ce]">Quick actions</p><h2 className="mt-1 font-bold text-[#082b61]">Common workflows</h2></div><div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-1">{actions.map(([label,note,href,icon], index) => <Link key={href} href={href} className={`group flex items-center justify-between rounded-2xl border px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${index === 0 ? "border-blue-100 bg-blue-50/70 hover:border-blue-200 hover:bg-blue-50" : "border-slate-100 bg-slate-50/80 hover:border-blue-100 hover:bg-blue-50"}`}><span className="flex items-center gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-bold shadow-sm transition-transform group-hover:scale-105 ${index === 0 ? "bg-[#0b63ce] text-white" : "bg-white text-[#0b63ce]"}`}>{icon}</span><span><span className="block text-sm font-bold text-slate-700 group-hover:text-[#0b63ce]">{label}</span><span className="mt-0.5 block text-[11px] font-medium text-slate-400">{note}</span></span></span><span className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-[#0b63ce]">→</span></Link>)}</div></div>
        </section>

        <section className="rounded-2xl bg-[#082b61] p-6 text-white shadow-lg sm:p-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">SAMS platform</p><h2 className="mt-2 text-2xl font-bold">Ready for clinical operations.</h2><p className="mt-2 text-sm text-blue-100">Open the command center to manage live patient and encounter activity.</p></div><Link href="/dashboard" className="shrink-0 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#082b61] hover:bg-blue-50">Go to Dashboard →</Link></div></section>

        <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row"><span>SAMS • Smart Advanced Medical System</span><span>Clinical operations workspace</span></footer>
      </div>
    </main>
  );
}
