import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Navigation from "@/components/Navigation";

const actions = [
  { href: "/patients/new", label: "Patient Registration", description: "Create a new patient record and begin the front-desk journey.", icon: "👤", tone: "Registration" },
  { href: "/patients/list", label: "Patient Registry", description: "Search, verify and open an existing patient record.", icon: "📋", tone: "Records" },
  { href: "/appointments", label: "Appointments", description: "Review today's schedule and manage upcoming appointments.", icon: "📅", tone: "Scheduling" },
  { href: "/opd", label: "OPD Registration", description: "Route the patient to the right department and issue the visit token.", icon: "🏥", tone: "OPD" },
  { href: "/opd", label: "OPD Queue", description: "Monitor active department queues and patient movement.", icon: "🧑‍⚕️", tone: "Patient Flow" },
  { href: "/patient-search", label: "Slip Printing", description: "Find a completed visit and print the final OPD visit slip.", icon: "🧾", tone: "Records" },
];

export default function ReceptionPage() {
  return (
    <main className="min-h-screen text-slate-100 lg:flex bg-[#071525] bg-[radial-gradient(circle_at_72%_8%,rgba(214,164,67,0.16),transparent_28%),radial-gradient(circle_at_25%_45%,rgba(11,99,206,0.13),transparent_32%),linear-gradient(135deg,#06111f_0%,#0a1b30_48%,#071525_100%)]">
      <div className="lg:sticky lg:top-0 lg:h-screen lg:w-[270px] lg:shrink-0"><Sidebar /></div>
      <div className="min-w-0 flex-1">
        <Navigation />
        <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-7 lg:px-10 lg:py-7">
          <section className="relative overflow-hidden rounded-[2rem] border border-[#d6a443]/35 bg-[linear-gradient(135deg,rgba(10,31,53,0.98),rgba(6,18,32,0.98))] px-6 py-9 text-center shadow-[0_24px_70px_rgba(0,0,0,0.35)] sm:px-10 sm:py-11">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#082b61] via-[#d6a443] to-[#f2d38b]" />
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#d6a443]/10 blur-3xl" />
            <div className="absolute -left-20 bottom-0 h-52 w-52 rounded-full bg-[#0b63ce]/10 blur-3xl" />
            <div className="relative mx-auto max-w-6xl">
              <p className="text-2xl font-black uppercase leading-tight tracking-[0.05em] text-[#f2d38b] sm:text-3xl lg:text-4xl xl:text-5xl">
                Serawat Advanced Multispeciality Joint &amp; Spine Centre
              </p>
              <div className="mx-auto mt-5 flex items-center justify-center gap-3">
                <span className="h-px w-16 bg-[#d6a443]/70" />
                <span className="h-2 w-2 rotate-45 border border-[#d6a443]" />
                <span className="h-px w-16 bg-[#d6a443]/70" />
              </div>
              <h1 className="mt-5 text-4xl font-black uppercase tracking-[0.08em] text-white sm:text-5xl lg:text-6xl">Reception</h1>
              <p className="mx-auto mt-4 max-w-3xl text-sm font-medium leading-6 text-slate-300 sm:text-base">Welcome to the reception desk — where every patient journey begins with a warm welcome, smooth registration and coordinated care.</p>
              <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#f2d38b] sm:text-xs">Welcome → Register → Verify → OPD → Consultation → Care → Billing → Follow-up</p>
            </div>
          </section>

          <div className="mt-8 flex items-end justify-between gap-4 px-1">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#d6a443]">Reception Desk</p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-white">Patient Flow &amp; Services</h2>
            </div>
            <p className="hidden text-right text-xs font-semibold text-slate-400 sm:block">Six essential front-desk actions</p>
          </div>

          <section className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {actions.map((action, index) => (
              <Link key={action.label} href={action.href} className="group relative overflow-hidden rounded-[1.65rem] border border-white/10 bg-[linear-gradient(145deg,rgba(18,43,68,0.95),rgba(8,24,41,0.98))] p-5 shadow-[0_14px_35px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-1 hover:border-[#d6a443]/50 hover:shadow-[0_24px_50px_rgba(0,0,0,0.35)]">
                <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[5rem] bg-[#d6a443]/5 transition-colors group-hover:bg-[#d6a443]/10" />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d6a443]/25 bg-[#071525] text-2xl shadow-inner">{action.icon}</div>
                  <span className="flex h-8 min-w-8 items-center justify-center rounded-full border border-[#d6a443]/25 bg-[#071525]/70 px-2 text-[9px] font-black tracking-[0.12em] text-[#d6a443]">0{index + 1}</span>
                </div>
                <div className="relative mt-5">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#d6a443]">{action.tone}</p>
                  <h3 className="mt-1.5 text-lg font-black tracking-tight text-white">{action.label}</h3>
                  <p className="mt-2 min-h-[42px] text-sm leading-5 text-slate-300">{action.description}</p>
                </div>
                <div className="relative mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Open workspace</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6a443]/50 bg-[#d6a443] text-lg font-bold text-[#071525] shadow-[0_6px_18px_rgba(214,164,67,0.25)] transition-all duration-200 group-hover:translate-x-1 group-hover:bg-[#f2d38b]">→</span>
                </div>
              </Link>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
