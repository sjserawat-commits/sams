import Link from "next/link";
import Navigation from "@/components/Navigation";
import DoctorManagement from "@/components/DoctorManagement";

export default function ExpertsAdminPage() {
  return (
    <main className="min-h-screen bg-[#080d16] text-slate-100">
      <Navigation />
      <div className="min-h-[calc(100vh-76px)] bg-[#080d16] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[.045] p-5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.28em] text-[#d9bb72]">SAMS · Administration</p>
              <h1 className="mt-1 text-2xl font-black text-white">Doctors / Experts Team</h1>
              <p className="mt-1 text-sm text-slate-400">Manage the doctors and experts displayed on the public website.</p>
            </div>
            <Link href="/admin" className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-2.5 text-xs font-black text-slate-200 hover:bg-white/[.09]">← Administration</Link>
          </div>
          <DoctorManagement />
        </div>
      </div>
    </main>
  );
}
