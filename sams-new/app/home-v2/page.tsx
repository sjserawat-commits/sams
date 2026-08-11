"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ClinicalLeadCard from "@/components/ClinicalLeadCard";

type Summary = { patientsToday: number; encountersToday: number; diagnosesToday: number; systemStatus: string };
const actions = [["New Patient", "Register and open a patient record", "/patients", "01"], ["New Visit", "Start clinical documentation", "/visits/new", "02"], ["Patients", "Search and manage patient records", "/patients", "03"], ["Reports", "Review operational intelligence", "/reports", "04"]];

export default function HomeV2() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const load = () => fetch("/api/home-v2/summary").then(r => r.json()).then(setSummary).catch(() => setSummary(null));
    load(); const timer = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(timer);
  }, []);
  const time = now ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—";
  const date = now ? now.toLocaleDateString([], { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) : "—";

  return <main className="min-h-screen bg-[#f4f7fb] text-[#082b61]">
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/serawat-logo.png" alt="Serawat Advanced Musculoskeletal, Joint & Spine Centre" width={82} height={46} className="h-11 w-auto object-contain" priority />
          <div><p className="text-lg font-black tracking-tight">SAMS</p><p className="max-w-[310px] text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Serawat Advanced Musculoskeletal, Joint & Spine Centre</p></div>
        </Link>
        <div className="flex items-center gap-3 sm:gap-5"><div className="hidden text-right sm:block"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Live</p><p className="text-sm font-black tabular-nums text-[#082b61]">{time}</p></div><Link href="/dashboard" className="rounded-xl bg-[#082b61] px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-950/15 transition hover:-translate-y-0.5 hover:bg-[#0b63ce]">Command Center <span className="ml-1">↗</span></Link></div>
      </div>
    </header>

    <div className="mx-auto max-w-[1500px] px-5 py-6 sm:px-8 sm:py-8">
      <section className="relative overflow-hidden rounded-[2.25rem] bg-[#082b61] px-6 py-8 text-white shadow-[0_25px_70px_rgba(8,43,97,0.20)] sm:px-10 sm:py-10 lg:px-12 lg:py-12">
        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#0b63ce]/35 blur-3xl" /><div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_330px] lg:items-end"><div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-100"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Serawat clinical operations</div>
          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.02] tracking-[-0.035em] sm:text-5xl lg:text-7xl">Your clinical workspace,<br /><span className="text-blue-300">beautifully organized.</span></h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">A premium front door to patient care, visits, rehabilitation, reporting and hospital operations at Serawat Advanced Musculoskeletal, Joint & Spine Centre.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/patients" className="rounded-xl bg-white px-5 py-3 text-sm font-black text-[#082b61] shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50">New Patient <span className="ml-2">→</span></Link><Link href="/visits/new" className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15">New Visit <span className="ml-2">→</span></Link></div>
        </div><div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">Today</p><p className="mt-3 text-2xl font-black tracking-tight">{date}</p><div className="mt-5 flex items-end justify-between border-t border-white/10 pt-4"><div><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-200">Live system time</p><p className="mt-1 text-3xl font-black tabular-nums">{time}</p></div><span className="mb-1 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">●</span></div></div></div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.5fr_1fr]"><div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_15px_50px_rgba(8,43,97,0.06)] sm:p-8"><div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">Live clinical intelligence</p><h2 className="mt-2 text-2xl font-black tracking-tight">Today at a glance</h2></div><p className="hidden text-xs font-semibold text-slate-400 sm:block">Updated {time}</p></div><div className="mt-7 grid gap-3 sm:grid-cols-3"><Metric label="Patients" value={summary ? String(summary.patientsToday) : "—"} note="Registered today" /><Metric label="Visits" value={summary ? String(summary.encountersToday) : "—"} note="Clinical activity" /><Metric label="Diagnoses" value={summary ? String(summary.diagnosesToday) : "—"} note="Documented today" /></div></div><div className="rounded-[2rem] border border-emerald-100 bg-[#f7fcf9] p-6 shadow-[0_15px_50px_rgba(20,120,70,0.06)] sm:p-8"><div className="flex items-start justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700/60">Platform health</p><h2 className="mt-2 text-2xl font-black text-emerald-900">{summary?.systemStatus ?? "Checking…"}</h2></div><span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm"><span className="absolute h-3 w-3 animate-ping rounded-full bg-emerald-400/40" /><span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500" /></span></div><p className="mt-4 text-sm font-medium leading-6 text-emerald-800/65">Core SAMS services are being monitored continuously.</p><div className="mt-6 flex items-center justify-between border-t border-emerald-100 pt-4 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700/60"><span>System status</span><span className="text-emerald-600">Live</span></div></div></section>

      <section className="mt-8"><div className="mb-5"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">Your workspace</p><h2 className="mt-2 text-3xl font-black tracking-tight">Start with what you need.</h2></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{actions.map(([title, description, href, number]) => <Link key={href + title} href={href} className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(8,43,97,0.05)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_20px_55px_rgba(8,43,97,0.12)]"><div className="flex items-center justify-between"><span className="text-[10px] font-black tracking-[0.2em] text-slate-300">{number}</span><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-[#0b63ce] transition group-hover:bg-[#0b63ce] group-hover:text-white">↗</span></div><h3 className="mt-9 text-lg font-black tracking-tight text-[#082b61]">{title}</h3><p className="mt-2 text-xs font-medium leading-5 text-slate-400">{description}</p><div className="mt-7 h-px w-full bg-slate-100" /><p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#0b63ce] opacity-70 transition group-hover:opacity-100">Open workspace →</p></Link>)}</div></section>

      <section className="mt-8"><ClinicalLeadCard /></section>

      <section className="mt-8 overflow-hidden rounded-[2rem] bg-white shadow-[0_15px_50px_rgba(8,43,97,0.06)] ring-1 ring-slate-200/70"><div className="grid lg:grid-cols-[1fr_auto] lg:items-center"><div className="p-7 sm:p-9"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">SAMS command center</p><h2 className="mt-2 text-2xl font-black tracking-tight">Need the complete operational view?</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Open the full dashboard for detailed patient, visit and clinical activity.</p></div><div className="border-t border-slate-100 p-6 lg:border-l lg:border-t-0"><Link href="/dashboard" className="inline-flex rounded-xl bg-[#082b61] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-950/10 transition hover:-translate-y-0.5 hover:bg-[#0b63ce]">Open Command Center <span className="ml-2">→</span></Link></div></div></section>
      <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 pb-8 text-xs font-medium text-slate-400 sm:flex-row"><span>SAMS • Serawat Advanced Musculoskeletal, Joint & Spine Centre</span><span>Clinical operations workspace</span></footer>
    </div>
  </main>;
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) { return <div className="group rounded-2xl border border-slate-100 bg-[#f8fafc] p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p><p className="mt-5 text-4xl font-black tracking-[-0.04em] text-[#082b61] tabular-nums">{value}</p><p className="mt-1 text-xs font-medium text-slate-400">{note}</p><div className="mt-5 h-1 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-2/3 rounded-full bg-[#0b63ce] transition-all duration-500 group-hover:w-5/6" /></div></div>; }
