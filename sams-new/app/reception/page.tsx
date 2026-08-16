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
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#0b63ce]">SAMS · Reception & Front Desk</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-[#082b61] sm:text-4xl">Reception</h1>
            </div>
            <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 shadow-sm sm:block">Front Desk Operations</div>
          </div>

          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#061f49] via-[#082b61] to-[#0b63ce] px-6 py-8 text-white shadow-[0_24px_60px_rgba(8,43,97,0.22)] sm:px-9 sm:py-10">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/10 bg-white/5" />
            <div className="absolute -bottom-32 right-20 h-72 w-72 rounded-full border border-white/10" />
            <div className="relative max-w-4xl">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200">Corporate Hospital Reception Board</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Every patient journey starts here.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-100 sm:text-base">Welcome → Register → Verify → Route to OPD → Consultation → Investigations / Treatment → Billing → Follow-up.</p>
              <div className="mt-7 flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-[0.16em]">
                {['Welcome', 'Registration', 'OPD Routing', 'Consultation', 'Care', 'Follow-up'].map((step, index) => (
                  <span key={step} className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-blue-50 backdrop-blur-sm">{String(index + 1).padStart(2, '0')} · {step}</span>
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
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  <span>Open workspace</span><span className="text-base text-[#0b63ce] transition group-hover:translate-x-1">→</span>
                </div>
              </Link>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
