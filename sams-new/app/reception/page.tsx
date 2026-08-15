import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Navigation from "@/components/Navigation";

const actions = [
  { href: "/patients/new", label: "Patient Registration", description: "Register a new patient and create the SAMS record.", icon: "＋" },
  { href: "/patients/list", label: "Patient Registry", description: "Search and open existing patient records.", icon: "♙" },
  { href: "/appointments", label: "Appointments", description: "Manage today's and upcoming appointments.", icon: "▣" },
  { href: "/opd", label: "OPD Registration", description: "Register the patient into the concerned department OPD and issue a daily token.", icon: "⌁" },
  { href: "/opd", label: "OPD Queue", description: "View the active department OPD queue for this workstation.", icon: "☷" },
  { href: "/patient-search", label: "Post-Consultation Slip", description: "Find a patient and print the completed consultation's final A4 OPD slip.", icon: "▤" },
];

export default function ReceptionPage() {
  return (
    <main className="min-h-screen bg-[#f5f8fc] text-slate-900 lg:flex">
      <div className="lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0"><Sidebar /></div>
      <div className="min-w-0 flex-1">
        <Navigation />
        <div className="mx-auto max-w-[1400px] px-5 py-6 sm:px-8 lg:py-8">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0b63ce]">SAMS · Front Desk</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-[#082b61] sm:text-4xl">Reception</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">Patient flow, OPD registration, queue handling and prescription-slip printing from one front-desk workspace.</p>
            </div>
            <Link href="/dashboard" className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm sm:block">← Dashboard</Link>
          </div>

          <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0b63ce] via-[#0959b8] to-[#082b61] p-7 text-white shadow-xl sm:p-9">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-200">Front Desk Operations</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">Patient flow starts here.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">Register patients, send them to the correct department OPD, manage the local queue and reprint completed consultation slips without entering clinical information again.</p>
          </section>

          <section className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {actions.map((action) => (
              <Link key={action.label} href={action.href} className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl font-black text-[#0b63ce]">{action.icon}</div>
                  <span className="text-lg font-black text-slate-300 transition group-hover:text-[#0b63ce]">→</span>
                </div>
                <h3 className="mt-5 text-base font-black text-[#082b61]">{action.label}</h3>
                <p className="mt-2 text-sm leading-5 text-slate-500">{action.description}</p>
              </Link>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
