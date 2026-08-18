import Link from "next/link";
import Navigation from "@/components/Navigation";

const cards = [
  { title: "Billing & Revenue", eyebrow: "FINANCE CONTROL", description: "Executive billing, collections, receivables, revenue trends and payment performance.", href: "/admin/billing", action: "Enter Finance →", icon: "₹", featured: true },
  { title: "Doctors / Experts Team", eyebrow: "TEAM MANAGEMENT", description: "Add, edit, update profiles and manage doctors and experts displayed on the public Experts Team page.", href: "/settings#experts-team", action: "Manage Team →", icon: "✚" },
  { title: "Settings", eyebrow: "SYSTEM CONTROL", description: "Hospital configuration, users, preferences and security controls.", href: "/settings", action: "Open Settings →", icon: "⚙" },
  { title: "Investigation Master", eyebrow: "CLINICAL MASTER DATA", description: "Maintain investigation names, categories and rates used across clinical and billing workflows.", href: "/investigation-master", action: "Manage Master →", icon: "⌁" },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#080d16] text-slate-100">
      <Navigation />
      <div className="relative min-h-[calc(100vh-76px)] overflow-hidden bg-[#080d16]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(201,168,92,.10),transparent_27%),radial-gradient(circle_at_88%_18%,rgba(38,107,184,.14),transparent_30%),linear-gradient(135deg,#080d16_0%,#0b1320_52%,#07101b_100%)]" />
        <div className="pointer-events-none absolute -left-32 top-72 h-80 w-80 rounded-full bg-[#c9a85c]/[.035] blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-24 h-96 w-96 rounded-full bg-blue-500/[.045] blur-3xl" />

        <div className="relative mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
          <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#101925]/90 shadow-[0_30px_100px_rgba(0,0,0,.42)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(201,168,92,.10),transparent_32%,rgba(35,101,173,.12))]" />
            <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:p-12">
              <div>
                <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#c9a85c]/30 bg-[#c9a85c]/10 text-xl font-black text-[#e0c27a]">S</div><div><p className="text-[9px] font-black uppercase tracking-[.34em] text-[#d9bb72]">SAMS · Executive Administration</p><p className="mt-1 text-[10px] font-semibold tracking-wide text-slate-400">Restricted management workspace</p></div></div>
                <h1 className="mt-7 text-4xl font-black tracking-[-.045em] text-white sm:text-5xl lg:text-6xl">Administration</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">The executive control centre for hospital finance, team management, system configuration and clinical master data.</p>
                <div className="mt-7 flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[.07] px-3.5 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-300"><i className="h-1.5 w-1.5 rounded-full bg-emerald-400" />System online</span><span className="rounded-full border border-white/10 bg-white/[.035] px-3.5 py-2 text-[10px] font-bold tracking-wide text-slate-400">Admin access</span></div>
              </div>
              <div className="flex items-end lg:justify-end"><div className="min-w-[230px] rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-md"><p className="text-[9px] font-black uppercase tracking-[.24em] text-slate-500">CONTROL CENTRE</p><p className="mt-2 text-lg font-black text-white">SAMS Administration</p><div className="mt-4 h-px bg-white/10" /><div className="mt-4 flex items-center justify-between text-[10px]"><span className="text-slate-500">Workspace</span><b className="text-[#d9bb72]">SECURE</b></div></div></div>
            </div>
          </header>

          <section className="mt-6 grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><p className="text-[9px] font-black uppercase tracking-[.2em] text-slate-500">Finance</p><p className="mt-2 text-xl font-black text-white">Billing & Revenue</p><p className="mt-1 text-[10px] text-slate-500">Executive financial oversight</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><p className="text-[9px] font-black uppercase tracking-[.2em] text-slate-500">Team</p><p className="mt-2 text-xl font-black text-white">Doctors / Experts</p><p className="mt-1 text-[10px] text-slate-500">Public team management</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><p className="text-[9px] font-black uppercase tracking-[.2em] text-slate-500">Configuration</p><p className="mt-2 text-xl font-black text-white">System Settings</p><p className="mt-1 text-[10px] text-slate-500">Core hospital controls</p></div>
            <div className="rounded-2xl border border-[#c9a85c]/15 bg-[#c9a85c]/[.045] p-5"><p className="text-[9px] font-black uppercase tracking-[.2em] text-[#bda66f]">Master Data</p><p className="mt-2 text-xl font-black text-white">Investigations</p><p className="mt-1 text-[10px] text-slate-500">Clinical & billing catalogue</p></div>
          </section>

          <section className="mt-8"><div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-[.3em] text-[#c9a85c]">Executive Workspace</p><h2 className="mt-1 text-2xl font-black tracking-tight text-white">Management Controls</h2></div><p className="hidden text-[10px] font-bold uppercase tracking-widest text-slate-600 sm:block">SAMS · Administration</p></div>
            <div className="grid gap-5 lg:grid-cols-4">
              {cards.map((card) => <Link key={card.href} href={card.href} className={`group relative overflow-hidden rounded-[1.7rem] border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_70px_rgba(0,0,0,.35)] ${card.featured ? "border-[#c9a85c]/25 bg-[linear-gradient(145deg,#17150f,#111a27_72%)]" : "border-white/10 bg-white/[.045] hover:border-white/20 hover:bg-white/[.07]"}`}><div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" /><div className="flex items-start justify-between gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[.06] text-xl font-black text-slate-200">{card.icon}</div><span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[8px] font-black tracking-[.16em] text-slate-500">{card.eyebrow}</span></div><h3 className="mt-7 text-xl font-black tracking-tight text-white">{card.title}</h3><p className="mt-2 min-h-[48px] text-xs leading-5 text-slate-400">{card.description}</p><div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-[10px] font-black text-slate-300"><span>{card.action}</span><span className="transition-transform duration-300 group-hover:translate-x-1">→</span></div></Link>)}
            </div>
          </section>
          <footer className="mt-8 flex flex-col gap-2 border-t border-white/10 py-5 text-[9px] font-bold uppercase tracking-[.2em] text-slate-600 sm:flex-row sm:items-center sm:justify-between"><span>SAMS · Secure Administration</span><span>Finance · Team · Configuration · Master Data</span></footer>
        </div>
      </div>
    </main>
  );
}
