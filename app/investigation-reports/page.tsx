"use client";

import Image from "next/image";
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
    <main className="min-h-screen bg-[#06101d] text-slate-900 print:bg-white print:px-0">
      <style>{`@media print { .no-print { display:none !important; } .report-card { break-inside:avoid; border:0 !important; box-shadow:none !important; margin:0 0 28px !important; } body { background:#fff !important; } }`}</style>
      <div className="min-h-screen bg-[radial-gradient(circle_at_82%_0%,rgba(214,164,67,.14),transparent_25%),radial-gradient(circle_at_0%_35%,rgba(0,105,190,.18),transparent_30%),linear-gradient(145deg,#050c15,#081b2d_55%,#06101d)] px-3 py-3 sm:px-5 lg:px-8 lg:py-6 print:bg-white print:p-0">
        <div className="mx-auto max-w-[1500px]">
          <header className="no-print relative overflow-hidden rounded-[1.8rem] border border-[#d6a443]/30 bg-[linear-gradient(135deg,#07182b,#0b3150_58%,#071523)] shadow-[0_25px_80px_rgba(0,0,0,.35)]">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0b63ce] via-[#d6a443] to-[#f5dc9b]" />
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-7">
              <div className="flex min-w-0 items-center gap-3">
                <Link href="/investigations" className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-black text-slate-200 hover:border-[#d6a443]/50"><span className="text-base">←</span> Back</Link>
                <div className="h-8 w-px bg-white/10" />
                <Image src="/serawat-logo.png" alt="SAMS" width={48} height={48} className="h-9 w-auto object-contain" priority />
                <div className="min-w-0"><p className="truncate text-sm font-black text-[#f5dc9b] sm:text-base">Serawat Advanced Multispeciality Joint &amp; Spine Centre</p><p className="text-[8px] font-black uppercase tracking-[.25em] text-slate-400">SAMS · Diagnostics</p></div>
              </div>
              <nav className="flex flex-wrap gap-2">
                <Link href="/investigations" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[9px] font-black uppercase tracking-wider text-slate-300 hover:bg-white/10">Workspace</Link>
                <Link href="/investigation-room" className="rounded-xl border border-blue-300/20 bg-blue-500/10 px-3 py-2 text-[9px] font-black uppercase tracking-wider text-blue-100 hover:bg-blue-500/20">Lab Room</Link>
                <Link href="/billing" className="rounded-xl border border-[#d6a443]/30 bg-[#d6a443]/10 px-3 py-2 text-[9px] font-black uppercase tracking-wider text-[#f5dc9b] hover:bg-[#d6a443]/20">Billing</Link>
                <button onClick={() => window.print()} className="rounded-xl bg-[#d6a443] px-3.5 py-2 text-[9px] font-black uppercase tracking-wider text-[#071523] shadow-lg hover:bg-[#f5dc9b]">Print Reports</button>
              </nav>
            </div>
          </header>

          <section className="no-print relative mt-5 overflow-hidden rounded-[2.3rem] border border-[#d6a443]/35 bg-[linear-gradient(125deg,#07182b_0%,#073f72_55%,#075dcc_100%)] px-6 py-9 text-white shadow-[0_30px_90px_rgba(0,0,0,.38)] sm:px-10 sm:py-12 lg:px-14">
            <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#d6a443]/15 blur-3xl" /><div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div><div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.2em] text-[#f5dc9b]"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Finalized Diagnostics</div><h1 className="mt-4 text-3xl font-black tracking-[-.035em] sm:text-5xl">Investigation Reports</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">A patient-centric command centre for finalized laboratory reports, result review and professional printing.</p></div>
              <div className="grid grid-cols-2 gap-3 sm:min-w-[310px]"><div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><p className="text-[9px] font-black uppercase tracking-widest text-blue-200">Patients</p><p className="mt-1 text-2xl font-black">{patientCount}</p></div><div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><p className="text-[9px] font-black uppercase tracking-widest text-blue-200">Final reports</p><p className="mt-1 text-2xl font-black">{investigationCount}</p></div></div>
            </div>
          </section>

          <section className="no-print mt-5 rounded-[1.7rem] border border-white/10 bg-white/[.06] p-3 shadow-[0_20px_60px_rgba(0,0,0,.22)] sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div className="relative flex-1"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient ID, patient name or investigation…" className="w-full rounded-xl border border-white/10 bg-[#081827] px-11 py-3.5 text-sm font-semibold text-white outline-none placeholder:text-slate-500 focus:border-[#d6a443]/60 focus:ring-4 focus:ring-[#d6a443]/10" /></div><div className="rounded-xl border border-white/10 bg-[#081827] px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400">Showing finalized results</div></div>
          </section>

          {error && <div className="no-print mt-5 rounded-xl border border-red-300/20 bg-red-500/10 p-4 text-sm font-semibold text-red-200">{error}</div>}
          {loading ? <div className="mt-5 rounded-[1.7rem] border border-white/10 bg-white/[.06] p-10 text-sm font-semibold text-slate-400">Loading finalized reports…</div> : grouped.length === 0 ? <div className="mt-5 rounded-[1.7rem] border border-white/10 bg-white/[.06] p-14 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[#d6a443]/20 bg-[#d6a443]/10 text-2xl text-[#f5dc9b]">▤</div><h2 className="mt-4 text-lg font-black text-white">No finalized reports found</h2><p className="mt-1 text-sm text-slate-500">Completed laboratory reports will appear here automatically.</p></div> : <div className="mt-5 space-y-5">{grouped.map(({ patient, visit, orders }) => (
            <article key={`${patient.patientId}-${visit.id}`} className="report-card overflow-hidden rounded-[1.8rem] border border-white/10 bg-white shadow-[0_20px_55px_rgba(0,0,0,.22)]">
              <div className="bg-[linear-gradient(110deg,#07182b,#0b3760)] px-5 py-5 text-white sm:px-7"><div className="flex flex-wrap items-center justify-between gap-4"><div><div className="flex items-center gap-2"><span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-emerald-200">Finalized</span><span className="text-[9px] font-black uppercase tracking-wider text-blue-200">Investigation Report</span></div><h2 className="mt-2 text-2xl font-black">{patient.firstName} {patient.lastName}</h2><p className="mt-1 text-xs font-semibold text-blue-100/70">{patient.patientId} · OPD Visit #{visit.id} · Token {visit.tokenNumber} · {visit.visitType}</p></div><div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-right"><p className="text-[8px] font-black uppercase tracking-wider text-blue-200">Completed</p><p className="mt-1 text-sm font-black">{orders.length} {orders.length === 1 ? "Investigation" : "Investigations"}</p></div></div></div>
              <div className="space-y-4 bg-[#fbfcfe] p-4 sm:p-6">{orders.map((order) => <section key={order.id} className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-[0_8px_25px_rgba(15,35,65,.05)] sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-blue-600">{order.master?.category || "Laboratory"}</p><h3 className="mt-1 text-lg font-black text-[#082b61]">{order.investigation}</h3><p className="mt-1 text-[10px] font-bold text-slate-400">{order.master?.code || "—"} · Method: {order.master?.method || "—"}</p></div><span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[8px] font-black uppercase tracking-wider text-emerald-700">FINAL</span></div><div className="mt-5 grid gap-2 rounded-xl bg-slate-50 p-4 text-xs text-slate-600 sm:grid-cols-3"><span><b>Specimen</b><br />{order.master?.specimen || "—"}</span><span><b>Unit</b><br />{order.master?.unit || "—"}</span><span><b>Reference range</b><br />{order.master?.referenceRange || "—"}</span></div><div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5"><p className="text-[8px] font-black uppercase tracking-[.18em] text-slate-400">Result / Findings</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-800">{order.reportText || "No result text recorded."}</p></div><div className="mt-4 flex flex-wrap justify-between gap-2 text-[9px] font-semibold text-slate-400"><span>Reported: {formatDate(order.reportedAt)}</span><span>Order #{order.id}</span></div></section>)}</div>
              <footer className="border-t border-slate-200 bg-white px-5 py-4 text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:px-7">SAMS · Serawat Advanced Multispeciality Joint &amp; Spine Centre · Patient {patient.patientId} · Visit #{visit.id}</footer>
            </article>
          ))}</div>}
        </div>
      </div>
    </main>
  );
}
