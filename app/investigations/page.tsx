import Link from "next/link";

const modules = [
  { title: "Investigation Orders", href: "/opd/investigations", number: "01", text: "Order investigations for a specific OPD Visit from the central Investigation Master." },
  { title: "Investigation Room", href: "/investigation-room", number: "02", text: "Receive orders, collect samples, process investigations and enter results." },
  { title: "Reports & Results", href: "/investigation-reports", number: "03", text: "Review finalized, patient-wise reports linked to the original OPD Visit and print them." },
];

export default function InvestigationsPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] px-5 py-7 text-slate-900 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1180px]">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[1.6rem] border border-slate-200 bg-white px-5 py-4 shadow-[0_12px_35px_rgba(8,43,97,0.06)] sm:px-7">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-black text-[#082b61] shadow-sm">←</Link>
            <div><p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">SAMS · Clinical Workspace</p><h1 className="mt-1 text-xl font-black tracking-tight text-[#082b61]">Investigation</h1></div>
          </div>
          <div className="flex flex-wrap items-center gap-2"><Link href="/investigation-master" className="rounded-xl bg-[#082b61] px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">Investigation Master →</Link><Link href="/investigation-room" className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-[#0b63ce]">Investigation Room →</Link><Link href="/investigation-reports" className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-emerald-700">Reports →</Link></div>
        </header>

        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#082b61] via-[#075dcc] to-[#0b63ce] p-7 text-white shadow-[0_25px_70px_rgba(8,43,97,0.18)] sm:p-10">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border-[42px] border-white/10" />
          <p className="relative text-[10px] font-black uppercase tracking-[0.24em] text-blue-200">Investigation Workspace</p>
          <h2 className="relative mt-3 text-3xl font-black tracking-tight sm:text-4xl">Diagnostics & investigations</h2>
          <p className="relative mt-3 max-w-2xl text-sm leading-6 text-blue-100">Investigation ordering, billing, sample workflow and reporting stay connected to the central Investigation Master and the original OPD Visit.</p>
        </section>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {modules.map((module) => (
            <Link key={module.title} href={module.href} className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-[0_15px_40px_rgba(8,43,97,0.06)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-[#0b63ce]">{module.number}</span>
              <h3 className="mt-5 text-lg font-black text-[#082b61]">{module.title}</h3>
              <p className="mt-2 text-sm leading-5 text-slate-500">{module.text}</p>
              <p className="mt-5 text-xs font-black text-[#0b63ce]">Open module →</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
