import Image from "next/image";
import Link from "next/link";

const modules = [
  {
    title: "Place Investigation Order",
    href: "/opd/investigations",
    number: "01",
    eyebrow: "ORDER & BILLING",
    text: "Search the patient, select investigations from the central master, review charges and place the order.",
    icon: "⌁",
  },
  {
    title: "Lab Room",
    href: "/investigation-room",
    number: "02",
    eyebrow: "LABORATORY WORKFLOW",
    text: "Patient-wise laboratory queue for sample collection, processing, result entry, verification and report publishing.",
    icon: "◇",
  },
  {
    title: "Reports & Results",
    href: "/investigation-reports",
    number: "03",
    eyebrow: "REPORT & PRINT",
    text: "Review finalized patient-wise reports, complete results and print the final investigation report.",
    icon: "▤",
  },
];

const workflow = [
  ["01", "Order", "Patient + investigations"],
  ["02", "Lab", "Collection + processing"],
  ["03", "Verify", "Result verification"],
  ["04", "Report", "Publish + print"],
];

const quickLinks = [
  ["Investigation Master", "/investigation-master", "Manage investigation definitions, charges and biological/reference values."],
  ["Lab Room", "/investigation-room", "Open the patient-wise laboratory queue."],
  ["Reports", "/investigation-reports", "Review finalized reports and print results."],
  ["Billing", "/billing", "Review investigation billing and payments."],
];

export default function InvestigationsPage() {
  return (
    <main className="min-h-screen bg-[#FDC823] text-[#071b35]">
      <div className="min-h-screen bg-[radial-gradient(circle_at_15%_0%,rgba(255,255,255,.38),transparent_24%),linear-gradient(145deg,#FDC823_0%,#f6c01c_46%,#eab116_100%)] px-3 py-3 sm:px-5 lg:px-8 lg:py-5">
        <div className="mx-auto max-w-[1540px]">
          <header className="relative overflow-hidden rounded-[1.8rem] border border-[#082b61]/25 bg-[#061a34] shadow-[0_18px_55px_rgba(7,27,53,.28)]">
            <div className="absolute inset-x-0 top-0 h-1 bg-[#FDC823]" />
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-7">
              <div className="flex min-w-0 items-center gap-3">
                <Link href="/reception" className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-black text-white transition hover:bg-white/10"><span className="text-base">←</span><span>Reception</span></Link>
                <div className="h-9 w-px bg-white/15" />
                <Image src="/serawat-logo.png" alt="SAMS" width={58} height={48} className="h-11 w-auto shrink-0 object-contain" priority />
                <div className="min-w-0"><p className="truncate text-base font-black tracking-tight text-[#FDC823] sm:text-lg">Serawat Advanced Multispeciality Joint &amp; Spine Centre</p><p className="mt-0.5 text-[9px] font-black uppercase tracking-[.24em] text-slate-300">SAMS · INVESTIGATION WORKSPACE</p></div>
              </div>
              <nav className="flex flex-wrap gap-2 lg:justify-end">
                <Link href="/investigation-master" className="rounded-xl border border-[#FDC823]/50 bg-[#FDC823]/10 px-3.5 py-2.5 text-[10px] font-black uppercase tracking-wider text-[#FDC823] transition hover:bg-[#FDC823]/20">Investigation Master</Link>
                <Link href="/investigation-room" className="rounded-xl border border-blue-200/20 bg-blue-400/10 px-3.5 py-2.5 text-[10px] font-black uppercase tracking-wider text-blue-100 transition hover:bg-blue-400/20">Lab Room</Link>
                <Link href="/investigation-reports" className="rounded-xl border border-emerald-200/20 bg-emerald-400/10 px-3.5 py-2.5 text-[10px] font-black uppercase tracking-wider text-emerald-100 transition hover:bg-emerald-400/20">Reports</Link>
                <Link href="/billing" className="rounded-xl border border-amber-200/20 bg-amber-400/10 px-3.5 py-2.5 text-[10px] font-black uppercase tracking-wider text-amber-100 transition hover:bg-amber-400/20">Billing</Link>
              </nav>
            </div>
          </header>

          <section className="relative mt-5 overflow-hidden rounded-[2.4rem] border border-[#082b61]/25 bg-[linear-gradient(135deg,#061a34_0%,#092e4d_54%,#071827_100%)] px-5 py-9 shadow-[0_25px_80px_rgba(7,27,53,.30)] sm:px-9 sm:py-11 lg:px-14 lg:py-13">
            <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full border border-[#FDC823]/15" /><div className="absolute -right-4 -top-8 h-52 w-52 rounded-full border border-white/5" />
            <div className="pointer-events-none absolute inset-0 opacity-[.10]"><Image src="/serawat-H-logo.png" alt="" aria-hidden="true" fill sizes="100vw" className="object-contain p-10 sm:p-16 lg:p-20" /></div>
            <div className="relative z-10 grid gap-7 lg:grid-cols-[1fr_290px] lg:items-center">
              <div className="max-w-4xl">
                <div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-[#FDC823]/45 bg-[#FDC823]/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.2em] text-[#FDC823]">SAMS DIAGNOSTICS</span><span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.18em] text-emerald-100">ORDER → LAB → REPORT</span></div>
                <h1 className="mt-5 text-4xl font-black tracking-[-.045em] text-white sm:text-5xl lg:text-6xl">Investigation<br className="hidden sm:block" /> Workspace</h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">A single premium workspace for investigation ordering, billing, laboratory processing and final patient reports.</p>
              </div>
              <div className="relative rounded-[1.4rem] border border-white/10 bg-white/[.04] p-5 backdrop-blur-sm"><p className="text-[9px] font-black uppercase tracking-[.2em] text-[#FDC823]">WORKSPACE FOCUS</p><p className="mt-2 text-xl font-black text-white">Patient-wise diagnostics</p><p className="mt-2 text-xs leading-5 text-slate-300">Ordering, laboratory workflow and reporting remain connected without mixing imaging or electrodiagnostic pathways.</p></div>
            </div>
          </section>

          <section className="mt-5 rounded-[2rem] border border-[#082b61]/15 bg-[#fff7dc]/90 p-4 shadow-[0_16px_45px_rgba(7,27,53,.18)] sm:p-5 lg:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#082b61]/10 pb-4"><div><p className="text-[9px] font-black uppercase tracking-[.25em] text-[#8a6410]">Investigation Workflow</p><h2 className="mt-1 text-xl font-black text-[#061a34] sm:text-2xl">Choose a workspace</h2></div><p className="text-xs font-bold text-slate-500">Order → Lab → Report</p></div>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {modules.map((module) => <Link key={module.title} href={module.href} className="group relative flex min-h-[300px] flex-col overflow-hidden rounded-[1.65rem] border border-[#082b61]/12 bg-white p-6 shadow-[0_12px_30px_rgba(7,27,53,.12)] transition duration-300 hover:-translate-y-1 hover:border-[#d39f13] hover:shadow-[0_20px_42px_rgba(7,27,53,.20)] sm:p-7">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#FDC823]/15 blur-2xl transition group-hover:bg-[#FDC823]/30" />
                <div className="relative flex items-start justify-between"><div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#082b61]/15 bg-[#071d38] text-2xl text-[#FDC823] shadow-lg">{module.icon}</div><span className="rounded-full border border-[#d39f13]/35 bg-[#FDC823]/20 px-3 py-1.5 text-[10px] font-black tracking-[.16em] text-[#624a09]">{module.number}</span></div>
                <div className="relative mt-6"><p className="text-[9px] font-black uppercase tracking-[.20em] text-[#96700d]">{module.eyebrow}</p><h3 className="mt-2 text-xl font-black tracking-tight text-[#061a34] sm:text-2xl">{module.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{module.text}</p></div>
                <div className="relative mt-auto flex items-center justify-between border-t border-[#082b61]/10 pt-5"><span className="text-[9px] font-black uppercase tracking-[.16em] text-slate-500">Open workspace</span><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#061a34] text-lg font-bold text-[#FDC823] transition group-hover:scale-105 group-hover:bg-[#FDC823] group-hover:text-[#061a34]">→</span></div>
              </Link>)}
            </div>
          </section>

          <section className="mt-5 rounded-[2rem] border border-[#082b61]/15 bg-[#fff7dc]/90 p-5 shadow-[0_16px_45px_rgba(7,27,53,.16)] sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-[.22em] text-[#8a6410]">Quick Access</p><p className="mt-1 text-lg font-black text-[#061a34]">Investigation command centre</p></div><span className="rounded-full bg-[#061a34] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#FDC823]">Connected workflow</span></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {quickLinks.map(([title, href, text]) => <Link key={title} href={href} className="group rounded-2xl border border-[#082b61]/10 bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#d39f13] hover:shadow-md"><div className="flex items-center justify-between gap-3"><p className="text-xs font-black text-[#061a34]">{title}</p><span className="text-lg text-[#8a6410] transition group-hover:translate-x-1">→</span></div><p className="mt-2 text-[10px] leading-5 text-slate-500">{text}</p></Link>)}
            </div>
          </section>

          <section className="mt-5 mb-6 rounded-[1.8rem] border border-[#082b61]/15 bg-[#061a34] px-5 py-5 text-white shadow-[0_18px_50px_rgba(7,27,53,.25)] sm:px-7">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-[.22em] text-[#FDC823]">Workflow Map</p><p className="mt-1 text-sm font-black">From order to final patient report</p></div><span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Connected workflow</span></div>
            <div className="mt-5 grid gap-2 md:grid-cols-4">{workflow.map(([number, title, text], index) => <div key={number} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-3.5"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#FDC823] text-[9px] font-black text-[#061a34]">{number}</div><div className="min-w-0"><p className="text-[10px] font-black text-white">{title}</p><p className="mt-0.5 truncate text-[9px] font-semibold text-slate-400">{text}</p></div>{index < workflow.length - 1 && <span className="ml-auto hidden text-[#FDC823] md:block">→</span>}</div>)}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
