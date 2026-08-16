import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Navigation from "@/components/Navigation";

const actions = [
  { href: "/patients/new", label: "Patient Registration", description: "Create a new patient record and start the front-desk journey.", icon: "＋", tone: "Registration" },
  { href: "/patients/list", label: "Patient Registry", description: "Search, verify and open an existing patient record.", icon: "♙", tone: "Records" },
  { href: "/appointments", label: "Appointments", description: "Review today's schedule and manage upcoming appointments.", icon: "▣", tone: "Scheduling" },
  { href: "/opd", label: "OPD Registration", description: "Route the patient to the right department and issue the visit token.", icon: "⌁", tone: "OPD" },
  { href: "/opd", label: "OPD Queue", description: "Monitor active department queues and patient movement.", icon: "☷", tone: "Patient Flow" },
  { href: "/patient-search", label: "Slip Printing", description: "Find a completed visit and print the final OPD visit slip.", icon: "▤", tone: "Records" },
];

export default function ReceptionPage() {
  return (
    <main className="min-h-screen bg-[#f3f6fa] text-slate-900 lg:flex">
      <div className="lg:sticky lg:top-0 lg:h-screen lg:w-[270px] lg:shrink-0"><Sidebar /></div>
      <div className="min-w-0 flex-1">
        <Navigation />
        <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-7 lg:px-10 lg:py-7">
          <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white px-6 py-8 text-center shadow-[0_14px_40px_rgba(8,43,97,0.08)] sm:px-10 sm:py-9">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#082b61] via-[#0b63ce] to-[#d6a443]" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b4872c]">SAMS · Serawat Advanced Multispecialty Joint & Spine Center</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#082b61] sm:text-4xl">Reception</h1>
            <p className="mx-auto mt-3 max-w-3xl text-sm font-medium leading-6 text-slate-500 sm:text-base">Welcome to the SAMS Reception Desk — where every patient journey begins with a warm welcome, smooth registration and coordinated care.</p>
            <div className="mx-auto mt-6 h-px w-20 bg-[#d6a443]" />
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#0b63ce]">Welcome → Register → Verify → OPD → Consultation → Care → Billing → Follow-up</p>
          </section>

          <section className="relative mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#061f49] via-[#082b61] to-[#0b63ce] px-6 py-7 text-white shadow-[0_24px_60px_rgba(8,43,97,0.22)] sm:px-9 sm:py-8">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/10 bg-white/5" />
            <div className="relative">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200">Corporate Hospital Patient Flow</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">One coordinated journey from reception to care.</h2>
              <div className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start">
                {['Welcome', 'Registration', 'Verification', 'OPD Routing', 'Consultation', 'Investigations / Treatment', 'Billing', 'Follow-up'].map((step, index) => (
                  <span key={step} className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-blue-50 backdrop-blur-sm">{String(index + 1).padStart(2, '0')} · {step}</span>
                ))}
              </div>
            </div>
          </section>

          <div className="mt-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0b63ce]">Reception Desk</p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-[#082b61]">Patient Flow & Services</h2>
            </div>
            <p className="hidden text-right text-xs font-semibold text-slate-400 sm:block">Six essential front-desk actions</p>
          </div>

          <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {actions.map((action, index) => (
              <Link key={action.label} href={action.href} className="group relative overflow-hidden rounded-[1.5rem] border border-slate-200/90 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_38px_rgba(8,43,97,0.12)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf5ff] text-xl font-black text-[#0b63ce] ring-1 ring-blue-100">{action.icon}</div>
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">0{index + 1}</span>
                </div>
                <p className="mt-5 text-[9px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">{action.tone}</p>
                <h3 className="mt-1 text-lg font-black text-[#082b61]">{action.label}</h3>
                <p className="mt-2 text-sm leading-5 text-slate-500">{action.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400"><span>Open workspace</span><span className="text-base text-[#0b63ce] transition group-hover:translate-x-1">→</span></div>
              </Link>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
