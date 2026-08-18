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
  billing: { id: number; paymentStatus: string; paidAmount: number; balanceAmount: number; netAmount: number } | null;
  workflow: { paymentStatus: string; outstandingAmount: number; samplingEligible: boolean; paymentRequiredBeforeSampling: boolean };
};

const STATUSES = ["ALL", "ORDERED", "APPROVED_FOR_SAMPLING", "ACCEPTED", "SAMPLE_COLLECTED", "PROCESSING", "COMPLETED", "CANCELLED"];

export default function InvestigationRoomPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState("ALL");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (status !== "ALL") params.set("status", status);
      const response = await fetch(`/api/investigation-room?${params.toString()}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to load investigation room.");
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load investigation room.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 200);
    return () => window.clearTimeout(timer);
  }, [q, status]);

  const counts = useMemo(() => STATUSES.reduce<Record<string, number>>((acc, item) => {
    acc[item] = item === "ALL" ? orders.length : orders.filter((order) => order.status === item).length;
    return acc;
  }, {}), [orders]);

  async function updateOrder(id: number, newStatus: string, reportText?: string) {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/investigation-room", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus, reportText }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to update investigation.");
      setEditing(null);
      setDraft("");
      setMessage(`Investigation #${id} updated to ${newStatus.replaceAll("_", " ")}.`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update investigation.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-5 py-7 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-[1280px]">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[1.6rem] border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-7">
          <div className="flex items-center gap-3"><Link href="/investigations" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-lg font-black text-[#082b61]">←</Link><div><p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">SAMS · Diagnostics</p><h1 className="mt-1 text-xl font-black text-[#082b61]">Investigation Room</h1></div></div>
          <div className="flex gap-2"><Link href="/investigation-master" className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-[#082b61]">Master</Link><button onClick={() => void load()} className="rounded-xl bg-[#082b61] px-4 py-2.5 text-xs font-black text-white">Refresh</button></div>
        </header>

        <section className="rounded-[2rem] bg-gradient-to-br from-[#082b61] via-[#075dcc] to-[#0b63ce] p-7 text-white shadow-xl sm:p-9">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-200">Laboratory / Diagnostics Workflow</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">Order → Bill / Approval → Accept → Sample → Process → Report</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-blue-100">Every order must be paid or explicitly approved for sampling. The laboratory then accepts the order before collecting the sample.</p>
        </section>

        {(error || message) && <div className={`mt-5 rounded-xl border p-4 text-sm font-semibold ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{error || message}</div>}

        <section className="mt-5 rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-3 lg:flex-row"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient ID, patient name or investigation..." className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#0b63ce]"/><select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold">{STATUSES.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}{item !== "ALL" ? ` (${counts[item] ?? 0})` : ` (${counts.ALL ?? 0})`}</option>)}</select></div></section>

        <section className="mt-5 overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-sm">
          {loading ? <div className="p-8 text-sm font-semibold text-slate-500">Loading investigation orders…</div> : orders.length === 0 ? <div className="p-10 text-center text-sm font-semibold text-slate-400">No investigation orders found.</div> : <div className="divide-y divide-slate-100">
            {orders.map((order) => {
              const patient = `${order.opdVisit.patient.firstName} ${order.opdVisit.patient.lastName}`.trim();
              const isEditing = editing === order.id;
              const paid = order.paymentStatus === "PAID" || order.workflow.paymentStatus === "PAID" || order.workflow.outstandingAmount <= 0;
              const canAccept = order.status === "ORDERED" && (paid || order.workflow.samplingEligible);
              const canApprove = order.status === "ORDERED" && !paid;
              const canCollect = order.status === "ACCEPTED";
              const canProcess = order.status === "SAMPLE_COLLECTED";
              const canFinalize = order.status === "PROCESSING";
              return <article key={order.id} className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-blue-50 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-[#0b63ce]">#{order.id}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-slate-600">{order.status.replaceAll("_", " ")}</span><span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider ${paid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{paid ? "PAID" : `PAYMENT PENDING · ₹${order.workflow.outstandingAmount}`}</span></div>
                    <h3 className="mt-3 text-lg font-black text-[#082b61]">{order.investigation}</h3>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{patient} · {order.opdVisit.patient.patientId} · OPD Visit #{order.opdVisit.id} · Token {order.opdVisit.tokenNumber}</p>
                    <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-3"><span><b>Code:</b> {order.master?.code || "—"}</span><span><b>Specimen:</b> {order.master?.specimen || "—"}</span><span><b>Reference:</b> {order.master?.referenceRange || "—"}</span></div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 lg:max-w-[520px] lg:justify-end">
                    {canApprove && <button disabled={saving} onClick={() => void updateOrder(order.id, "APPROVED_FOR_SAMPLING")} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-black text-amber-800 disabled:opacity-50">Approve for Sampling</button>}
                    {canAccept && <button disabled={saving} onClick={() => void updateOrder(order.id, "ACCEPTED")} className="rounded-xl bg-[#082b61] px-4 py-2.5 text-xs font-black text-white disabled:opacity-50">Accept Order</button>}
                    {order.status === "APPROVED_FOR_SAMPLING" && <button disabled={saving} onClick={() => void updateOrder(order.id, "ACCEPTED")} className="rounded-xl bg-[#082b61] px-4 py-2.5 text-xs font-black text-white disabled:opacity-50">Accept Order</button>}
                    {canCollect && <button disabled={saving} onClick={() => void updateOrder(order.id, "SAMPLE_COLLECTED")} className="rounded-xl bg-[#0b63ce] px-4 py-2.5 text-xs font-black text-white disabled:opacity-50">Collect Sample</button>}
                    {canProcess && <button disabled={saving} onClick={() => void updateOrder(order.id, "PROCESSING")} className="rounded-xl bg-[#0b63ce] px-4 py-2.5 text-xs font-black text-white disabled:opacity-50">Start Processing</button>}
                    {canFinalize && <button disabled={saving || !order.reportText} onClick={() => void updateOrder(order.id, "COMPLETED", order.reportText || undefined)} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-40">Finalize Report</button>}
                    {order.status !== "COMPLETED" && order.status !== "CANCELLED" && <button onClick={() => { setEditing(order.id); setDraft(order.reportText || ""); }} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-[#082b61]">Enter Result</button>}
                    {order.status === "COMPLETED" && <button onClick={() => window.print()} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-[#082b61]">Print Report</button>}
                  </div>
                </div>
                {order.status === "ORDERED" && !paid && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">Bill is pending. Approve for Sampling first, then Accept Order.</div>}
                {isEditing && <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-4"><textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={5} placeholder="Enter investigation result / report findings..." className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-[#0b63ce]"/><div className="mt-3 flex flex-wrap gap-2"><button disabled={saving} onClick={() => void updateOrder(order.id, order.status, draft)} className="rounded-xl bg-[#082b61] px-4 py-2.5 text-xs font-black text-white">Save Result</button><button onClick={() => { setEditing(null); setDraft(""); }} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black">Cancel</button></div></div>}
                {order.reportText && <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Result / Report</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{order.reportText}</p>{order.reportedAt && <p className="mt-2 text-[10px] font-semibold text-slate-400">Reported {new Date(order.reportedAt).toLocaleString()}</p>}</div>}
              </article>;
            })}
          </div>}
        </section>
      </div>
    </main>
  );
}
