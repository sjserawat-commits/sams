"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Patient = { id: number; patientId: string; firstName: string; lastName: string; phone?: string | null };
type Investigation = { id: number; code: string; name: string; category: string; department?: string | null; rate: number; specimen?: string | null };
type Selected = Investigation & { orderId?: number; paymentStatus?: string; status?: string };

const money = (n: number) => `₹${Number(n || 0).toFixed(2)}`;
const patientName = (p: Patient) => `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Patient";

export default function EditableInvestigationOrder() {
  const search = useSearchParams();
  const patientIdParam = search.get("patientId") || "";
  const visitId = Number(search.get("opdVisitId") || search.get("visitId") || 0);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [catalogue, setCatalogue] = useState<Investigation[]>([]);
  const [selected, setSelected] = useState<Selected[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const [patientsRes, masterRes] = await Promise.all([
        fetch("/api/patients", { cache: "no-store" }),
        fetch("/api/investigation-master", { cache: "no-store" }),
      ]);
      const ps = await patientsRes.json();
      const ms = await masterRes.json();
      setPatients(Array.isArray(ps) ? ps : []);
      setCatalogue(Array.isArray(ms) ? ms.map((x: any) => ({ ...x, rate: Number(x.rate || 0) })) : []);
      if (patientIdParam) {
        const p = (Array.isArray(ps) ? ps : []).find((x: Patient) => x.patientId === patientIdParam);
        if (p) setPatient(p);
      }
      if (visitId > 0) {
        const r = await fetch(`/api/investigation-orders?opdVisitId=${visitId}`, { cache: "no-store" });
        const rows = await r.json();
        if (Array.isArray(rows)) {
          const active = rows.filter((x: any) => x.status !== "CANCELLED");
          if (active[0]?.opdVisit?.patient) setPatient(active[0].opdVisit.patient);
          setSelected(active.map((x: any) => ({
            id: Number(x.investigationId), code: x.master?.code || "", name: x.investigation,
            category: x.master?.category || "", department: x.master?.department || null,
            rate: Number(x.netAmount || x.price || 0), specimen: x.specimen || x.master?.specimen || null,
            orderId: Number(x.id), paymentStatus: x.paymentStatus, status: x.status,
          })));
        }
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load investigation order."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, [patientIdParam, visitId]);

  const categories = useMemo(() => Array.from(new Set(catalogue.map(x => x.category).filter(Boolean))).sort(), [catalogue]);
  const available = useMemo(() => {
    const q = query.trim().toLowerCase();
    const ids = new Set(selected.map(x => x.id));
    return catalogue.filter(x => !ids.has(x.id))
      .filter(x => category === "ALL" || x.category === category)
      .filter(x => !q || `${x.name} ${x.code} ${x.category} ${x.department || ""}`.toLowerCase().includes(q))
      .slice(0, 40);
  }, [catalogue, selected, query, category]);
  const patientOptions = useMemo(() => {
    const q = patientSearch.trim().toLowerCase();
    return patients.filter(p => !q || `${patientName(p)} ${p.patientId} ${p.phone || ""}`.toLowerCase().includes(q)).slice(0, 15);
  }, [patients, patientSearch]);
  const total = selected.reduce((s, x) => s + Number(x.rate || 0), 0);
  const locked = selected.some(x => x.paymentStatus === "PAID" || x.paymentStatus === "PARTIAL");

  function add(i: Investigation) {
    setSelected(v => [...v, i]); setMessage(""); setError("");
  }

  async function remove(item: Selected) {
    if (item.paymentStatus === "PAID" || item.paymentStatus === "PARTIAL") {
      setError("Paid or partially paid investigations cannot be removed."); return;
    }
    setBusy(item.id); setError(""); setMessage("");
    try {
      if (item.orderId) {
        const r = await fetch(`/api/investigation-orders?orderId=${item.orderId}`, { method: "DELETE" });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Unable to remove investigation.");
      }
      setSelected(v => v.filter(x => x.id !== item.id));
      setMessage(`${item.name} removed from this investigation list.`);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to remove investigation."); }
    finally { setBusy(null); }
  }

  async function continueToBilling() {
    if (!selected.length) { setError("Add at least one investigation before continuing."); return; }
    if (!visitId) { setError("A Visit is required for investigation billing."); return; }
    setSaving(true); setError(""); setMessage("");
    try {
      const newItems = selected.filter(x => !x.orderId);
      if (newItems.length) {
        const r = await fetch("/api/investigation-orders", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourceType: "CONSULTATION", patientId: patient?.patientId, opdVisitId: visitId, investigations: newItems.map(x => ({ id: x.id })) }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Unable to save added investigations.");
      }
      window.location.href = `/billing?patientId=${encodeURIComponent(patient?.patientId || patientIdParam)}&visitId=${visitId}&from=investigation&bill=1`;
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to continue to billing."); }
    finally { setSaving(false); }
  }

  return <main className="min-h-screen bg-[#f5f8fc] text-slate-900">
    <header className="bg-[#061a38] text-white shadow-lg"><div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-[.3em] text-[#f1d27a]">SAMS · Diagnostics</p><h1 className="mt-1 text-2xl font-black sm:text-3xl">Investigation Order</h1><p className="mt-1 text-xs text-blue-100">Review and edit the advised investigation list before billing.</p></div><Link href="/" className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-bold">← Dashboard</Link></div>
      {patient && <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4"><p className="text-[9px] font-black uppercase tracking-widest text-[#f1d27a]">Patient / Visit</p><p className="mt-1 font-black">{patientName(patient)} <span className="font-medium text-blue-200">· {patient.patientId} · Visit #{visitId}</span></p></div>}
    </div></header>

    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-8">
      {!patient && <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Patient</p><div className="relative mt-3"><input value={patient ? patientName(patient) : patientSearch} onChange={e => setPatientSearch(e.target.value)} placeholder="Search patient by name, Patient ID or mobile…" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"/>{patientSearch && <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border bg-white p-1 shadow-xl">{patientOptions.map(p => <button key={p.id} onClick={() => { setPatient(p); setPatientSearch(""); }} className="block w-full rounded-lg px-4 py-3 text-left hover:bg-blue-50"><b>{patientName(p)}</b><span className="ml-2 text-xs text-slate-500">{p.patientId}</span></button>)}</div>}</div></section>}

      <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-blue-600">Step 03 · Final review</p><h2 className="mt-1 text-2xl font-black text-[#082b61]">Investigation order</h2><p className="mt-1 text-xs text-slate-400">The advised list is editable here. Add or remove investigations before generating the bill.</p></div><div className="rounded-2xl bg-[#082b61] px-5 py-3 text-right text-white"><p className="text-[9px] font-black uppercase tracking-widest text-blue-200">Estimated total</p><p className="text-2xl font-black">{money(total)}</p></div></div>

        <div className="p-5 sm:p-7">
          {loading ? <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">Loading investigation list…</div> : selected.length === 0 ? <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center"><p className="font-black text-[#082b61]">No investigations selected</p><p className="mt-1 text-xs text-slate-400">Click Add Investigation to build the list.</p></div> : <div className="overflow-hidden rounded-2xl border border-slate-200"><div className="hidden grid-cols-[1fr_150px_110px_90px] bg-slate-50 px-4 py-3 text-[9px] font-black uppercase tracking-wider text-slate-500 sm:grid"><span>Investigation</span><span>Specimen</span><span className="text-right">Amount</span><span></span></div>{selected.map(item => <div key={item.id} className="grid gap-3 border-t border-slate-100 px-4 py-4 sm:grid-cols-[1fr_150px_110px_90px] sm:items-center"><div><div className="flex flex-wrap items-center gap-2"><p className="font-black text-[#082b61]">{item.name}</p>{item.orderId && <span className="rounded-full bg-blue-50 px-2 py-1 text-[8px] font-black uppercase text-blue-700">Advised / Ordered</span>}</div><p className="mt-1 text-[10px] text-slate-400">{item.code} · {item.category}</p></div><div className="text-xs text-slate-500">{item.specimen || "As applicable"}</div><div className="font-black sm:text-right">{money(item.rate)}</div><button onClick={() => void remove(item)} disabled={busy === item.id || locked || item.paymentStatus === "PAID" || item.paymentStatus === "PARTIAL"} className="rounded-lg px-2 py-2 text-left text-[10px] font-black text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-35 sm:text-right">Remove</button></div>)}</div>}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-black text-slate-700">{selected.length} investigation{selected.length === 1 ? "" : "s"} selected</p><p className="text-[10px] text-slate-400">You can add more from the Investigation Master or remove an item before billing.</p></div><button onClick={() => { setShowAdd(true); setQuery(""); setCategory("ALL"); setError(""); }} disabled={locked} className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-xs font-black text-[#082b61] hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50">＋ Add Investigation</button></div>

          {message && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">{message}</div>}
          {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</div>}

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end"><Link href="/investigations" className="rounded-xl border border-slate-200 px-5 py-3 text-center text-xs font-black text-slate-600">Cancel</Link><button onClick={() => void continueToBilling()} disabled={saving || !selected.length || locked} className="rounded-xl bg-[#0b63ce] px-6 py-3 text-xs font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving…" : "Generate / Continue to Billing →"}</button></div>
        </div>
      </section>
    </div>

    {showAdd && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-6"><div className="max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"><div className="flex items-center justify-between border-b p-5"><div><p className="text-[9px] font-black uppercase tracking-widest text-blue-600">Investigation Master</p><h3 className="text-xl font-black text-[#082b61]">Add Investigation</h3></div><button onClick={() => setShowAdd(false)} className="rounded-xl border px-3 py-2 text-xs font-black">Close</button></div><div className="p-5"><div className="grid gap-3 sm:grid-cols-[1fr_180px]"><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search investigation or code…" className="rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500"/><select value={category} onChange={e => setCategory(e.target.value)} className="rounded-xl border bg-slate-50 px-3 py-3 text-sm"><option value="ALL">All categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select></div><div className="mt-4 max-h-[52vh] space-y-2 overflow-y-auto">{available.map(i => <button key={i.id} onClick={() => add(i)} className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4 text-left hover:border-blue-300 hover:bg-blue-50"><div><p className="font-black text-[#082b61]">{i.name}</p><p className="mt-1 text-[10px] text-slate-400">{i.code} · {i.category} · {i.specimen || "As applicable"}</p></div><span className="shrink-0 rounded-xl bg-blue-600 px-3 py-2 text-[10px] font-black text-white">＋ {money(i.rate)}</span></button>)}{available.length === 0 && <div className="p-8 text-center text-sm text-slate-400">No additional investigations found.</div>}</div></div></div></div>}
  </main>;
}
