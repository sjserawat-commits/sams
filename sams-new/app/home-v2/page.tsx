"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const actions = [
  ["Register Patient", "Create a new patient record", "/patients", "♙", "primary"],
  ["New Encounter", "Start clinical documentation", "/encounters", "✚", "primary"],
  ["Clinical Modules", "Open clinical workflows", "/clinical", "⌁", "secondary"],
  ["PM&R Workspace", "Rehabilitation workspace", "/pmr", "◈", "secondary"],
  ["Billing & Finance", "Manage financial workflows", "/billing", "₹", "secondary"],
  ["Reports & Analytics", "Review operational insights", "/reports", "▤", "secondary"],
];

type Summary = {
  patientsToday: number;
  encountersToday: number;
  diagnosesToday: number;
  systemStatus: string;
};

export default function HomeV2() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    fetch("/api/home-v2/summary")
      .then((response) => response.json())
      .then((data) => setSummary(data))
      .catch(() => setSummary(null));

    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const cards = [
    ["01", "Patients", "Registered today", summary ? String(summary.patientsToday) : "—", "PATIENT FLOW", "↗"],
    ["02", "Encounters", "Clinical activity today", summary ? String(summary.encountersToday) : "—", "CARE ACTIVITY", "↗"],
    ["03", "Diagnoses", "Documented today", summary ? String(summary.diagnosesToday) : "—", "CLINICAL DATA", "✓"],
  ];

  return (
    <main className="min-h-screen bg-[#f5f8fc] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0b63ce] text-xl font-black text-white shadow-lg shadow-blue-900/20">S</div>
            <div><div className="text-xl font-bold tracking-tight text-[#082b61]">SAMS</div><div className="text-xs font-medium text-slate-400">Smart Advanced Medical System</div></div>
          </div>
          <div className="hidden items-center gap-6 sm:flex">
            <div className="text-right"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Live system time</p><p className="mt-0.5 text-sm font-bold tabular-nums text-[#082b61]">{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p></div>
            <Link href="/dashboard" className="rounded-xl bg-[#0b63ce] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#0958b5]">Open Command Center →</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] space-y-8 px-5 py-8 sm:px-8 sm:py-10">
        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0b63ce] via-[#0a56b4] to-[#082b61] p-7 text-white shadow-xl shadow-blue-900/15 sm:p-10 lg:p-12">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold">CLINICAL OPERATIONS</span>
              <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Everything important, at a glance.</h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">A secure, modern workspace for patient care, clinical encounters and hospital workflows.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/patients" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0b4ea2] shadow-lg hover:bg-blue-50">+ New Patient</Link>
                <Link href="/encounters" className="rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/20">+ New Encounter</Link>
              </div>
            </div>
            <div className="min-w-[210px] rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">Today</p>
              <p className="mt-2 text-xl font-bold">{now.toLocaleDateString([], { weekday: "long" })}</p>
              <p className="mt-1 text-sm text-blue-100">{now.toLocaleDateString([], { day: "2-digit", month: "long", year: "numeric" })}</p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">Live clinical intelligence</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-[#082b61]">Today at a glance</h2></div>
            <p className="text-xs font-medium text-slate-400">Updated continuously · {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            {cards.map(([number, title, subtitle, value, label, mark], index) => (
              <div key={title} className={`${index === 0 ? "lg:col-span-5" : "lg:col-span-3.5"} group relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(8,43,97,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(8,43,97,0.12)]`}>
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0b63ce] to-[#54a5ff] opacity-90" />
                <div className="flex items-start justify-between">
                  <div><span className="text-[10px] font-black tracking-[0.2em] text-slate-300">{number}</span><p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</p></div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-[#0b63ce] transition-transform duration-300 group-hover:scale-110">{mark}</span>
                </div>
                <div className="mt-8 flex items-end justify-between gap-4"><div><p className="text-sm font-bold text-slate-500">{title}</p><p className="mt-1 text-xs font-medium text-slate-400">{subtitle}</p></div><p className="text-5xl font-black tracking-[-0.05em] text-[#082b61] tabular-nums">{value}</p></div>
                <div className="mt-6 h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-2/3 rounded-full bg-[#0b63ce] opacity-70 transition-all duration-500 group-hover:w-4/5" /></div>
              </div>
            ))}

            <div className="group relative overflow-hidden rounded-[1.75rem] border border-[#bfe3cf] bg-[#f7fcf9] p-6 shadow-[0_12px_40px_rgba(20,120,70,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(20,120,70,0.12)] lg:col-span-3.5">
              <div className="flex items-start justify-between"><div><span className="text-[10px] font-black tracking-[0.2em] text-emerald-300">04</span><p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-emerald-700/60">SYSTEM HEALTH</p></div><span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm"><span className="absolute h-3 w-3 animate-ping rounded-full bg-emerald-400/40" /><span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500" /></span></div>
              <div className="mt-8"><p className="text-4xl font-black tracking-tight text-emerald-800">{summary?.systemStatus ?? "Checking…"}</p><p className="mt-2 text-xs font-semibold text-emerald-700/70">All core SAMS services</p></div>
              <div className="mt-6 flex items-center gap-2 text-[11px] font-bold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Operational <span className="ml-auto text-emerald-600/50">LIVE</span></div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0b63ce]">Clinical activity</p><h2 className="mt-2 text-xl font-bold text-[#082b61]">A focused workspace for your team</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Move from registration to encounter documentation, rehabilitation workflows, billing and reporting without leaving the SAMS workspace.</p><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-400">PATIENT CARE</p><p className="mt-2 text-sm font-bold text-slate-700">Registration & records</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-400">DOCUMENTATION</p><p className="mt-2 text-sm font-bold text-slate-700">Encounters & clinical notes</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-400">OPERATIONS</p><p className="mt-2 text-sm font-bold text-slate-700">Reports & finance</p></div></div></div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/60">
            <div className="rounded-[1.35rem] bg-slate-50 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">Quick actions</p><h2 className="mt-1 text-xl font-bold tracking-tight text-[#082b61]">Clinical workflows</h2><p className="mt-1 text-xs text-slate-400">Start where you need to be.</p></div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-[#0b63ce] shadow-sm">↗</div></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">{actions.map(([label, description, href, icon, tone]) => tone === "primary" ? (<Link key={href} href={href} className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/10"><div className="absolute inset-y-0 left-0 w-1 bg-[#0b63ce]" /><div className="flex items-center gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0b63ce] text-lg font-bold text-white shadow-md shadow-blue-900/20">{icon}</span><span className="min-w-0"><span className="block text-sm font-bold text-[#082b61]">{label}</span><span className="mt-0.5 block text-xs font-medium text-slate-400">{description}</span></span><span className="ml-auto text-lg text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-[#0b63ce]">→</span></div></Link>) : (<Link key={href} href={href} className="group rounded-2xl border border-white bg-white px-4 py-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md"><div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-[#0b63ce] transition-colors group-hover:bg-[#0b63ce] group-hover:text-white">{icon}</span><span className="min-w-0"><span className="block text-sm font-bold text-slate-700 group-hover:text-[#0b63ce]">{label}</span><span className="block truncate text-[11px] font-medium text-slate-400">{description}</span></span><span className="ml-auto text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-[#0b63ce]">→</span></div></Link>))}</div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-[#082b61] p-6 text-white shadow-lg sm:p-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">SAMS platform</p><h2 className="mt-2 text-2xl font-bold">Ready for clinical operations.</h2><p className="mt-2 text-sm text-blue-100">Open the command center to manage live patient and encounter activity.</p></div><Link href="/dashboard" className="shrink-0 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#082b61] hover:bg-blue-50">Go to Dashboard →</Link></div></section>

        <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row"><span>SAMS • Smart Advanced Medical System</span><span>Clinical operations workspace</span></footer>
      </div>
    </main>
  );
}
