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

const workflow = [
  ["01", "Order", "Patient + investigations"],
  ["02", "Lab", "Collection + processing"],
  ["03", "Verify", "Result verification"],
  ["04", "Report", "Publish + print"],
];

export default function InvestigationsPage() {
  return (
    <main className="min-h-screen bg-[#050b13] text-slate-100">
      <div className="min-h-screen bg-[radial-gradient(circle_at_78%_4%,rgba(214,164,67,0.15),transparent_24%),radial-gradient(circle_at_5%_38%,rgba(13,93,157,0.18),transparent_30%),linear-gradient(135deg,#040a12_0%,#071725_48%,#050c15_100%)] px-3 py-3 sm:px-5 lg:px-8 lg:py-5">
        <div className="mx-auto max-w-[1540px]">
          <header className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(135deg,rgba(7,22,37,.98),rgba(10,34,54,.94))] shadow-[0_22px_70px_rgba(0,0,0,.35)]">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#082b61] via-[#d6a443] to-[#f4d58c]" />
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-7">
              <div className="flex min-w-0 items-center gap-3">
                <Link href="/reception" className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-black/15 px-3 text-xs font-black text-slate-200 transition hover:border-[#d6a443]/50 hover:text-[#f4d58c]"><span className="text-base">←</span><span>Reception</span></Link>
                <div className="h-9 w-px bg-white/10" />
                <Image src="/serawat-logo.png" alt="SAMS" width={58} height={48} className="h-11 w-auto shrink-0 object-contain" priority />
                <div className="min-w-0"><p className="truncate text-base font-black tracking-tight text-[#f4d58c] sm:text-lg">Serawat Advanced Multispeciality Joint &amp; Spine Centre</p><p className="mt-0.5 text-[9px] font-black uppercase tracking-[.24em] text-slate-400">SAMS · Investigation Workspace</p></div>
              </div>
              <nav className="flex flex-wrap gap-2 lg:justify-end">
                <Link href="/investigation-master" className="rounded-xl border border-[#d6a443]/35 bg-[#d6a443]/10 px-3.5 py-2.5 text-[10px] font-black uppercase tracking-wider text-[#f4d58c] transition hover:bg-[#d6a443]/20">Investigation Master</Link>
                <Link href="/investigation-room" className="rounded-xl border border-blue-300/20 bg-blue-500/10 px-3.5 py-2.5 text-[10px] font-black uppercase tracking-wider text-blue-100 transition hover:bg-blue-500/20">Lab Room</Link>
                <Link href="/investigation-reports" className="rounded-xl border border-emerald-300/20 bg-emerald-500/10 px-3.5 py-2.5 text-[10px] font-black uppercase tracking-wider text-emerald-100 transition hover:bg-emerald-500/20">Reports</Link>
                <Link href="/billing" className="rounded-xl border border-amber-300/30 bg-amber-500/15 px-3.5 py-2.5 text-[10px] font-black uppercase tracking-wider text-amber-100 transition hover:bg-amber-500/25">Billing</Link>
              </nav>
            </div>
          </header>

          <section className="relative mt-5 overflow-hidden rounded-[2.3rem] border border-[#d6a443]/35 bg-[linear-gradient(135deg,#061725 0%,#0a304d 52%,#06131f 100%)] px-5 py-9 shadow-[0_30px_90px_rgba(0,0,0,.40)] sm:px-9 sm:py-12 lg:px-14 lg:py-14">
            <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full border border-[#d6a443]/10" /><div className="absolute -right-8 -top-16 h-56 w-56 rounded-full border border-white/5" /><div className="absolute -left-32 -bottom-40 h-96 w-96 rounded-full bg-[#0b63ce]/10 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 opacity-[.12]"><Image src="/serawat-H-logo.png" alt="" aria-hidden="true" fill sizes="100vw" className="object-contain p-8 sm:p-14 lg:p-20" /></div>
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-4xl">
                <div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-[#d6a443]/30 bg-[#d6a443]/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.2em] text-[#f4d58c]">SAMS Diagnostics</span><span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.18em] text-emerald-200">Order → Lab → Report</span></div>
                <h1 className="mt-5 text-4xl font-black tracking-[-.04em] text-white sm:text-5xl lg:text-6xl">Investigation<br className="hidden sm:block" /> Workspace</h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">A single premium workspace for investigation ordering, billing, laboratory processing and final patient reports.</p>
              </div>
              <div className="hidden rounded-2xl border border-white/10 bg-black/15 p-5 lg:block lg:w-[250px]"><p className="text-[9px] font-black uppercase tracking-[.2em] text-[#d6a443]">Workspace focus</p><p className="mt-2 text-lg font-black text-white">Patient-wise diagnostics</p><p className="mt-1 text-xs leading-5 text-slate-400">Keep ordering, laboratory workflow and reporting connected without mixing imaging or electrodiagnostic pathways.</p></div>
            </div>
          </section>

          <section className="mt-5 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.035] shadow-[0_20px_60px_rgba(0,0,0,.22)]">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 px-5 py-5 sm:px-7"><div><p className="text-[9px] font-black uppercase tracking-[.25em] text-[#d6a443]">Investigation Workflow</p><h2 className="mt-1 text-xl font-black text-white sm:text-2xl">Choose a workspace</h2></div><p className="text-xs font-semibold text-slate-500">Order → Lab → Report</p></div>
            <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-3 lg:p-6">
              {modules.map((module, index) => <Link key={module.title} href={module.href} className="group relative flex min-h-[300px] flex-col overflow-hidden rounded-[1.7rem] border border-white/10 bg-[linear-gradient(145deg,rgba(14,40,62,.92),rgba(5,17,28,.98))] p-6 shadow-[0_14px_38px_rgba(0,0,0,.22)] transition duration-300 hover:-translate-y-1 hover:border-[#d6a443]/45 hover:shadow-[0_22px_50px_rgba(0,0,0,.34)] sm:p-7">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#d6a443]/[.035] blur-2xl transition group-hover:bg-[#d6a443]/[.08]" />
                <div className="relative flex items-start justify-between"><div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d6a443]/30 bg-[#071525] text-2xl text-[#f4d58c] shadow-inner">{module.icon}</div><span className="rounded-full border border-[#d6a443]/25 bg-[#d6a443]/10 px-3 py-1.5 text-[10px] font-black tracking-[.16em] text-[#f4d58c]">{module.number}</span></div>
                <div className="relative mt-6"><p className="text-[9px] font-black uppercase tracking-[.20em] text-[#d6a443]">{module.eyebrow}</p><h3 className="mt-2 text-xl font-black tracking-tight text-white sm:text-2xl">{module.title}</h3><p className="mt-3 text-sm leading-6 text-slate-300">{module.text}</p></div>
                <div className="relative mt-auto flex items-center justify-between border-t border-white/10 pt-5"><span className="text-[9px] font-black uppercase tracking-[.16em] text-slate-500">Open workspace</span><span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d6a443]/50 bg-[#d6a443] text-lg font-bold text-[#071525] transition group-hover:scale-105">→</span></div>
              </Link>)}
            </div>
          </section>

          <section className="mt-5 mb-6 rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,29,47,.78),rgba(5,16,27,.88))] px-5 py-5 shadow-[0_18px_50px_rgba(0,0,0,.20)] sm:px-7">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-[.22em] text-[#d6a443]">Workflow map</p><p className="mt-1 text-sm font-black text-white">From order to final patient report</p></div><span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Connected workflow</span></div>
            <div className="mt-5 grid gap-2 md:grid-cols-4">{workflow.map(([number, title, text], index) => <div key={number} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[.025] p-3.5"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#d6a443]/25 bg-[#d6a443]/10 text-[9px] font-black text-[#f4d58c]">{number}</div><div className="min-w-0"><p className="text-[10px] font-black text-white">{title}</p><p className="mt-0.5 truncate text-[9px] font-semibold text-slate-500">{text}</p></div>{index < workflow.length - 1 && <span className="ml-auto hidden text-slate-600 md:block">→</span>}</div>)}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
