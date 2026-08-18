import Navigation from "@/components/Navigation";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-[#080d16] text-slate-100">
      <Navigation />
      <div className="min-h-[calc(100vh-76px)] bg-[#080d16] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-white/10 bg-white/[.045] p-6">
            <p className="text-[9px] font-black uppercase tracking-[.28em] text-[#d9bb72]">SAMS · Administration</p>
            <h1 className="mt-1 text-3xl font-black text-white">Settings</h1>
            <p className="mt-2 text-sm text-slate-400">System configuration and core hospital controls.</p>
          </div>
          <section className="mt-6 rounded-2xl border border-white/10 bg-white/[.045] p-6">
            <h2 className="text-lg font-black text-white">Configuration</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {["Hospital Information", "User Management", "System Preferences", "Security"].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-black/10 p-4 text-sm font-bold text-slate-300">{item}</div>
              ))}
            </div>
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-xs text-slate-500">Doctors / Experts Team management has been moved to the main Administration workspace.</p>
              <Link href="/admin/experts" className="mt-3 inline-flex rounded-xl bg-[#c9a85c] px-4 py-2.5 text-xs font-black text-[#080d16]">Open Doctors / Experts Team →</Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
