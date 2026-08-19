import Image from "next/image";
import Link from "next/link";

const modules = [
  {
    title: "Place Investigation Order",
    href: "/opd/investigations",
    number: "01",
    eyebrow: "Order & Billing",
    text: "Search the patient, select investigations from the central master, review charges and place the order.",
    icon: "⌁",
  },
  {
    title: "Lab Room",
    href: "/investigation-room",
    number: "02",
    eyebrow: "Laboratory Workflow",
    text: "Patient-wise laboratory queue for sample collection, processing, result entry, verification and report publishing. Imaging and electrodiagnostic workflows stay separate.",
    icon: "◈",
  },
  {
    title: "Reports & Results",
    href: "/investigation-reports",
    number: "03",
    eyebrow: "Report & Print",
    text: "Review finalized patient-wise reports, upload or complete results and print the final investigation report.",
    icon: "▤",
  },
];

export default function InvestigationsPage() {
  return (
    <main className="min-h-screen bg-[#050d17] text-slate-100">
      <div className="min-h-screen bg-[radial-gradient(circle_at_75%_0%,rgba(214,164,67,0.14),transparent_27%),radial-gradient(circle_at_10%_35%,rgba(14,87,145,0.20),transparent_30%),linear-gradient(135deg,#040b13_0%,#071827_48%,#050d17_100%)] px-3 py-3 sm:px-5 lg:px-7 lg:py-5">
        <div className="mx-auto max-w-[1500px]">
          <header className="relative overflow-hidden rounded-[1.7rem] border border-[#d6a443]/30 bg-[linear-gradient(135deg,rgba(8,25,42,0.96),rgba(10,35,56,0.92))] px-4 py-4 shadow-[0_22px_70px_rgba(0,0,0,0.34)] sm:px-6 lg:px-8"><div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#082b61] via-[#d6a443] to-[#f4d58c]" /><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div className="flex min-w-0 items-center gap-3 sm:gap-4"><Link href="/reception" className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-[#071525]/80 px-3 text-xs font-black text-slate-200 transition hover:border-[#d6a443]/50 hover:text-[#f4d58c]"><span className="text-base">←</span><span>Reception</span></Link><div className="h-9 w-px bg-white/10" /><Image src="/serawat-logo.png" alt="SAMS" width={62} height={50} className="h-11 w-auto shrink-0 object-contain" priority /><div className="min-w-0"><p className="truncate text-base font-black tracking-tight text-[#f4d58c] sm:text-lg">Serawat Advanced Multispeciality Joint &amp; Spine Centre</p><p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">SAMS · Investigation Workspace</p></div></div><nav className="flex flex-wrap gap-2 xl:justify-end"><Link href="/investigation-master" className="rounded-xl border border-[#d6a443]/35 bg-[#d6a443]/10 px-3.5 py-2.5 text-[10px] font-black uppercase tracking-wider text-[#f4d58c] transition hover:bg-[#d6a443]/20">Investigation Master</Link><Link href="/investigation-room" className="rounded-xl border border-blue-300/20 bg-blue-500/10 px-3.5 py-2.5 text-[10px] font-black uppercase tracking-wider text-blue-100 transition hover:bg-blue-500/20">Lab Room</Link><Link href="/investigation-reports" className="rounded-xl border border-emerald-300/20 bg-emerald-500/10 px-3.5 py-2.5 text-[10px] font-black uppercase tracking-wider text-emerald-100 transition hover:bg-emerald-500/20">Reports</Link><Link href="/billing" className="rounded-xl border border-amber-300/30 bg-amber-500/15 px-3.5 py-2.5 text-[10px] font-black uppercase tracking-wider text-amber-100 transition hover:bg-amber-500/25">Billing</Link></nav></div></header>
          <section className="relative mt-5 overflow-hidden rounded-[2.25rem] border border-[#d6a443]/35 bg-[linear-gradient(135deg,rgba(7,24,41,0.96),rgba(9,39,62,0.93)_50%,rgba(6,18,30,0.97))] px-5 py-10 text-center shadow-[0_30px_90px_rgba(0,0,0,0.40)] sm:px-10 sm:py-14 lg:px-16 lg:py-16"><div className="relative z-10 mx-auto max-w-4xl"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#d6a443]/40 bg-[#071525]/80 p-2"><Image src="/serawat-logo.png" alt="SAMS" width={70} height={70} className="h-full w-full object-contain" /></div><p className="mt-6 text-[10px] font-black uppercase tracking-[0.30em] text-[#d6a443]">SAMS Diagnostics</p><h1 className="mt-3 text-4xl font-black tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">Welcome to SAMS<br className="hidden sm:block" /> Investigation Workspace</h1><p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">A single premium workspace for investigation ordering, billing, laboratory processing and final patient reports.</p></div></section>
          <section className="mt-6 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,29,47,0.90),rgba(5,17,29,0.94))] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.28)] sm:p-6 lg:p-7"><div className="mb-6 flex flex-wrap items-end justify-between gap-3 px-1"><div><p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#d6a443]">Investigation Workflow</p><h2 className="mt-1.5 text-xl font-black text-white sm:text-2xl">Choose a workspace</h2></div><p className="text-xs font-semibold text-slate-500">Order → Lab → Report</p></div><div className="grid gap-4 lg:grid-cols-3">{modules.map(module=><Link key={module.title} href={module.href} className="group relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-[linear-gradient(145deg,rgba(17,42,65,0.95),rgba(6,19,32,0.98))] p-6 shadow-[0_14px_38px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:border-[#d6a443]/45 sm:p-7"><div className="relative flex items-start justify-between"><div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d6a443]/30 bg-[#071525] text-2xl text-[#f4d58c]">{module.icon}</div><span className="rounded-full border border-[#d6a443]/25 bg-[#d6a443]/10 px-3 py-1.5 text-[10px] font-black tracking-[0.16em] text-[#f4d58c]">{module.number}</span></div><div className="relative mt-6"><p className="text-[9px] font-black uppercase tracking-[0.20em] text-[#d6a443]">{module.eyebrow}</p><h3 className="mt-2 text-xl font-black tracking-tight text-white">{module.title}</h3><p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-300">{module.text}</p></div><div className="relative mt-6 flex items-center justify-between border-t border-white/10 pt-4"><span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">Open workspace</span><span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6a443]/50 bg-[#d6a443] text-lg font-bold text-[#071525]">→</span></div></Link>)}</div></section>
        </div>
      </div>
    </main>
  );
}
