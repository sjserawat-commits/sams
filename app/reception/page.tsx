import Image from "next/image";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Navigation from "@/components/Navigation";

const actions = [
  { href: "/patients/new", label: "Patient Registration", description: "Create a new patient record and begin the front-desk journey.", icon: "👤", tone: "Registration" },
  { href: "/patients/list", label: "Patient Registry", description: "Search, verify and open an existing patient record.", icon: "📋", tone: "Records" },
  { href: "/appointments", label: "Appointments", description: "Review today's schedule and manage upcoming appointments.", icon: "📅", tone: "Scheduling" },
  { href: "/opd", label: "OPD Queue", description: "Monitor active department queues and patient movement.", icon: "🧑‍⚕️", tone: "Patient Flow" },
  { href: "/slip-print?from=reception", label: "Consultation Slip Print", description: "Search a patient by name or HID and print a completed post-consultation OPD slip.", icon: "🧾", tone: "Records" },
];

export default function ReceptionPage() {
  return (
    <main className="min-h-screen text-slate-100 lg:flex bg-[#050c16] bg-[radial-gradient(circle_at_65%_8%,rgba(214,164,67,0.18),transparent_25%),radial-gradient(circle_at_20%_38%,rgba(18,70,118,0.28),transparent_30%),linear-gradient(135deg,#040b14_0%,#08182a_45%,#050c16_100%)]">
      <div className="lg:sticky lg:top-0 lg:h-screen lg:w-[270px] lg:shrink-0"><Sidebar variant="reception" /></div>
      <div className="min-w-0 flex-1">
        <Navigation variant="reception" />
        <div className="relative overflow-hidden px-3 py-4 sm:px-6 lg:px-8 lg:py-6">
          <div className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,0.06),transparent_24%),linear-gradient(90deg,transparent_0%,rgba(214,164,67,0.035)_50%,transparent_100%)]" />
          <section className="relative mx-auto max-w-[1500px] overflow-hidden rounded-[2.25rem] border border-[#d6a443]/45 bg-[linear-gradient(135deg,rgba(5,18,31,0.98),rgba(12,38,61,0.96)_52%,rgba(5,14,24,0.99))] px-5 py-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.48)] sm:px-10 sm:py-10 lg:px-16 lg:py-11">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#082b61] via-[#d6a443] to-[#f4d58c]" /><div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-[#0b63ce]/15 blur-3xl" /><div className="absolute -right-28 -bottom-32 h-80 w-80 rounded-full bg-[#d6a443]/12 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden"><Image src="/serawat-logo.png" alt="" aria-hidden="true" width={620} height={620} className="h-[420px] w-[420px] object-contain opacity-[0.075] blur-[0.2px] sm:h-[520px] sm:w-[520px] lg:h-[620px] lg:w-[620px]" /></div>
            <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d6a443]/45 bg-[#071525]/80 p-2 shadow-[0_8px_30px_rgba(214,164,67,0.14)] sm:h-16 sm:w-16"><Image src="/serawat-logo.png" alt="SAMS" width={70} height={70} className="h-full w-full object-contain" priority /></div>
              <p className="max-w-5xl text-2xl font-black leading-tight tracking-[-0.02em] text-[#f4d58c] sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">Serawat Advanced Multispeciality Joint &amp; Spine Centre</p>
              <div className="my-4 flex w-full max-w-xl items-center justify-center gap-3"><span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#d6a443]/70" /><span className="h-2.5 w-2.5 rotate-45 border border-[#d6a443] bg-[#d6a443]/20" /><span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#d6a443]/70" /></div>
              <h1 className="text-4xl font-black uppercase tracking-[0.14em] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.45)] sm:text-5xl lg:text-6xl">Reception</h1>
              <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-slate-300 sm:text-base lg:text-lg">Welcome to the SAMS reception desk — where every patient journey begins with a warm welcome, efficient registration and coordinated care.</p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#f4d58c] sm:text-[10px]">{[["👋","Welcome"],["📝","Register"],["✓","Verify"],["🏥","OPD"],["🩺","Consultation"],["❤️","Care"],["💳","Billing"],["📅","Follow-up"]].map(([icon,label],index)=><div key={label} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 backdrop-blur-sm"><span className="text-sm">{icon}</span><span>{label}</span>{index<7&&<span className="ml-1 text-[#d6a443]">→</span>}</div>)}</div>
            </div>
          </section>
          <section className="relative mx-auto mt-7 max-w-[1500px] rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,27,45,0.82),rgba(4,14,25,0.88))] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:p-6 lg:p-7">
            <div className="mb-5 flex items-end justify-between gap-4 px-1"><div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#d6a443]">SAMS Reception Desk</p><h2 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">Front Desk Services</h2></div><p className="hidden text-right text-xs font-semibold text-slate-400 sm:block">Everything needed to start and guide a patient visit</p></div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{actions.map((action,index)=><Link key={action.label} href={action.href} className="group relative overflow-hidden rounded-[1.55rem] border border-white/10 bg-[linear-gradient(145deg,rgba(17,40,64,0.94),rgba(6,19,33,0.98))] p-5 shadow-[0_12px_32px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#d6a443]/55 hover:shadow-[0_22px_45px_rgba(0,0,0,0.38)]"><div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#d6a443]/5 blur-2xl transition-all group-hover:bg-[#d6a443]/12" /><div className="relative flex items-start justify-between gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d6a443]/25 bg-[#071525] text-2xl shadow-inner">{action.icon}</div><span className="flex h-8 min-w-8 items-center justify-center rounded-full border border-[#d6a443]/30 bg-[#071525]/80 px-2 text-[9px] font-black tracking-[0.12em] text-[#d6a443]">0{index+1}</span></div><div className="relative mt-5"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#d6a443]">{action.tone}</p><h3 className="mt-1.5 text-lg font-black tracking-tight text-white">{action.label}</h3><p className="mt-2 min-h-[42px] text-sm leading-5 text-slate-300">{action.description}</p></div><div className="relative mt-5 flex items-center justify-between border-t border-white/10 pt-4"><span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Open workspace</span><span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6a443]/60 bg-[#d6a443] text-lg font-bold text-[#071525] shadow-[0_6px_20px_rgba(214,164,67,0.28)] transition-all duration-200 group-hover:translate-x-1 group-hover:bg-[#f4d58c]">→</span></div></Link>)}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
