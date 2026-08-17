import Link from "next/link";
import Sidebar from "../../../components/Sidebar";

export default function NewPatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="new-patient-shell min-h-screen bg-[#f4f7fb] md:flex">
      <div className="hidden shrink-0 md:block md:w-[280px] lg:w-[300px]">
        <Sidebar />
      </div>

      <div className="new-patient-content min-w-0 flex-1">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 shadow-[0_6px_25px_rgba(8,43,97,0.06)] backdrop-blur-xl">
          <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 py-3 sm:px-7 lg:px-9">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/patients" className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-black text-[#082b61] shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0b63ce]" aria-label="Back to Patient Directory" title="Back to Patient Directory">←</Link>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[10px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">SAMS · Patient Management</p>
                  <span className="hidden rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-emerald-700 sm:inline-flex">Clinical Workspace</span>
                </div>
                <p className="mt-1 truncate text-base font-black tracking-tight text-[#082b61] sm:text-lg">Register New Patient</p>
              </div>
            </div>
            <Link href="/patients" className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-[#0b63ce] sm:inline-flex">Patient Directory</Link>
          </div>
        </header>

        <div className="[&>main>header]:hidden">{children}</div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 768px) {
          .new-patient-shell .new-patient-content > div > main { min-height: calc(100vh - 76px); }
        }
        .new-patient-shell .new-patient-content > div > main > div > div:first-child:has(> button) { display: none; }
        .new-patient-shell .new-patient-content > div > main > div > div:last-child:has(> button:nth-child(3)) { display: none; }
      ` }} />
    </div>
  );
}
