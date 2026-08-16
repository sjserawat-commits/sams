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

          <div className="mt-8 flex items-end justify-between gap-4 px-1">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0b63ce]">Reception Desk</p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-[#082b61]">Patient Flow & Services</h2>
            </div>
            <p className="hidden text-right text-xs font-semibold text-slate-400 sm:block">Six essential front-desk actions</p>
          </div>

          <section className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {actions.map((action, index) => (
              <Link key={action.label} href={action.href} className="group relative overflow-hidden rounded-[1.65rem] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(8,43,97,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#b9d6f7] hover:shadow-[0_20px_42px_rgba(8,43,97,0.13)]">
                <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[5rem] bg-[#f4f8fd] transition-colors group-hover:bg-[#edf5ff]" />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-[#eef6ff] to-white text-2xl shadow-sm">{action.icon}</div>
                  <span className="flex h-8 min-w-8 items-center justify-center rounded-full border border-slate-200 bg-white px-2 text-[9px] font-black tracking-[0.12em] text-slate-400 shadow-sm">0{index + 1}</span>
                </div>
                <div className="relative mt-5">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">{action.tone}</p>
                  <h3 className="mt-1.5 text-lg font-black tracking-tight text-[#082b61]">{action.label}</h3>
                  <p className="mt-2 min-h-[42px] text-sm leading-5 text-slate-500">{action.description}</p>
                </div>
                <div className="relative mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Open workspace</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#082b61] text-lg font-bold text-white shadow-sm transition-all duration-200 group-hover:translate-x-1 group-hover:bg-[#0b63ce]">→</span>
                </div>
              </Link>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
