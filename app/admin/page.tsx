import Link from "next/link";
import Navigation from "@/components/Navigation";

const cards = [
  { title: "Billing Dashboard", description: "Hospital-wide collections, pending bills, outstanding balances, revenue mix and finance work queue.", href: "/admin/billing", action: "Open Billing Dashboard →", featured: true },
  { title: "Settings", description: "Hospital, users, system preferences and security configuration.", href: "/settings", action: "Open Settings →" },
  { title: "Investigation Master", description: "Add, search and update investigation names, categories and prices used by clinical and billing workflows.", href: "/investigation-master", action: "Manage Investigations →" },
];

export default function AdminPage() {
  return (
    <main>
      <Navigation />
      <div className="min-h-[calc(100vh-76px)] bg-[#f3f6fa] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="relative mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#061f49] via-[#082b61] to-[#0b63ce] p-7 text-white shadow-2xl sm:p-9">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
            <div className="relative"><p className="text-[9px] font-black uppercase tracking-[0.28em] text-blue-200">SAMS · Command & Control</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Administration</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">Central control for hospital finance, settings, master data and operational configuration.</p></div>
          </div>
          <section className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Admin Workspace</p><h2 className="mt-1 text-xl font-black text-[#082b61]">Management & Finance</h2><p className="mt-1 text-xs text-slate-500">Hospital-wide financial information is intentionally kept inside Admin.</p></div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {cards.map((card) => <Link key={card.href} href={card.href} className={`group rounded-[1.5rem] border p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${card.featured ? "border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-md" : "border-slate-200 bg-slate-50/70 hover:border-blue-200 hover:bg-white"}`}>
                <div className="flex items-start justify-between gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#082b61] text-white">{card.featured ? "₹" : card.title === "Settings" ? "⚙" : "🔬"}</div>{card.featured && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black text-emerald-700">ADMIN ONLY</span>}</div>
                <p className="mt-5 text-base font-black text-[#082b61]">{card.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{card.description}</p><span className="mt-5 inline-flex rounded-xl bg-[#082b61] px-4 py-2.5 text-xs font-black text-white group-hover:bg-[#0b63ce]">{card.action}</span>
              </Link>)}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
