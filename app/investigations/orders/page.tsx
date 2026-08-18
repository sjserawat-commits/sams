"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Investigation = { id: number; code: string; name: string; category: string; department?: string | null; rate: number; specimen?: string | null };
type Patient = { id: number; patientId: string; firstName: string; lastName?: string | null; phone?: string | null; gender?: string | null };
type Mode = "REGISTERED" | "WALKIN" | "EXTERNAL_REFERRAL";

function InvestigationOrdersContent() {
  const search = useSearchParams();
  const [mode, setMode] = useState<Mode>("REGISTERED");
  const [patientId, setPatientId] = useState(search.get("patientId") || "");
  const [visitId, setVisitId] = useState(search.get("opdVisitId") || "");
  const [patientSearch, setPatientSearch] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientLoading, setPatientLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [investigationInput, setInvestigationInput] = useState("");
  const [category, setCategory] = useState("ALL");
  const [catalogue, setCatalogue] = useState<Investigation[]>([]);
  const [suggestions, setSuggestions] = useState<Investigation[]>([]);
  const [selected, setSelected] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(false);
  const [catalogueLoading, setCatalogueLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPatients() {
      setPatientLoading(true);
      try {
        const response = await fetch("/api/patients", { cache: "no-store" });
        const rows = await response.json();
        setPatients(Array.isArray(rows) ? rows : []);
      } catch {
        setPatients([]);
      } finally {
        setPatientLoading(false);
      }
    }
    if (mode === "REGISTERED") void loadPatients();
  }, [mode]);

  useEffect(() => {
    if (!patientId || !patients.length) return;
    const found = patients.find((p) => p.patientId === patientId);
    if (found) setSelectedPatient(found);
  }, [patientId, patients]);

  useEffect(() => {
    async function loadCatalogue() {
      setCatalogueLoading(true);
      try {
        const response = await fetch("/api/investigation-master", { cache: "no-store" });
        const rows: Investigation[] = await response.json();
        if (!response.ok) throw new Error("Unable to load Investigation Master.");
        setCatalogue(Array.isArray(rows) ? rows : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load Investigation Master.");
      } finally {
        setCatalogueLoading(false);
      }
    }
    void loadCatalogue();
  }, []);

  const patientOptions = useMemo(() => {
    const q = patientSearch.trim().toLowerCase();
    if (!q) return patients.slice(0, 12);
    return patients.filter((p) => `${p.patientId} ${p.firstName} ${p.lastName || ""} ${p.phone || ""}`.toLowerCase().includes(q)).slice(0, 20);
  }, [patients, patientSearch]);

  const categories = useMemo(() => Array.from(new Set(catalogue.map((x) => x.category).filter(Boolean))).sort(), [catalogue]);
  const visibleOptions = useMemo(() => {
    const q = investigationInput.trim().toLowerCase();
    const ids = new Set(selected.map((x) => x.id));
    return catalogue.filter((x) => !ids.has(x.id)).filter((x) => category === "ALL" || x.category === category).filter((x) => !q || `${x.name} ${x.code} ${x.category} ${x.department || ""}`.toLowerCase().includes(q)).slice(0, 40);
  }, [catalogue, selected, category, investigationInput]);

  function choosePatient(patient: Patient) {
    setSelectedPatient(patient);
    setPatientId(patient.patientId);
    setPatientSearch("");
  }

  function add(item: Investigation) { setSelected((v) => [...v, item]); setInvestigationInput(""); setSuggestions([]); }
  function remove(id: number) { setSelected((v) => v.filter((x) => x.id !== id)); }

  useEffect(() => setSuggestions(visibleOptions), [visibleOptions]);

  async function placeOrder() {
    setLoading(true); setError(""); setMessage("");
    try {
      if (mode === "REGISTERED" && !selectedPatient) throw new Error("Select the registered patient for whom the investigation is being ordered.");
      if (mode !== "REGISTERED" && !firstName.trim()) throw new Error("Enter the walk-in / external patient name.");
      if (!selected.length) throw new Error("Select at least one investigation.");
      const response = await fetch("/api/investigation-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceType: mode, patientId: mode === "REGISTERED" ? patientId.trim() : undefined, opdVisitId: visitId ? Number(visitId) : undefined, firstName, lastName, phone, gender, investigations: selected.map((x) => ({ id: x.id })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to place investigation order.");
      setMessage(`Order placed for ${data.visit?.name || selectedPatient?.firstName || "patient"}. Bill ${data.bill?.billNumber || "created"} is pending payment/approval for sampling.`);
      setPatientId(data.visit?.patientId || patientId);
      setVisitId(String(data.visit?.id || visitId));
      setSelected([]);
      if (mode !== "REGISTERED") { setFirstName(""); setLastName(""); setPhone(""); setGender(""); }
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to place investigation order."); }
    finally { setLoading(false); }
  }

  const total = selected.reduce((sum, x) => sum + Number(x.rate || 0), 0);

  return (
    <main className="min-h-screen bg-[#eef2f7] text-slate-900">
      <header className="border-b border-[#d7c08a]/30 bg-[#071f46] px-5 py-5 text-white shadow-lg sm:px-8">
        <div className="mx-auto max-w-6xl"><p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#f1d27a]">SAMS · Diagnostics</p><h1 className="mt-1 text-2xl font-black">Place Investigation Order</h1><p className="mt-1 text-xs text-blue-100">Select the patient, choose investigations from the central master and generate the investigation bill.</p></div>
      </header>
      <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0b63ce]">1 · Patient & order source</p><p className="mt-1 text-xs text-slate-400">Investigation orders can be placed for registered, walk-in or external-referral patients.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">Billing required before sampling</span></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {(["REGISTERED", "WALKIN", "EXTERNAL_REFERRAL"] as Mode[]).map((item) => <button key={item} type="button" onClick={() => { setMode(item); setSelectedPatient(null); setPatientSearch(""); }} className={`rounded-2xl border px-4 py-3 text-left text-xs font-black ${mode === item ? "border-[#0b63ce] bg-blue-50 text-[#082b61]" : "border-slate-200 bg-white text-slate-500"}`}>{item === "REGISTERED" ? "Registered Patient" : item === "WALKIN" ? "Walk-in Patient" : "External Referral"}<span className="mt-1 block text-[10px] font-medium text-slate-400">{item === "REGISTERED" ? "Search and select an existing patient" : item === "WALKIN" ? "Create a temporary diagnostic patient" : "Outside prescription / referral"}</span></button>)}
          </div>

          {mode === "REGISTERED" ? <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {selectedPatient ? <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Selected patient</p><p className="mt-1 text-base font-black text-[#082b61]">{selectedPatient.firstName} {selectedPatient.lastName || ""}</p><p className="mt-1 text-xs font-semibold text-slate-500">{selectedPatient.patientId} {selectedPatient.phone ? `· ${selectedPatient.phone}` : ""} {selectedPatient.gender ? `· ${selectedPatient.gender}` : ""}</p></div><button type="button" onClick={() => { setSelectedPatient(null); setPatientId(""); }} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-[#082b61]">Change Patient</button></div> : <><label className="text-xs font-bold text-slate-600">Search registered patient<input autoFocus value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} placeholder="Search name, Patient ID or mobile…" className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0b63ce]" /></label>{patientLoading ? <p className="mt-3 text-xs text-slate-400">Loading patient records…</p> : <div className="mt-3 grid gap-2 sm:grid-cols-2">{patientOptions.map((patient) => <button key={patient.id} type="button" onClick={() => choosePatient(patient)} className="rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-[#0b63ce] hover:bg-blue-50"><p className="text-sm font-black text-[#082b61]">{patient.firstName} {patient.lastName || ""}</p><p className="mt-1 text-[10px] font-semibold text-slate-400">{patient.patientId} {patient.phone ? `· ${patient.phone}` : ""}</p></button>)}{patientOptions.length === 0 && <p className="col-span-full py-4 text-center text-xs text-slate-400">No registered patient found.</p>}</div>}</>}
            <input type="hidden" value={patientId} readOnly />
          </div> : <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="text-xs font-bold text-slate-600">First name *<input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Patient first name" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Last name<input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Optional" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Mobile<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile number" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Sex<select value={gender} onChange={(e) => setGender(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></label></div>}
          <div className="mt-3"><label className="text-xs font-bold text-slate-600">Existing Visit ID <span className="font-normal text-slate-400">(optional — use when this order belongs to an existing OPD Visit)</span><input value={visitId} onChange={(e) => setVisitId(e.target.value)} placeholder="e.g. 123" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm sm:max-w-xs" /></label></div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0b63ce]">2 · Investigation selection</p>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><label className="flex-1 text-xs font-bold text-slate-600">Search investigation<input value={investigationInput} onChange={(e) => setInvestigationInput(e.target.value)} placeholder="Search investigation by name, code or category…" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0b63ce]" /></label><label className="text-xs font-bold text-slate-600 lg:w-72">Category<select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"><option value="ALL">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label></div>
          {catalogueLoading ? <p className="mt-4 text-xs font-semibold text-slate-400">Loading Investigation Master…</p> : <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-3"><div className="mb-2 flex items-center justify-between"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available investigations</p><p className="text-[10px] font-bold text-slate-400">{visibleOptions.length} shown · {catalogue.length} active total</p></div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{visibleOptions.slice(0, 12).map((item) => <button key={item.id} type="button" onClick={() => add(item)} className="rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-[#0b63ce] hover:shadow-sm"><p className="text-xs font-black text-[#082b61]">{item.name}</p><p className="mt-1 text-[10px] text-slate-400">{item.code} · {item.category}</p><p className="mt-2 text-xs font-black text-slate-700">₹{Number(item.rate || 0).toFixed(2)}</p></button>)}</div>{visibleOptions.length === 0 && <p className="py-5 text-center text-xs font-semibold text-slate-400">No active investigations match this category/search.</p>}</div>}

          {selected.length > 0 && <div className="mt-5 space-y-2">{selected.map((item) => <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"><div><p className="text-sm font-bold text-[#082b61]">{item.name}</p><p className="text-[10px] text-slate-400">{item.code} · {item.category}</p></div><div className="flex items-center gap-4"><span className="text-sm font-black text-slate-700">₹{Number(item.rate || 0).toFixed(2)}</span><button type="button" onClick={() => remove(item.id)} className="text-xs font-black text-red-500">Remove</button></div></div>)}</div>}
          {selected.length > 0 && <div className="mt-5 flex flex-col gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black uppercase text-slate-400">Billing total</p><p className="text-2xl font-black text-[#082b61]">₹{total.toFixed(2)}</p></div><button type="button" disabled={loading || (mode === "REGISTERED" && !selectedPatient)} onClick={placeOrder} className="rounded-2xl bg-[#082b61] px-6 py-3 text-xs font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-40">{loading ? "Placing…" : "Place Order → Generate Bill"}</button></div>}
        </section>

        {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">{message}</div>}
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}
      </div>
    </main>
  );
}

export default function InvestigationOrdersPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#eef2f7] p-8 text-slate-600">Loading Investigation Orders…</main>}><InvestigationOrdersContent /></Suspense>;
}
