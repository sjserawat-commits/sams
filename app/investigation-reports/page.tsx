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
const money = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

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
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ status: "COMPLETED" });
        if (q.trim()) params.set("q", q.trim());
        const response = await fetch(`/api/investigation-room?${params.toString()}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || "Unable to load reports.");
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load reports.");
      } finally {
        setLoading(false);
      }
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
  const reportValue = orders.reduce((sum, order) => sum + Number(order.netAmount ?? order.price ?? 0), 0);

  return (
    <main className="min-h-screen bg-[#f5f7fa] text-[#071a38] print:bg-white">
      <style>{`@media print{.no-print{display:none!important}.report-card{break-inside:avoid;box-shadow:none!important;border:0!important}body{background:#fff!important}}`}</style>

      <aside className="no-print fixed inset-y-0 left-0 z-40 hidden w-[205px] bg-[#071a38] lg:block">
        <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-5">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#d6a443] text-2xl text-[#071a38]">⚕</div>
          <div><p className="text-lg font-black tracking-tight text-white">SAMS LAB</p><p className="text-[8px] font-black uppercase tracking-[.18em] text-[#d6a443]">Diagnostics</p></div>
        </div>
        <nav className="px-2 py-5">
          {navItems.map(([label, href, icon]) => { const active = label === "Investigation Reports"; return <Link key={label} href={href} className={`mb-1.5 flex items-center gap-3 rounded-xl px-4 py-3 text-[12px] font-black transition ${active ? "bg-[#d6a443] text-[#071a38] shadow-lg" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}><span className="w-5 text-center text-base">{icon}</span><span>{label}</span></Link>; })}
        </nav>
        <div className="absolute inset-x-5 bottom-5 border-t border-white/10 pt-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-lg text-[#d6a443]">●</div><div><p className="text-[11px] font-black text-white">Lab Technician</p><p className="text-[9px] font-semibold text-slate-400">Laboratory</p></div></div></div>
      </aside>

      <div className="lg:pl-[205px]">
        <header className="no-print flex h-[76px] items-center justify-between border-b border-slate-200 bg-white px-5 shadow-sm sm:px-8">
          <div><p className="text-[9px] font-black uppercase tracking-[.2em] text-[#d6a443]">SAMS · Laboratory</p><p className="mt-1 text-sm font-black text-[#082b61]">Serawat Advanced Multispeciality Joint &amp; Spine Centre</p></div>
          <div className="flex items-center gap-3"><Link href="/investigation-room" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-black text-[#082b61] shadow-sm">← Lab Room</Link><button onClick={() => window.print()} className="rounded-xl bg-[#082b61] px-4 py-2.5 text-[10px] font-black text-white shadow-sm">Print Reports</button></div>
        </header>

        <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 xl:px-10">
          <section className="no-print mb-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="relative overflow-hidden rounded-[1.8rem] bg-[linear-gradient(135deg,#071a38_0%,#0a3b70_58%,#075dcc_100%)] p-7 text-white shadow-[0_22px_55px_rgba(8,43,97,.20)] sm:p-9">
              <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/10" />
              <div className="absolute -right-8 -bottom-28 h-72 w-72 rounded-full border border-[#d6a443]/20" />
              <div className="relative max-w-3xl">
                <div className="flex items-center gap-2"><span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1.5 text-[8px] font-black uppercase tracking-[.18em] text-emerald-200">Finalized Diagnostics</span><span className="text-[9px] font-black uppercase tracking-[.18em] text-blue-200">Laboratory Information System</span></div>
                <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Investigation Reports</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">Review, verify and print completed laboratory reports linked to the patient and OPD Visit.</p>
                <div className="mt-7 flex flex-wrap gap-3"><div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3"><p className="text-[8px] font-black uppercase tracking-wider text-blue-200">Patients</p><p className="mt-1 text-xl font-black">{patientCount}</p></div><div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3"><p className="text-[8px] font-black uppercase tracking-wider text-blue-200">Investigations</p><p className="mt-1 text-xl font-black">{investigationCount}</p></div><div className="rounded-xl border border-[#d6a443]/25 bg-[#d6a443]/10 px-4 py-3"><p className="text-[8px] font-black uppercase tracking-wider text-[#f4d58c]">Report Value</p><p className="mt-1 text-xl font-black text-[#f4d58c]">{money(reportValue)}</p></div></div>
              </div>
            </div>

            <aside className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-[0_16px_45px_rgba(8,43,97,.10)] sm:p-7">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5"><div><p className="text-[9px] font-black uppercase tracking-[.22em] text-[#d6a443]">Laboratory Overview</p><h2 className="mt-1.5 text-2xl font-black tracking-tight text-[#082b61]">Lab Summary</h2></div><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#071a38] text-lg text-[#d6a443]">▦</div></div>
              <div className="mt-5 space-y-3">
                <LabSummaryRow label="Patients with finalized reports" value={patientCount} />
                <LabSummaryRow label="Completed investigations" value={investigationCount} />
                <LabSummaryRow label="Finalized reports" value={investigationCount} />
                <LabSummaryRow label="Published reports" value={investigationCount} />
                <div className="mt-4 rounded-2xl bg-[#f6f8fb] p-4"><div className="flex items-end justify-between gap-3"><div><p className="text-[8px] font-black uppercase tracking-[.18em] text-slate-400">Completed report value</p><p className="mt-1 text-2xl font-black text-[#082b61]">{money(reportValue)}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[8px] font-black uppercase tracking-wider text-emerald-700">Final</span></div></div>
              </div>
            </aside>
          </section>

          <section className="no-print mb-5 flex flex-col gap-3 lg:flex-row"><div className="relative flex-1"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">⌕</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient ID, patient name or investigation…" className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-4 text-sm font-semibold text-slate-800 outline-none shadow-sm focus:border-[#0b63ce] focus:ring-4 focus:ring-[#0b63ce]/10" /></div><div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[10px] font-black uppercase tracking-wider text-[#082b61] shadow-sm">◉ Showing: Finalized Results</div></section>

          {error && <div className="no-print mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
          {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-12 text-sm font-semibold text-slate-400 shadow-sm">Loading finalized reports…</div> : grouped.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center shadow-sm"><h2 className="text-lg font-black text-[#082b61]">No finalized reports found</h2><p className="mt-1 text-sm text-slate-500">Completed laboratory reports will appear here automatically.</p></div> : <div id="reports" className="space-y-5">
            {grouped.map(({ patient, visit, orders }) => <article key={`${patient.patientId}-${visit.id}`} className="report-card overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(8,43,97,.08)]">
              <div className="bg-[#082b61] px-5 py-5 text-white sm:px-7"><div className="flex flex-wrap items-center justify-between gap-4"><div><div className="flex items-center gap-2"><span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-emerald-200">Finalized</span><span className="text-[9px] font-black uppercase tracking-wider text-blue-100">Investigation Report</span></div><h2 className="mt-2 text-2xl font-black">{patient.firstName} {patient.lastName}</h2><p className="mt-1 text-xs font-semibold text-blue-100/75">{patient.patientId} · OPD Visit #{visit.id} · Token {visit.tokenNumber}</p></div><div className="rounded-xl bg-white/10 px-4 py-3 text-right"><p className="text-[8px] font-black uppercase tracking-wider text-blue-100">Completed</p><p className="mt-1 text-sm font-black">{orders.length} {orders.length === 1 ? "Investigation" : "Investigations"}</p></div></div></div>
              <div className="space-y-4 bg-[#f8fafc] p-4 sm:p-6">{orders.map((order) => <section key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#0b63ce]">{order.master?.category || "Laboratory"}</p><h3 className="mt-1 text-xl font-black text-[#082b61]">{order.investigation}</h3><p className="mt-1 text-[10px] font-bold text-slate-400">{order.master?.code || "—"} · Method: {order.master?.method || "—"}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[8px] font-black uppercase text-emerald-700">FINAL</span><button onClick={() => window.print()} className="rounded-lg bg-[#d6a443] px-4 py-2 text-[10px] font-black text-[#071a38] shadow-sm">▣ View / Print</button></div></div><div className="mt-5 grid gap-4 rounded-xl bg-[#f8fafc] p-4 text-xs text-slate-600 sm:grid-cols-3"><span><b>Specimen</b><br />{order.master?.specimen || "—"}</span><span><b>Unit</b><br />{order.master?.unit || "—"}</span><span><b>Reference Range</b><br />{order.master?.referenceRange || "—"}</span></div><div className="mt-4 rounded-xl border border-slate-100 p-4"><p className="text-[8px] font-black uppercase tracking-[.18em] text-slate-400">Result / Findings</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-800">{order.reportText || "No result text recorded."}</p></div><div className="mt-4 flex flex-wrap justify-between gap-2 text-[9px] font-semibold text-slate-400"><span>Reported: {formatDate(order.reportedAt)}</span><span>Order #{order.id}</span></div></section>)}</div>
            </article>)}
          </div>}

          <footer className="no-print mt-8 border-t border-slate-200 py-5 text-center text-[9px] font-bold uppercase tracking-wider text-slate-400">© 2026 SAMS Laboratory Information System. All rights reserved.</footer>
        </div>
      </div>
    </main>
  );
}

function LabSummaryRow({ label, value }: { label: string; value: number }) {
  return <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 px-4 py-3"><span className="text-xs font-semibold text-slate-500">{label}</span><span className="text-lg font-black text-[#082b61]">{value}</span></div>;
}
