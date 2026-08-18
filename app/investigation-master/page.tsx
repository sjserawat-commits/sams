"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Investigation = {
  id: number;
  code: string;
  name: string;
  shortName: string | null;
  category: string;
  department: string | null;
  specimen: string | null;
  unit: string | null;
  referenceRange: string | null;
  aliases: string | null;
  rate: number;
  active: boolean;
};

const categories = ["Hematology", "Biochemistry", "Clinical Pathology", "Microbiology", "Immunology / Serology", "Endocrinology", "Vitamins & Nutrition", "Coagulation", "Histopathology / Cytology", "Radiology", "Ultrasound", "CT", "MRI", "X-ray", "ECG", "Electrodiagnosis", "Other Specialized"];

export default function InvestigationMasterPage() {
  const [rows, setRows] = useState<Investigation[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Investigation | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (category) params.set("category", category);
      const response = await fetch(`/api/investigation-master?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load investigation master");
      setRows(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [q, category]);

  const categoryCount = useMemo(() => new Set(rows.map((r) => r.category)).size, [rows]);

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-5 py-7 text-slate-900 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1320px]">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[1.6rem] border border-slate-200 bg-white px-5 py-4 shadow-[0_12px_35px_rgba(8,43,97,0.06)] sm:px-7">
          <div className="flex items-center gap-3">
            <Link href="/settings" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-black text-[#082b61] shadow-sm">←</Link>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">SAMS · Admin · Master Data</p>
              <h1 className="mt-1 text-xl font-black tracking-tight text-[#082b61]">Investigation Master</h1>
            </div>
          </div>
          <button onClick={() => { setEditing(null); setShowForm((v) => !v); }} className="rounded-xl bg-[#082b61] px-4 py-2.5 text-xs font-black text-white shadow-sm">{showForm ? "Close" : "+ Add Investigation"}</button>
        </header>

        <section className="mb-5 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#082b61] via-[#075dcc] to-[#0b63ce] p-7 text-white shadow-[0_25px_70px_rgba(8,43,97,0.18)] sm:p-9">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-200">Single source of truth</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h2 className="text-3xl font-black tracking-tight">Diagnostics & Investigation Master</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100">Admin-controlled catalogue for OPD advice, investigation billing, investigation room and reports. Update investigation names and rates here whenever your centre revises its charges.</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm">
              <p className="text-2xl font-black">{rows.length}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-100">Active matches</p>
            </div>
          </div>
        </section>

        {showForm && !editing && <CreateInvestigation onCreated={() => { setShowForm(false); load(); }} />}
        {editing && <EditInvestigation investigation={editing} onSaved={() => { setEditing(null); load(); }} onCancel={() => setEditing(null)} />}

        <section className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_15px_40px_rgba(8,43,97,0.06)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: CBC, vitamin D, MRI, ECG..." className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#0b63ce]" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none"><option value="">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            <button type="button" onClick={() => { setEditing(null); setShowForm(true); }} className="shrink-0 rounded-xl bg-[#0b63ce] px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-[#082b61]">+ Add Investigation</button>
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400"><span>{rows.length} results · {categoryCount} categories in current result</span>{error && <span className="text-red-600">{error}</span>}</div>
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-[1000px] text-left text-xs">
              <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Investigation</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Code</th><th className="px-4 py-3">Specimen</th><th className="px-4 py-3">Reference / Unit</th><th className="px-4 py-3 text-right">Rate</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => <tr key={row.id} className="hover:bg-slate-50"><td className="px-4 py-3"><p className="font-black text-[#082b61]">{row.name}</p><p className="mt-0.5 text-[10px] text-slate-400">{row.shortName || row.aliases || ""}</p></td><td className="px-4 py-3 font-semibold text-slate-600">{row.category}</td><td className="px-4 py-3 font-mono text-[10px] text-slate-500">{row.code}</td><td className="px-4 py-3 text-slate-500">{row.specimen || "—"}</td><td className="px-4 py-3 text-slate-500">{row.referenceRange || "—"}{row.unit ? ` · ${row.unit}` : ""}</td><td className="px-4 py-3 text-right font-black text-[#082b61]">₹{row.rate.toFixed(2)}</td><td className="px-4 py-3 text-right"><button onClick={() => { setShowForm(false); setEditing(row); }} className="rounded-lg border border-[#0b63ce]/20 bg-[#0b63ce]/5 px-3 py-1.5 text-[10px] font-black text-[#0b63ce] hover:bg-[#0b63ce] hover:text-white">Edit</button></td></tr>)}
                {!loading && rows.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">No active investigations found.</td></tr>}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[10px] font-semibold leading-5 text-slate-400">Rate changes apply to future investigation selections. Existing investigation orders and historical invoices retain the price that was charged at the time of billing.</p>
        </section>
      </div>
    </main>
  );
}

function CreateInvestigation({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState(""); const [category, setCategory] = useState(categories[0]); const [code, setCode] = useState(""); const [rate, setRate] = useState("0"); const [aliases, setAliases] = useState(""); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const save = async () => { setSaving(true); setError(""); try { const response = await fetch("/api/investigation-master", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, category, code, rate, aliases }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to save"); onCreated(); } catch (e) { setError(String(e)); } finally { setSaving(false); } };
  return <section className="mb-5 rounded-[1.7rem] border border-blue-100 bg-white p-5 shadow-[0_15px_40px_rgba(8,43,97,0.06)]"><div className="mb-4"><h3 className="text-sm font-black text-[#082b61]">Add Investigation</h3><p className="mt-1 text-[10px] font-semibold text-slate-400">Create a new master entry for future clinical and billing use.</p></div><div className="grid gap-3 md:grid-cols-4"><input value={name} onChange={e => setName(e.target.value)} placeholder="Investigation name" className="rounded-xl border border-slate-200 px-4 py-3 text-sm"/><select value={category} onChange={e => setCategory(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm">{categories.map(item => <option key={item}>{item}</option>)}</select><input value={code} onChange={e => setCode(e.target.value)} placeholder="Code (optional)" className="rounded-xl border border-slate-200 px-4 py-3 text-sm"/><input value={rate} onChange={e => setRate(e.target.value)} type="number" min="0" placeholder="Rate" className="rounded-xl border border-slate-200 px-4 py-3 text-sm"/><input value={aliases} onChange={e => setAliases(e.target.value)} placeholder="Search aliases, comma separated" className="rounded-xl border border-slate-200 px-4 py-3 text-sm md:col-span-3"/><button disabled={saving || !name.trim()} onClick={save} className="rounded-xl bg-[#0b63ce] px-4 py-3 text-sm font-black text-white disabled:opacity-50">{saving ? "Saving..." : "Save Investigation"}</button></div>{error && <p className="mt-3 text-xs font-semibold text-red-600">{error}</p>}</section>;
}

function EditInvestigation({ investigation, onSaved, onCancel }: { investigation: Investigation; onSaved: () => void; onCancel: () => void }) {
  const [name, setName] = useState(investigation.name); const [rate, setRate] = useState(String(investigation.rate)); const [category, setCategory] = useState(investigation.category); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const save = async () => { setSaving(true); setError(""); try { const response = await fetch("/api/investigation-master", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: investigation.id, name, rate, category }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to update investigation"); onSaved(); } catch (e) { setError(String(e)); } finally { setSaving(false); } };
  return <section className="mb-5 rounded-[1.7rem] border border-amber-200 bg-white p-5 shadow-[0_15px_40px_rgba(8,43,97,0.06)]"><div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div><p className="text-[9px] font-black uppercase tracking-widest text-amber-600">Admin edit</p><h3 className="mt-1 text-sm font-black text-[#082b61]">Update Investigation & Rate</h3></div><button onClick={onCancel} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-black text-slate-500">Cancel</button></div><div className="grid gap-3 md:grid-cols-4"><div className="rounded-xl bg-slate-50 px-4 py-3"><p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Code</p><p className="mt-1 font-mono text-xs font-bold text-slate-600">{investigation.code}</p></div><input value={name} onChange={e => setName(e.target.value)} placeholder="Investigation name" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"/><input value={rate} onChange={e => setRate(e.target.value)} type="number" min="0" placeholder="Rate" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"/><select value={category} onChange={e => setCategory(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold">{categories.map(item => <option key={item}>{item}</option>)}</select><button disabled={saving || !name.trim()} onClick={save} className="rounded-xl bg-[#082b61] px-4 py-3 text-sm font-black text-white disabled:opacity-50 md:col-span-4">{saving ? "Updating..." : "Save Changes"}</button></div>{error && <p className="mt-3 text-xs font-semibold text-red-600">{error}</p>}<p className="mt-3 text-[10px] font-semibold text-slate-400">This updates the master rate for future use. Existing billed investigation prices are not changed.</p></section>;
}
