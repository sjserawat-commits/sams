"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Patient = { id: number; patientId: string; firstName: string; lastName?: string; gender?: string };
type Visit = { id: number; tokenNumber: number; visitType: string; status?: string; createdAt?: string; departmentMaster?: { name?: string } | null; doctor?: { name?: string } | null };

export default function SlipPrintSearchPage() {
  const searchParams = useSearchParams();
  const fromReception = searchParams.get("from") === "reception";
  const backHref = fromReception ? "/reception" : "/doctor-desk";
  const backLabel = fromReception ? "← Back to Reception" : "← Back to Doctor Desk";
  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [visitsLoading, setVisitsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/patients", { cache: "no-store" });
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || "Unable to load patients.");
        setPatients(Array.isArray(data) ? data : []);
      } catch (e) { setError(e instanceof Error ? e.message : "Unable to load patients."); }
      finally { setLoading(false); }
    })();
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return patients.filter(p => `${p.firstName} ${p.lastName || ""}`.toLowerCase().includes(q) || String(p.patientId || "").toLowerCase().includes(q)).slice(0, 12);
  }, [patients, query]);

  async function choosePatient(patient: Patient) {
    setSelected(patient); setQuery(`${patient.firstName} ${patient.lastName || ""}`.trim()); setError(""); setVisitsLoading(true);
    try {
      const r = await fetch(`/api/patients/${patient.id}/opd-visits`, { cache: "no-store" });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Unable to load OPD visits.");
      setVisits(Array.isArray(data?.visits) ? data.visits : []);
    } catch (e) { setVisits([]); setError(e instanceof Error ? e.message : "Unable to load OPD visits."); }
    finally { setVisitsLoading(false); }
  }

  const dateLabel = (v?: string) => v ? new Date(v).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

  return <main className="min-h-screen bg-[#f4f7fb] text-slate-900">
    <header className="border-b border-[#d6a443]/30 bg-[#061525] px-4 py-4 text-white sm:px-8"><div className="mx-auto flex max-w-[1200px] items-center justify-between"><div><p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#d6a443]">SAMS · OPD</p><h1 className="mt-1 text-2xl font-black">Consultation Slip Print</h1></div><Link href={backHref} className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-black">{backLabel}</Link></div></header>
    <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,38,70,.10)] sm:p-8">
        <div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">Patient Search</p><h2 className="mt-1 text-2xl font-black text-[#082b61]">Search patient for post-consultation slip</h2><p className="mt-1 text-sm font-semibold text-slate-500">Search by Patient Name or HID.</p></div>
        <div className="mt-6"><input value={query} onChange={e => { setQuery(e.target.value); setSelected(null); setVisits([]); }} placeholder="Search by Name / HID…" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold outline-none focus:border-[#d6a443] focus:bg-white" autoFocus /></div>
        {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
        {!selected && query.trim() && <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">{loading ? <p className="p-5 text-sm text-slate-500">Loading patients…</p> : matches.length ? matches.map(p => <button key={p.id} onClick={() => choosePatient(p)} className="flex w-full items-center justify-between border-b border-slate-100 px-5 py-4 text-left hover:bg-blue-50 last:border-b-0"><div><p className="font-black text-[#082b61]">{p.firstName} {p.lastName || ""}</p><p className="mt-1 text-xs font-semibold text-slate-500">HID · {p.patientId} {p.gender ? ` · ${p.gender}` : ""}</p></div><span className="text-xs font-black text-[#0b63ce]">Select →</span></button>) : <p className="p-5 text-sm font-semibold text-slate-500">No patient found for “{query}”.</p>}</div>}
        {selected && <div className="mt-6"><div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5"><div><p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#0b63ce]">Selected Patient</p><h3 className="mt-1 text-lg font-black text-[#082b61]">{selected.firstName} {selected.lastName || ""}</h3><p className="mt-1 text-xs font-bold text-slate-500">HID · {selected.patientId}</p></div><button onClick={() => { setSelected(null); setVisits([]); setQuery(""); }} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black">Change Patient</button></div>
          <div className="mt-5">{visitsLoading ? <p className="rounded-xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">Loading OPD visits…</p> : visits.length ? <div className="space-y-3">{visits.map(v => <div key={v.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#d6a443]">OPD #{v.tokenNumber} · {v.visitType === "FOLLOW_UP" ? "Follow-up" : "New Visit"}</p><h4 className="mt-1 font-black text-[#082b61]">{v.departmentMaster?.name || "Department"} · {v.doctor?.name || "Consultant"}</h4><p className="mt-1 text-xs font-semibold text-slate-500">{dateLabel(v.createdAt)} · Status · {v.status || "—"}</p></div><Link href={`/patients/profile/${selected.id}/opd-slip/print?visitId=${v.id}`} className="rounded-xl bg-[#d6a443] px-5 py-3 text-xs font-black text-[#071525]">Print Post-Consultation Slip →</Link></div>)}</div> : <p className="rounded-xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">No OPD visits found for this patient.</p>}</div>
        </div>}
      </section>
    </div>
  </main>;
}
