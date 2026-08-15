import Link from "next/link";

export default function InvestigationsPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] px-5 py-7 text-slate-900 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1180px]">
        <header className="mb-6 flex items-center justify-between rounded-[1.6rem] border border-slate-200 bg-white px-5 py-4 shadow-[0_12px_35px_rgba(8,43,97,0.06)] sm:px-7">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-black text-[#082b61] shadow-sm">←</Link>
            <div><p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">SAMS · Clinical Workspace</p><h1 className="mt-1 text-xl font-black tracking-tight text-[#082b61]">Investigation</h1></div>
          </div>
          <div className="flex items-center gap-2"><Link href="/investigation-master" className="rounded-xl bg-[#082b61] px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">Investigation Master →</Link><span className="hidden rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#0b63ce] sm:inline-flex">Diagnostics</span></div>
        </header>

        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#082b61] via-[#075dcc] to-[#0b63ce] p-7 text-white shadow-[0_25px_70px_rgba(8,43,97,0.18)] sm:p-10">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border-[42px] border-white/10" />
          <p className="relative text-[10px] font-black uppercase tracking-[0.24em] text-blue-200">Investigation Workspace</p>
          <h2 className="relative mt-3 text-3xl font-black tracking-tight sm:text-4xl">Diagnostics & investigations</h2>
          <p className="relative mt-3 max-w-2xl text-sm leading-6 text-blue-100">Investigation ordering, results and reporting stay connected to the central Investigation Master, so OPD advice and billing can use the same catalogue.</p>
        </section>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {["Investigation Orders", "Pending Results", "Reports & Results"].map((title, index) => (
            <section key={title} className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-[0_15px_40px_rgba(8,43,97,0.06)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-[#0b63ce]">0{index + 1}</span>
              <h3 className="mt-5 text-lg font-black text-[#082b61]">{title}</h3>
              <p className="mt-2 text-sm leading-5 text-slate-500">Investigation workflow area ready for the next clinical integration step.</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
