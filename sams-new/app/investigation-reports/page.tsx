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

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-5 py-7 text-slate-900 sm:px-8 print:bg-white print:px-0 print:py-0">
      <style>{`@media print { .no-print { display:none !important; } .report-card { break-inside:avoid; border:0 !important; box-shadow:none !important; margin:0 0 28px !important; } body { background:#fff !important; } }`}</style>
      <div className="mx-auto max-w-[1180px]">
        <header className="no-print mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[1.6rem] border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-7">
          <div className="flex items-center gap-3">
            <Link href="/investigations" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-lg font-black text-[#082b61]">←</Link>
            <div><p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">SAMS · Diagnostics</p><h1 className="mt-1 text-xl font-black text-[#082b61]">Reports & Results</h1></div>
          </div>
          <button onClick={() => window.print()} className="rounded-xl bg-[#082b61] px-4 py-2.5 text-xs font-black text-white">Print Reports</button>
        </header>

        <section className="no-print mb-5 rounded-[2rem] bg-gradient-to-br from-[#082b61] via-[#075dcc] to-[#0b63ce] p-7 text-white shadow-xl sm:p-9">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-200">Finalized Diagnostics</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">Patient-wise Investigation Reports</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100">Completed investigation results remain linked to the patient, OPD Visit and Investigation Master. Use the patient ID, name or investigation name to find a report.</p>
        </section>

        <section className="no-print mb-5 rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient ID, patient name or investigation..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#0b63ce]" />
        </section>

        {error && <div className="no-print mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
        {loading ? <div className="rounded-[1.6rem] border border-slate-200 bg-white p-8 text-sm font-semibold text-slate-500">Loading finalized reports…</div> : grouped.length === 0 ? <div className="rounded-[1.6rem] border border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-400">No finalized investigation reports found.</div> : grouped.map(({ patient, visit, orders }) => (
          <article key={`${patient.patientId}-${visit.id}`} className="report-card mb-6 rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">Investigation Report</p>
                <h2 className="mt-2 text-2xl font-black text-[#082b61]">{patient.firstName} {patient.lastName}</h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">Patient ID: {patient.patientId} · OPD Visit #{visit.id} · Token {visit.tokenNumber} · {visit.visitType}</p>
              </div>
              <div className="text-right text-xs font-semibold text-slate-500">{orders.length} completed investigation{orders.length === 1 ? "" : "s"}</div>
            </div>

            <div className="mt-6 space-y-5">
              {orders.map((order) => <section key={order.id} className="rounded-2xl border border-slate-200 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><h3 className="text-lg font-black text-[#082b61]">{order.investigation}</h3><p className="mt-1 text-xs font-semibold text-slate-500">{order.master?.code || "—"} · {order.master?.category || "—"} · Method: {order.master?.method || "—"}</p></div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-700">FINAL</span>
                </div>
                <div className="mt-4 grid gap-3 text-xs text-slate-600 sm:grid-cols-3"><span><b>Specimen:</b> {order.master?.specimen || "—"}</span><span><b>Unit:</b> {order.master?.unit || "—"}</span><span><b>Reference:</b> {order.master?.referenceRange || "—"}</span></div>
                <div className="mt-5 rounded-xl bg-slate-50 p-4"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Result / Findings</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-800">{order.reportText || "No result text recorded."}</p></div>
                <p className="mt-3 text-[10px] font-semibold text-slate-400">Reported: {order.reportedAt ? new Date(order.reportedAt).toLocaleString() : "—"} · Order #{order.id}</p>
              </section>)}
            </div>

            <footer className="mt-7 border-t border-slate-200 pt-4 text-[10px] font-semibold text-slate-400">SAMS · Investigation Report · Patient {patient.patientId} · OPD Visit #{visit.id}</footer>
          </article>
        ))}
      </div>
    </main>
  );
}
