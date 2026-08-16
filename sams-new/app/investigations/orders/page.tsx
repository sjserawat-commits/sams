"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Investigation = { id: number; code: string; name: string; category: string; department?: string | null; rate: number; specimen?: string | null };
type Mode = "REGISTERED" | "WALKIN" | "EXTERNAL_REFERRAL";

export default function InvestigationOrdersPage() {
  const search = useSearchParams();
  const [mode, setMode] = useState<Mode>("REGISTERED");
  const [patientId, setPatientId] = useState(search.get("patientId") || "");
  const [visitId, setVisitId] = useState(search.get("opdVisitId") || "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [investigationInput, setInvestigationInput] = useState("");
  const [suggestions, setSuggestions] = useState<Investigation[]>([]);
  const [selected, setSelected] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const q = investigationInput.trim();
    if (!q) { setSuggestions([]); return; }
    const timer = window.setTimeout(async () => {
      setSearching(true); setError("");
      try {
        const response = await fetch(`/api/investigation-master?q=${encodeURIComponent(q)}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to search Investigation Master.");
        const rows: Investigation[] = await response.json();
        const ids = new Set(selected.map(x => x.id));
        setSuggestions(rows.filter(x => !ids.has(x.id)).slice(0, 12));
      } catch (e) { setError(e instanceof Error ? e.message : "Unable to search investigations."); }
      finally { setSearching(false); }
    }, 220);
    return () => window.clearTimeout(timer);
  }, [investigationInput, selected]);

  function add(item: Investigation) { setSelected(v => [...v, item]); setInvestigationInput(""); setSuggestions([]); }
  function remove(id: number) { setSelected(v => v.filter(x => x.id !== id)); }

  async function placeOrder() {
    setLoading(true); setError(""); setMessage("");
    try {
      if (mode === "REGISTERED" && !patientId.trim()) throw new Error("Enter the registered Patient ID.");
      if (mode !== "REGISTERED" && !firstName.trim()) throw new Error("Enter patient name.");
      if (!selected.length) throw new Error("Select at least one investigation.");
      const response = await fetch("/api/investigation-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceType: mode, patientId: patientId.trim() || undefined, opdVisitId: visitId ? Number(visitId) : undefined, firstName, lastName, phone, gender, investigations: selected.map(x => ({ id: x.id })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to place investigation order.");
      setMessage(`${data.message} Bill: ${data.bill?.billNumber || "created"}. Patient: ${data.visit?.patientId || "created"}.`);
      if (mode !== "REGISTERED") setPatientId(data.visit?.patientId || "");
      setVisitId(String(data.visit?.id || ""));
      setSelected([]);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to place investigation order."); }
    finally { setLoading(false); }
  }

  const total = selected.reduce((sum, x) => sum + Number(x.rate || 0), 0);

  return (
    <main className="min-h-screen bg-[#eef2f7] text-slate-900">
      <header className="border-b border-[#d7c08a]/30 bg-[#071f46] px-5 py-5 text-white shadow-lg sm:px-8">
        <div className="mx-auto max-w-6xl"><p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#f1d27a]">SAMS · Diagnostics</p><h1 className="mt-1 text-2xl font-black">Investigation Orders</h1><p className="mt-1 text-xs text-blue-100">One central order → billing → laboratory / radiology queue → report.</p></div>
      </header>
      <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0b63ce]">Order source</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {(["REGISTERED", "WALKIN", "EXTERNAL_REFERRAL"] as Mode[]).map(item => <button key={item} type="button" onClick={() => setMode(item)} className={`rounded-2xl border px-4 py-3 text-left text-xs font-black ${mode === item ? "border-[#0b63ce] bg-blue-50 text-[#082b61]" : "border-slate-200 bg-white text-slate-500"}`}>{item === "REGISTERED" ? "Registered Patient" : item === "WALKIN" ? "Walk-in Patient" : "External Referral"}<span className="mt-1 block text-[10px] font-medium text-slate-400">{item === "REGISTERED" ? "Existing patient / visit" : item === "WALKIN" ? "No prior registration required" : "Outside prescription / referral"}</span></button>)}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs font-bold text-slate-600">Patient ID<input value={patientId} onChange={e => setPatientId(e.target.value)} placeholder={mode === "REGISTERED" ? "e.g. SAMS-0001" : "Created automatically"} disabled={mode !== "REGISTERED"} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm disabled:bg-slate-50" /></label>
            <label className="text-xs font-bold text-slate-600">Visit ID (optional)<input value={visitId} onChange={e => setVisitId(e.target.value)} placeholder="Existing visit" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /></label>
            {mode !== "REGISTERED" && <><label className="text-xs font-bold text-slate-600">First name<input value={firstName} onChange={e => setFirstName(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Last name<input value={lastName} onChange={e => setLastName(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /></label></>}
          </div>
          {mode !== "REGISTERED" && <div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold text-slate-600">Mobile<input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Sex<select value={gender} onChange={e => setGender(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></label></div>}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0b63ce]">Investigation advice / order</p>
          <div className="relative mt-3"><input value={investigationInput} onChange={e => setInvestigationInput(e.target.value)} placeholder="Search investigation by name or code…" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0b63ce]" />{suggestions.length > 0 && <div className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">{suggestions.map(item => <button key={item.id} type="button" onClick={() => add(item)} className="block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-blue-50"><span className="font-bold text-[#082b61]">{item.name}</span><span className="ml-2 text-[10px] text-slate-400">{item.code} · {item.category}</span></button>)}</div>}</div>
          {searching && <p className="mt-2 text-[10px] font-bold text-slate-400">Searching…</p>}
          <div className="mt-4 space-y-2">{selected.map(item => <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><div><p className="text-sm font-bold text-[#082b61]">{item.name}</p><p className="text-[10px] text-slate-400">{item.code} · {item.category}</p></div><div className="flex items-center gap-4"><span className="text-sm font-black text-slate-700">₹{Number(item.rate || 0).toFixed(2)}</span><button type="button" onClick={() => remove(item.id)} className="text-xs font-black text-red-500">Remove</button></div></div>)}</div>
          {selected.length > 0 && <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4"><div><p className="text-[10px] font-black uppercase text-slate-400">Billing total</p><p className="text-2xl font-black text-[#082b61]">₹{total.toFixed(2)}</p></div><button type="button" disabled={loading} onClick={placeOrder} className="rounded-2xl bg-[#082b61] px-6 py-3 text-xs font-black text-white shadow-lg disabled:opacity-50">{loading ? "Placing…" : "Place Order → Send to Lab & Bill"}</button></div>}
        </section>

        {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">{message}</div>}
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}
        <p className="text-[10px] font-medium text-slate-400">Clinical advice does not persist pricing. Rates are applied when the central order is converted into billing.</p>
      </div>
    </main>
  );
}
