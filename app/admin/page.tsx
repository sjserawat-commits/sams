import Link from "next/link";
import Navigation from "@/components/Navigation";

export default function AdminPage() {
  return (
    <main>
      <Navigation />
      <div className="min-h-[calc(100vh-76px)] bg-[#f4f7fb] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_15px_40px_rgba(8,43,97,0.06)]">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">SAMS · Administration</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#082b61]">Admin</h1>
            <p className="mt-2 text-sm text-slate-500">Manage master data that controls clinical and billing workflows.</p>
          </div>
          <section className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_15px_40px_rgba(8,43,97,0.06)]">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Master Data</p>
            <h2 className="mt-1 text-lg font-black text-[#082b61]">Clinical & Billing Masters</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Link href="/investigation-master" className="group rounded-2xl border border-blue-100 bg-blue-50/60 p-5 transition hover:border-[#0b63ce]/40 hover:bg-blue-50">
                <p className="text-sm font-black text-[#082b61]">Investigation Master</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Add, search and update investigation names, categories and prices.</p>
                <span className="mt-4 inline-flex rounded-xl bg-[#082b61] px-4 py-2 text-xs font-black text-white group-hover:bg-[#0b63ce]">Manage Investigations →</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
