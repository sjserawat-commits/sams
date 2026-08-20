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
  method: string | null;
  unit: string | null;
  referenceRange: string | null;
  maleReferenceRange: string | null;
  femaleReferenceRange: string | null;
  ageSpecificRange: string | null;
  criticalValue: string | null;
  aliases: string | null;
  rate: number;
  active: boolean;
};

const categories = ["Hematology", "Biochemistry", "Clinical Pathology", "Microbiology", "Immunology", "Serology", "Autoimmunity", "Endocrinology", "Vitamins & Nutrition", "Coagulation", "Histopathology", "Cytology", "Radiology", "Ultrasound", "CT", "MRI", "Cardiology", "Electrodiagnosis", "Neurophysiology", "Molecular Diagnostics", "Other Specialized"];

export default function InvestigationMasterPage() {
  const [rows, setRows] = useState<Investigation[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Investigation | null>(null);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (category) params.set("category", category);
      const response = await fetch(`/api/investigation-master?${params.toString()}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load investigation master");
      setRows(data);
    } catch (e) { setError(String(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { const timer = window.setTimeout(load, 200); return () => window.clearTimeout(timer); }, [q, category]);
  const categoryCount = useMemo(() => new Set(rows.map((r) => r.category)).size, [rows]);
  const missingReferences = useMemo(() => rows.filter((r) => !r.referenceRange?.trim()).length, [rows]);

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-5 py-7 text-slate-900 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1450px]">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[1.6rem] border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-7">
          <div className="flex items-center gap-3">
            <Link href="/settings" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-lg font-black text-[#082b61]">←</Link>
            <div><p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">SAMS · Admin · Master Data</p><h1 className="mt-1 text-xl font-black text-[#082b61]">Investigation Master</h1></div>
          </div>
          <button onClick={load} className="rounded-xl bg-[#082b61] px-4 py-2.5 text-xs font-black text-white">↻ Refresh Master</button>
        </header>

        <section className="mb-5 rounded-[2rem] bg-gradient-to-br from-[#082b61] via-[#075dcc] to-[#0b63ce] p-7 text-white shadow-xl sm:p-9">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-200">Single source of truth</p>
          <h2 className="mt-3 text-3xl font-black">Diagnostics & Investigation Master</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-blue-100">Admin-controlled catalogue for clinical advice, billing, laboratory workflow and reports. Biological/reference values are maintained here and displayed in the Lab Room and investigation reports.</p>
          <div className="mt-5 flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-widest">
            <span className="rounded-xl bg-white/10 px-4 py-3">{rows.length} active matches</span>
            <span className="rounded-xl bg-white/10 px-4 py-3">{categoryCount} categories</span>
            <span className={`rounded-xl px-4 py-3 ${missingReferences ? "bg-amber-300 text-[#082b61]" : "bg-emerald-400 text-[#082b61]"}`}>{missingReferences ? `${missingReferences} missing reference values` : "All displayed investigations configured"}</span>
          </div>
        </section>

        <section className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search investigation, code or alias…" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#0b63ce]" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none"><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400"><span>{rows.length} results · {categoryCount} categories</span>{error && <span className="text-red-600">{error}</span>}</div>
          <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-semibold text-[#082b61]">Need to change an investigation name or rate? Use <strong>Edit Master</strong> in the Action column. The Action column stays visible while the table is scrolled.</div>
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-[1180px] text-left text-xs">
              <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Investigation</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Specimen / Method</th><th className="px-4 py-3">Biological / Reference Value</th><th className="px-4 py-3">Unit</th><th className="px-4 py-3 text-right">Rate</th><th className="sticky right-0 z-20 border-l border-slate-200 bg-slate-50 px-4 py-3 text-right">Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3"><p className="font-black text-[#082b61]">{row.name}</p><p className="mt-0.5 font-mono text-[9px] text-slate-400">{row.code} {row.shortName ? `· ${row.shortName}` : ""}</p><button onClick={() => setEditing(row)} className="mt-2 rounded-lg border border-[#0b63ce]/20 bg-[#0b63ce]/5 px-2.5 py-1 text-[9px] font-black text-[#0b63ce] sm:hidden">Edit name / rate</button></td>
                  <td className="px-4 py-3 font-semibold text-slate-600">{row.category}</td>
                  <td className="px-4 py-3 text-slate-500">{row.specimen || "—"}{row.method ? ` · ${row.method}` : ""}</td>
                  <td className="max-w-[360px] px-4 py-3 font-semibold text-slate-600">{row.referenceRange || "Not configured"}</td>
                  <td className="px-4 py-3 text-slate-500">{row.unit || "—"}</td>
                  <td className="px-4 py-3 text-right font-black text-[#082b61]">₹{row.rate.toFixed(2)}</td>
                  <td className="sticky right-0 z-10 border-l border-slate-100 bg-white px-4 py-3 text-right shadow-[-8px_0_12px_-12px_rgba(15,23,42,.35)]"><button onClick={() => setEditing(row)} className="whitespace-nowrap rounded-lg bg-[#082b61] px-3 py-2 text-[10px] font-black text-white shadow-sm hover:bg-[#0b63ce]">Edit Master</button></td>
                </tr>)}
                {!loading && rows.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">No active investigations found.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        {editing && <EditInvestigation investigation={editing} onSaved={() => { setEditing(null); load(); }} onCancel={() => setEditing(null)} />}
      </div>
    </main>
  );
}

function EditInvestigation({ investigation, onSaved, onCancel }: { investigation: Investigation; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: investigation.name,
    category: investigation.category,
    specimen: investigation.specimen || "",
    method: investigation.method || "",
    unit: investigation.unit || "",
    referenceRange: investigation.referenceRange || "",
    maleReferenceRange: investigation.maleReferenceRange || "",
    femaleReferenceRange: investigation.femaleReferenceRange || "",
    ageSpecificRange: investigation.ageSpecificRange || "",
    criticalValue: investigation.criticalValue || "",
    rate: String(investigation.rate),
  });
  const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const set = (key: keyof typeof form, value: string) => setForm((v) => ({ ...v, [key]: value }));
  const save = async () => {
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/investigation-master", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: investigation.id, ...form }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update investigation master");
      onSaved();
      alert(data.message || "Investigation Master change submitted.");
    } catch (e) { setError(String(e)); }
    finally { setSaving(false); }
  };
  return <section className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 sm:p-8">
    <div className="mx-auto max-w-5xl rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8">
      <div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-widest text-[#0b63ce]">Admin master data</p><h2 className="mt-1 text-2xl font-black text-[#082b61]">Edit Investigation</h2><p className="mt-1 text-xs font-semibold text-slate-400">{investigation.name} · Code: {investigation.code}</p></div><button onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black">Close</button></div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="field">Investigation Name<input value={form.name} onChange={e => set("name", e.target.value)} /></label>
        <label className="field">Category<select value={form.category} onChange={e => set("category", e.target.value)}>{categories.map(x => <option key={x}>{x}</option>)}</select></label>
        <label className="field">Specimen<input value={form.specimen} onChange={e => set("specimen", e.target.value)} placeholder="e.g. Serum" /></label>
        <label className="field">Method<input value={form.method} onChange={e => set("method", e.target.value)} placeholder="e.g. Immunoassay" /></label>
        <label className="field">Unit<input value={form.unit} onChange={e => set("unit", e.target.value)} placeholder="e.g. mg/dL" /></label>
        <label className="field">Rate (₹)<input type="number" min="0" value={form.rate} onChange={e => set("rate", e.target.value)} /></label>
        <label className="field md:col-span-2">Biological / Reference Value<textarea rows={3} value={form.referenceRange} onChange={e => set("referenceRange", e.target.value)} placeholder="Enter validated reference interval / normal state" /></label>
        <label className="field">Male Reference Range<textarea rows={2} value={form.maleReferenceRange} onChange={e => set("maleReferenceRange", e.target.value)} /></label>
        <label className="field">Female Reference Range<textarea rows={2} value={form.femaleReferenceRange} onChange={e => set("femaleReferenceRange", e.target.value)} /></label>
        <label className="field">Age-specific Reference Range<textarea rows={2} value={form.ageSpecificRange} onChange={e => set("ageSpecificRange", e.target.value)} /></label>
        <label className="field">Critical Value<textarea rows={2} value={form.criticalValue} onChange={e => set("criticalValue", e.target.value)} /></label>
      </div>
      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}
      <div className="mt-6 flex justify-end gap-3"><button onClick={onCancel} className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-black">Cancel</button><button disabled={saving} onClick={save} className="rounded-xl bg-[#082b61] px-6 py-3 text-xs font-black text-white disabled:opacity-50">{saving ? "Submitting…" : "Save & Submit for Approval"}</button></div>
      <p className="mt-4 text-[10px] leading-5 text-slate-400">Changes to Investigation Master are submitted to the administrator approval queue before they become live, so billing and reports cannot be changed accidentally.</p>
    </div>
    <style jsx>{`.field{display:flex;flex-direction:column;gap:.45rem;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;color:#64748b}.field input,.field select,.field textarea{border:1px solid #dbe2ea;border-radius:.8rem;padding:.75rem 1rem;background:#fff;color:#0f172a;font-size:.875rem;font-weight:600;text-transform:none;letter-spacing:normal;outline:none}.field input:focus,.field select:focus,.field textarea:focus{border-color:#0b63ce;box-shadow:0 0 0 3px #0b63ce12}`}</style>
  </section>;
}
