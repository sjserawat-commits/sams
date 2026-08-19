"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Order = {
  id: number;
  investigation: string;
  price: number;
  netAmount: number;
  paymentStatus: string;
  status: string;
  reportText: string | null;
  reportedAt: string | null;
  createdAt: string;
  master: { code: string; category: string; specimen: string | null; unit: string | null; referenceRange: string | null; method: string | null } | null;
  opdVisit: { id: number; tokenNumber: number; visitType: string; patient: { patientId: string; firstName: string; lastName: string } };
};

const formatDate = (value: string | null) => value ? new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : "—";

const navItems = [
  ["Lab Room", "/investigation-room", "⌂"],
  ["Patient Queue", "/investigation-room", "♙"],
  ["Lab Summary", "/investigation-room", "▦"],
  ["Investigation Reports", "/investigation-reports", "▤"],
  ["Sample Collection", "/investigation-room", "♙"],
  ["In Processing", "/investigation-room", "◌"],
  ["Result Verification", "/investigation-room", "✓"],
  ["Published Reports", "/investigation-reports", "▣"],
  ["Lab Analytics", "/reports", "⌁"],
  ["Settings", "/settings", "⚙"],
] as const;

export default function InvestigationReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true); setError("");
      try {
        const params = new URLSearchParams({ status: "COMPLETED" });
        if (q.trim()) params.set("q", q.trim());
        const response = await fetch(`/api/investigation-room?${params.toString()}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || "Unable to load reports.");
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) { setError(e instanceof Error ? e.message : "Unable to load reports."); }
      finally { setLoading(false); }
    }, 200);
    return () => window.clearTimeout(timer);
  }, [q]);

  const grouped = useMemo(() => {
    const map = new Map<string, { patient: Order["opdVisit"]["patient"]; visit: Order["opdVisit"]; orders: Order[] }>();
    for (const order of orders) {
      const key = `${order.opdVisit.patient.patientId}-${order.opdVisit.id}`;
      const existing = map.get(key);
      if (existing) existing.orders.push(order);
      else map.set(key, { patient: order.opdVisit.patient, visit: order.opdVisit, orders: [order] });
    }
    return [...map.values()];
  }, [orders]);

  const investigationCount = orders.length;
  const patientCount = grouped.length;

  return (
    <main className="min-h-screen bg-white text-[#071a38] print:bg-white">
      <style>{`@media print{.no-print{display:none!important}.report-card{break-inside:avoid;box-shadow:none!important;border:0!important}body{background:#fff!important}}`}</style>
      <div className="min-h-screen bg-white">
        <aside className="no-print fixed inset-y-0 left-0 z-40 hidden w-[205px] bg-[#FDC823] lg:block">
          <div className="flex h-[72px] items-center gap-3 border-b border-[#d7a800]/30 px-6"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#082b61] text-2xl text-[#FDC823]">⚕</div><div><p className="text-lg font-black tracking-tight text-[#082b61]">SAMS LAB</p><p className="text-[8px] font-black uppercase tracking-[.18em] text-[#082b61]/70">Diagnostics</p></div></div>
          <nav className="px-2 py-5">{navItems.map(([label, href, icon]) => { const active = label === "Investigation Reports"; return <Link key={label} href={href} className={`mb-1.5 flex items-center gap-3 rounded-xl px-4 py-3 text-[12px] font-black transition ${active ? "bg-[#082b61] text-white shadow-lg" : "text-[#082b61] hover:bg-white/45"}`}><span className="w-5 text-center text-base">{icon}</span><span>{label}</span></Link>; })}</nav>
          <div className="absolute inset-x-5 bottom-5 border-t border-[#d7a800]/35 pt-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-white text-lg shadow-sm">●</div><div><p className="text-[11px] font-black text-[#082b61]">Lab Technician</p><p className="text-[9px] font-semibold text-[#082b61]/65">Laboratory</p></div><span className="ml-auto text-[#082b61]">→</span></div></div>
        </aside>

        <div className="lg:pl-[205px]">
          <header className="no-print flex h-[72px] items-center justify-between border-b border-slate-200 bg-[#FDC823] px-5 sm:px-8">
            <div className="flex items-center gap-4"><button className="text-xl font-black text-[#082b61] lg:hidden">☰</button><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-[#082b61]/60">SAMS · Laboratory</p><p className="text-sm font-black text-[#082b61]">Serawat Advanced Multispeciality Joint &amp; Spine Centre</p></div></div>
            <div className="flex items-center gap-4"><button className="relative grid h-10 w-10 place-items-center rounded-full bg-white/60 text-lg">♧<span className="absolute right-1 top-0 h-2 w-2 rounded-full bg-red-500" /></button><div className="hidden items-center gap-2 sm:flex"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#082b61] text-sm font-black text-white">LT</div><div><p className="text-[10px] font-black text-[#082b61]">Lab Technician</p><p className="text-[8px] font-semibold text-[#082b61]/65">Laboratory</p></div><span className="text-[#082b61]">⌄</span></div></div>
          </header>

          <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-7 xl:px-10">
            <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-[10px] font-black text-slate-500"><Link href="/investigation-room" className="hover:text-[#0b63ce]">⌂ Lab Room</Link><span>›</span><span>Investigation Reports</span></div><div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-xl bg-[#FDC823] text-2xl text-[#082b61] shadow-sm">▤</div><div><h1 className="text-3xl font-black tracking-tight text-[#082b61] sm:text-4xl">Investigation Reports</h1><p className="mt-1 text-sm font-medium text-slate-500">Search, view and manage finalized laboratory reports</p></div></div></div><div className="flex gap-3"><button onClick={() => window.print()} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-black text-[#082b61] shadow-sm hover:bg-slate-50">⇩ Export</button><button className="rounded-xl bg-[#082b61] px-5 py-3 text-xs font-black text-white shadow-lg hover:bg-[#0d3b7a]">＋ New Report</button></div></div>

            <section className="no-print grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
              <SummaryCard icon="♟" label="TOTAL PATIENTS" value={patientCount} tone="purple" href="#reports" />
              <SummaryCard icon="♜" label="TOTAL INVESTIGATIONS" value={investigationCount} tone="blue" href="#reports" />
              <SummaryCard icon="⌛" label="AWAITING SAMPLING" value={0} tone="amber" href="/investigation-room" />
              <SummaryCard icon="♜" label="SAMPLE COLLECTED" value={0} tone="green" href="/investigation-room" />
              <SummaryCard icon="◌" label="IN PROCESSING" value={0} tone="cyan" href="/investigation-room" />
              <SummaryCard icon="▣" label="RESULT READY" value={investigationCount} tone="purple" href="#reports" />
              <SummaryCard icon="✓" label="REPORT VERIFIED" value={investigationCount} tone="teal" href="#reports" />
              <SummaryCard icon="▤" label="REPORT PUBLISHED" value={investigationCount} tone="green" href="#reports" />
            </section>

            <section className="no-print mt-5 flex flex-col gap-3 lg:flex-row"><div className="relative flex-1"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">⌕</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient ID, patient name or investigation…" className="w-full rounded-xl border border-slate-200 bg-white px-12 py-4 text-sm font-semibold text-slate-800 outline-none shadow-sm focus:border-[#0b63ce] focus:ring-4 focus:ring-[#0b63ce]/10" /></div><button className="rounded-xl border border-slate-200 bg-white px-6 py-4 text-xs font-black text-[#082b61] shadow-sm">⚱ Filters</button><div className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-[10px] font-black uppercase tracking-wider text-[#082b61] shadow-sm">◉ Showing: Finalized Results</div></section>

            {error && <div className="no-print mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
            {loading ? <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-12 text-sm font-semibold text-slate-400 shadow-sm">Loading finalized reports…</div> : grouped.length === 0 ? <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-14 text-center shadow-sm"><h2 className="text-lg font-black text-[#082b61]">No finalized reports found</h2><p className="mt-1 text-sm text-slate-500">Completed laboratory reports will appear here automatically.</p></div> : <div id="reports" className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-5">{grouped.map(({ patient, visit, orders }) => <article key={`${patient.patientId}-${visit.id}`} className="report-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(8,43,97,.08)]"><div className="bg-[#082b61] px-5 py-5 text-white sm:px-7"><div className="flex flex-wrap items-center justify-between gap-4"><div><div className="flex items-center gap-2"><span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-emerald-200">Finalized</span><span className="text-[9px] font-black uppercase tracking-wider text-blue-100">Investigation Report</span></div><h2 className="mt-2 text-2xl font-black">{patient.firstName} {patient.lastName}</h2><p className="mt-1 text-xs font-semibold text-blue-100/75">{patient.patientId} · OPD Visit #{visit.id} · Token {visit.tokenNumber}</p></div><div className="rounded-xl bg-white/10 px-4 py-3 text-right"><p className="text-[8px] font-black uppercase tracking-wider text-blue-100">Completed</p><p className="mt-1 text-sm font-black">{orders.length} {orders.length === 1 ? "Investigation" : "Investigations"}</p></div></div></div><div className="space-y-4 bg-[#f8fafc] p-4 sm:p-6">{orders.map((order) => <section key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#0b63ce]">{order.master?.category || "Laboratory"}</p><h3 className="mt-1 text-xl font-black text-[#082b61]">{order.investigation}</h3><p className="mt-1 text-[10px] font-bold text-slate-400">{order.master?.code || "—"} · Method: {order.master?.method || "—"}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[8px] font-black uppercase text-emerald-700">FINAL</span><button onClick={() => window.print()} className="rounded-lg bg-[#FDC823] px-4 py-2 text-[10px] font-black text-[#082b61] shadow-sm">▣ View / Print</button></div></div><div className="mt-5 grid gap-4 rounded-xl bg-[#f8fafc] p-4 text-xs text-slate-600 sm:grid-cols-3"><span><b>Specimen</b><br />{order.master?.specimen || "—"}</span><span><b>Unit</b><br />{order.master?.unit || "—"}</span><span><b>Reference Range</b><br />{order.master?.referenceRange || "—"}</span></div><div className="mt-4 grid gap-4 rounded-xl border border-slate-100 p-4 sm:grid-cols-[1fr_auto]"><div><p className="text-[8px] font-black uppercase tracking-[.18em] text-slate-400">Result / Findings</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-800">{order.reportText || "No result text recorded."}</p></div><div className="flex items-start"><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-black text-emerald-700">✓ Report Published</span></div></div><div className="mt-4 flex flex-wrap justify-between gap-2 text-[9px] font-semibold text-slate-400"><span>Reported: {formatDate(order.reportedAt)}</span><span>Order #{order.id}</span></div></section>)}</div></article>)}</div>
              <aside className="no-print space-y-5"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-lg font-black text-[#082b61]">Report Summary</h3><div className="mt-4 space-y-3 text-sm"><SummaryRow label="Total Investigations" value={investigationCount}/><SummaryRow label="Finalized" value={investigationCount}/><SummaryRow label="Report Verified" value={investigationCount}/><SummaryRow label="Report Published" value={investigationCount}/><SummaryRow label="Pending Verification" value={0}/><SummaryRow label="Pending Publication" value={0}/></div></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-lg font-black text-[#082b61]">Quick Actions</h3><div className="mt-3 divide-y divide-slate-100">{[["View All Published Reports","#reports"],["Pending Verification","/investigation-room"],["Reports Ready to Print","#reports"]].map(([label,href])=><Link key={label} href={href} className="flex items-center justify-between py-3 text-xs font-bold text-slate-700 hover:text-[#0b63ce]"><span>▣ &nbsp;{label}</span><span>→</span></Link>)}</div></section></aside>
            </div>}
            <footer className="no-print mt-8 border-t border-slate-200 py-5 text-center text-[9px] font-bold uppercase tracking-wider text-slate-400">© 2026 SAMS Laboratory Information System. All rights reserved.</footer>
          </div>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({ icon, label, value, tone, href }: { icon: string; label: string; value: number; tone: string; href: string }) {
  const tones: Record<string,string> = { purple:"bg-purple-50 text-purple-700", blue:"bg-blue-50 text-blue-600", amber:"bg-amber-50 text-amber-600", green:"bg-emerald-50 text-emerald-600", cyan:"bg-cyan-50 text-cyan-600", teal:"bg-teal-50 text-teal-600" };
  return <Link href={href} className="group rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className={`grid h-10 w-10 place-items-center rounded-xl text-lg ${tones[tone] || tones.blue}`}>{icon}</div><p className={`mt-3 text-[8px] font-black uppercase tracking-wider ${tones[tone]?.split(" ")[1] || "text-slate-500"}`}>{label}</p><p className="mt-1 text-2xl font-black text-[#082b61]">{value}</p><p className="mt-2 text-[9px] font-bold text-slate-500 group-hover:text-[#0b63ce]">{value ? "View details" : "View details"} →</p></Link>;
}

function SummaryRow({ label, value }: { label: string; value: number }) { return <div className="flex items-center justify-between"><span className="font-semibold text-slate-500">{label}</span><b className="text-[#082b61]">{value}</b></div>; }
