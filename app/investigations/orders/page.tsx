"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Patient = {
  id: number;
  patientId: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  gender?: string | null;
};
type Investigation = {
  id: number;
  code: string;
  name: string;
  category: string;
  department?: string | null;
  rate: number;
  specimen?: string | null;
};
type Mode = "REGISTERED" | "CONSULTATION" | "WALKIN" | "EXTERNAL_REFERRAL";
type ConsultationVisit = {
  id: number;
  tokenNumber: number;
  visitType: string;
  status: string;
  patient: Patient;
  department?: { id: number; name: string; code: string } | null;
  doctor?: { id: number; name: string } | null;
  appointment?: { appointmentNo: string; appointmentTime: string; source: string } | null;
  consultation?: { id: number; hasNotes: boolean } | null;
  existingInvestigations: { id: number; investigation: string; status: string; paymentStatus: string }[];
};

const patientName = (p: Patient) => `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Patient";

function InvestigationOrdersContent() {
  const search = useSearchParams();
  const [mode, setMode] = useState<Mode>(search.get("opdVisitId") ? "CONSULTATION" : "REGISTERED");
  const [patientId, setPatientId] = useState(search.get("patientId") || "");
  const [visitId, setVisitId] = useState(search.get("opdVisitId") || "");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientLoading, setPatientLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [catalogue, setCatalogue] = useState<Investigation[]>([]);
  const [catalogueLoading, setCatalogueLoading] = useState(true);
  const [investigationInput, setInvestigationInput] = useState("");
  const [category, setCategory] = useState("ALL");
  const [selected, setSelected] = useState<Investigation[]>([]);
  const [consultationVisits, setConsultationVisits] = useState<ConsultationVisit[]>([]);
  const [consultationLoading, setConsultationLoading] = useState(false);
  const [consultationSearch, setConsultationSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [billingHandoff, setBillingHandoff] = useState<{ patientId: string; visitId: number; billNumber: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/patients", { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])),
      fetch("/api/investigation-master", { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([p, i]) => {
        setPatients(Array.isArray(p) ? p : []);
        setCatalogue(Array.isArray(i) ? i : []);
      })
      .catch(() => setError("Unable to load patient or Investigation Master data."))
      .finally(() => {
        setPatientLoading(false);
        setCatalogueLoading(false);
      });
  }, []);

  useEffect(() => {
    if (patientId && patients.length) setSelectedPatient(patients.find((p) => p.patientId === patientId) || null);
  }, [patientId, patients]);

  async function loadConsultationVisits() {
    setConsultationLoading(true);
    setError("");
    try {
      const response = await fetch("/api/investigation-orders/consultations", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to load Consultation / Visit list.");
      setConsultationVisits(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load Consultation / Visit list.");
      setConsultationVisits([]);
    } finally {
      setConsultationLoading(false);
    }
  }

  useEffect(() => { if (mode === "CONSULTATION") void loadConsultationVisits(); }, [mode]);

  const patientOptions = useMemo(() => {
    const q = patientSearch.trim().toLowerCase();
    if (!q) return patients.slice(0, 12);
    return patients.filter((p) => `${patientName(p)} ${p.patientId} ${p.phone || ""}`.toLowerCase().includes(q)).slice(0, 20);
  }, [patients, patientSearch]);

  const consultationOptions = useMemo(() => {
    const q = consultationSearch.trim().toLowerCase();
    if (!q) return consultationVisits;
    return consultationVisits.filter((v) => `${patientName(v.patient)} ${v.patient.patientId} ${v.patient.phone || ""} ${v.tokenNumber} ${v.doctor?.name || ""} ${v.department?.name || ""}`.toLowerCase().includes(q));
  }, [consultationVisits, consultationSearch]);

  const categories = useMemo(() => Array.from(new Set(catalogue.map((x) => x.category).filter(Boolean))).sort(), [catalogue]);
  const visibleOptions = useMemo(() => {
    const q = investigationInput.trim().toLowerCase();
    const ids = new Set(selected.map((x) => x.id));
    return catalogue.filter((x) => !ids.has(x.id)).filter((x) => category === "ALL" || x.category === category).filter((x) => !q || `${x.name} ${x.code} ${x.category} ${x.department || ""}`.toLowerCase().includes(q)).slice(0, 40);
  }, [catalogue, selected, category, investigationInput]);

  function choosePatient(p: Patient) { setSelectedPatient(p); setPatientId(p.patientId); setPatientSearch(""); }
  function chooseConsultation(v: ConsultationVisit) { setVisitId(String(v.id)); setSelectedPatient(v.patient); setPatientId(v.patient.patientId); setMessage(""); setError(""); setBillingHandoff(null); }
  function add(item: Investigation) { setSelected((v) => [...v, item]); setMessage(""); setBillingHandoff(null); }
  function remove(id: number) { setSelected((v) => v.filter((x) => x.id !== id)); }

  async function placeOrder() {
    setLoading(true); setError(""); setMessage(""); setBillingHandoff(null);
    try {
      if (mode === "REGISTERED" && !selectedPatient) throw new Error("Select the registered patient for whom the investigation is being ordered.");
      if (mode === "CONSULTATION" && (!visitId || Number(visitId) <= 0)) throw new Error("Select a patient from today's Consultation / Visit list.");
      if ((mode === "WALKIN" || mode === "EXTERNAL_REFERRAL") && !firstName.trim()) throw new Error("Enter the patient name.");
      if (!selected.length) throw new Error("Select at least one investigation.");

      const response = await fetch("/api/investigation-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceType: mode, patientId: selectedPatient?.patientId || undefined, opdVisitId: visitId ? Number(visitId) : undefined, firstName, lastName, phone, gender, investigations: selected.map((x) => ({ id: x.id })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to place investigation order.");
      const resolvedPatientId = data.visit?.patientId || patientId;
      const resolvedVisitId = Number(data.visit?.id || visitId);
      setMessage(`Investigation bill ${data.bill?.billNumber || "created"} generated for ${data.visit?.name || patientName(selectedPatient as Patient)}. Bill status: PENDING.`);
      setPatientId(resolvedPatientId);
      setVisitId(String(resolvedVisitId));
      setBillingHandoff({ patientId: resolvedPatientId, visitId: resolvedVisitId, billNumber: data.bill?.billNumber || "Generated" });
      setSelected([]);
      if (mode === "CONSULTATION") await loadConsultationVisits();
      if (mode !== "REGISTERED" && mode !== "CONSULTATION") { setFirstName(""); setLastName(""); setPhone(""); setGender(""); }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to place investigation order.");
    } finally { setLoading(false); }
  }

  const total = selected.reduce((sum, x) => sum + Number(x.rate || 0), 0);

  return (
    <main className="min-h-screen bg-[#eef2f7] text-slate-900">
      <header className="border-b border-[#d7c08a]/30 bg-[#071f46] px-5 py-5 text-white shadow-lg sm:px-8"><div className="mx-auto max-w-6xl"><p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#f1d27a]">SAMS · Diagnostics</p><h1 className="mt-1 text-2xl font-black">Place Investigation Order</h1><p className="mt-1 text-xs text-blue-100">One central workflow for Consultation / Visit, registered, walk-in and external-referral patients.</p></div></header>
      <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0b63ce]">1 · Patient & order source</p><p className="mt-1 text-xs text-slate-400">For Consultation / Visit, select the patient directly from today's live OPD list. No physical slip or manual Visit ID is required.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">Billing gate before sampling</span></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{(["REGISTERED","CONSULTATION","WALKIN","EXTERNAL_REFERRAL"] as Mode[]).map((item)=><button key={item} type="button" onClick={()=>{setMode(item);setError("");setMessage("");setBillingHandoff(null)}} className={`rounded-2xl border px-4 py-3 text-left text-xs font-black ${mode===item?"border-[#0b63ce] bg-blue-50 text-[#082b61]":"border-slate-200 bg-white text-slate-500"}`}>{item==="REGISTERED"?"Registered Patient":item==="CONSULTATION"?"Consultation / Visit":item==="WALKIN"?"Walk-in / Outsider":"External Referral"}<span className="mt-1 block text-[10px] font-medium text-slate-400">{item==="REGISTERED"?"Search and select existing patient":item==="CONSULTATION"?"Today's complete OPD Visit list":item==="WALKIN"?"No prior registration required":"Outside prescription / referral"}</span></button>)}</div>
          {mode === "CONSULTATION" && <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#082b61]">Today's Consultation / Visit list</p><p className="mt-1 text-xs text-slate-500">The Visit is created when the patient enters OPD. The physical OPD slip can be printed later after consultation; it is not required here.</p></div><button type="button" onClick={loadConsultationVisits} disabled={consultationLoading} className="rounded-xl bg-[#082b61] px-4 py-2.5 text-xs font-black text-white disabled:opacity-50">{consultationLoading?"Refreshing…":"Refresh List"}</button></div><input value={consultationSearch} onChange={e=>setConsultationSearch(e.target.value)} placeholder="Search patient, Patient ID, token, doctor or department…" className="mt-4 w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm"/>{consultationLoading?<div className="mt-4 rounded-xl bg-white p-6 text-center text-sm font-semibold text-slate-500">Loading today's Consultation / Visit list…</div>:consultationOptions.length===0?<div className="mt-4 rounded-xl bg-white p-6 text-center text-sm font-semibold text-slate-500">No Consultation / Visit found for today.</div>:<div className="mt-4 grid gap-3 lg:grid-cols-2">{consultationOptions.map(v=>{const selectedVisit=visitId===String(v.id);return <button key={v.id} type="button" onClick={()=>chooseConsultation(v)} className={`rounded-2xl border p-4 text-left transition ${selectedVisit?"border-[#0b63ce] bg-white ring-2 ring-blue-100":"border-blue-100 bg-white hover:border-[#0b63ce]"}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-black text-[#082b61]">{patientName(v.patient)}</p><span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase ${v.status==="COMPLETED"?"bg-emerald-50 text-emerald-700":v.status==="IN_CONSULTATION"?"bg-blue-100 text-blue-700":"bg-amber-50 text-amber-700"}`}>{v.status.replaceAll("_"," ")}</span></div><p className="mt-1 text-[10px] font-bold text-slate-400">HID · {v.patient.patientId} · Token #{v.tokenNumber}</p><p className="mt-1 text-[10px] font-semibold text-slate-500">{v.department?.name||"OPD"}{v.doctor?` · ${v.doctor.name}`:""}{v.appointment?` · ${v.appointment.appointmentTime}`:""}</p></div><span className="shrink-0 rounded-xl bg-[#082b61] px-3 py-2 text-[10px] font-black text-[#f2d38b]">VISIT #{v.id}</span></div><div className="mt-3 flex flex-wrap gap-2 text-[9px] font-bold text-slate-500"><span className="rounded-full bg-slate-100 px-2 py-1">{v.consultation?"Consultation record available":"Consultation record pending"}</span>{v.existingInvestigations.length>0&&<span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">{v.existingInvestigations.length} investigation already ordered</span>}</div></button>})}</div>}{selectedPatient&&visitId&&<div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm"><p className="text-[9px] font-black uppercase tracking-widest text-emerald-700">Selected Consultation / Visit</p><p className="mt-1 font-black text-[#082b61]">{patientName(selectedPatient)} · {selectedPatient.patientId}</p><p className="mt-1 text-xs font-semibold text-emerald-800">Visit selected internally. No physical slip or manual Visit ID entry is required.</p></div>}</div>}
          {mode === "REGISTERED" && <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">{selectedPatient?<div className="flex items-center justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Selected patient</p><p className="mt-1 text-base font-black text-[#082b61]">{patientName(selectedPatient)}</p><p className="mt-1 text-xs font-semibold text-slate-500">{selectedPatient.patientId} {selectedPatient.phone?`· ${selectedPatient.phone}`:""}</p></div><button type="button" onClick={()=>{setSelectedPatient(null);setPatientId("")}} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black">Change Patient</button></div>:<><label className="text-xs font-bold text-slate-600">Search registered patient<input value={patientSearch} onChange={e=>setPatientSearch(e.target.value)} placeholder="Name, Patient ID or mobile…" className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"/></label>{patientLoading?<p className="mt-3 text-xs text-slate-400">Loading patient records…</p>:<div className="mt-3 grid gap-2 sm:grid-cols-2">{patientOptions.map(p=><button key={p.id} type="button" onClick={()=>choosePatient(p)} className="rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-[#0b63ce] hover:bg-blue-50"><p className="text-sm font-black text-[#082b61]">{patientName(p)}</p><p className="mt-1 text-[10px] text-slate-400">{p.patientId} {p.phone?`· ${p.phone}`:""}</p></button>)}{patientOptions.length===0&&<p className="col-span-full py-4 text-center text-xs text-slate-400">No registered patient found.</p>}</div>}</>}</div>}
          {(mode === "WALKIN" || mode === "EXTERNAL_REFERRAL") && <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="text-xs font-bold text-slate-600">First name *<input value={firstName} onChange={e=>setFirstName(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"/></label><label className="text-xs font-bold text-slate-600">Last name<input value={lastName} onChange={e=>setLastName(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"/></label><label className="text-xs font-bold text-slate-600">Mobile<input value={phone} onChange={e=>setPhone(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"/></label><label className="text-xs font-bold text-slate-600">Sex<select value={gender} onChange={e=>setGender(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></label></div>}
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0b63ce]">2 · Investigation selection</p><div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><label className="flex-1 text-xs font-bold text-slate-600">Search investigation<input value={investigationInput} onChange={e=>setInvestigationInput(e.target.value)} placeholder="Search name, code or category…" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"/></label><label className="text-xs font-bold text-slate-600 lg:w-72">Category<select value={category} onChange={e=>setCategory(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"><option value="ALL">All categories</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label></div>{catalogueLoading?<p className="mt-5 text-sm text-slate-500">Loading Investigation Master…</p>:visibleOptions.length===0?<p className="mt-5 rounded-xl bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">No investigations found.</p>:<div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{visibleOptions.map(item=><button key={item.id} type="button" onClick={()=>add(item)} className="rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-[#0b63ce] hover:bg-blue-50"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black text-[#082b61]">{item.name}</p><p className="mt-1 text-[10px] font-semibold text-slate-400">{item.code} · {item.category}</p></div><span className="shrink-0 text-xs font-black text-[#0b63ce]">₹{Number(item.rate||0).toFixed(2)}</span></div></button>)}</div>}</section>
        {selected.length > 0 && <section className="rounded-3xl border border-[#d7c08a]/50 bg-white p-5 shadow-xl"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0b63ce]">3 · Final review</p><h2 className="mt-1 text-xl font-black text-[#082b61]">Selected Investigations</h2></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-[#082b61]">{selected.length} selected</span></div><div className="mt-4 divide-y divide-slate-100">{selected.map(item=><div key={item.id} className="flex items-center justify-between gap-4 py-3"><div><p className="text-sm font-black text-slate-800">{item.name}</p><p className="text-[10px] font-semibold text-slate-400">{item.code} · {item.category}</p></div><div className="flex items-center gap-3"><strong className="text-sm text-[#082b61]">₹{Number(item.rate).toFixed(2)}</strong><button type="button" onClick={()=>remove(item.id)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] font-black text-red-700">Remove</button></div></div>)}</div><div className="mt-5 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold text-slate-500">Investigation total</p><p className="text-2xl font-black text-[#082b61]">₹{total.toFixed(2)}</p></div><button type="button" disabled={loading} onClick={placeOrder} className="rounded-2xl bg-[#082b61] px-7 py-3.5 text-sm font-black text-white shadow-lg disabled:opacity-50">{loading?"Creating Bill…":"Place Investigation Order & Generate Bill"}</button></div></section>}
        {(error || message) && <section className={`rounded-2xl border p-4 text-sm font-semibold ${error?"border-red-200 bg-red-50 text-red-700":"border-emerald-200 bg-emerald-50 text-emerald-700"}`}><p>{error || message}</p>{billingHandoff && !error && <div className="mt-4 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[9px] font-black uppercase tracking-widest text-emerald-700">Next step</p><p className="mt-1 text-sm font-black text-[#082b61]">Proceed to Billing & Payment</p><p className="mt-1 text-xs text-slate-500">Bill {billingHandoff.billNumber} · Payment must be received before sampling.</p></div><Link href={`/billing?patientId=${encodeURIComponent(billingHandoff.patientId)}&visitId=${billingHandoff.visitId}`} className="rounded-xl bg-emerald-600 px-5 py-3 text-center text-xs font-black text-white shadow-lg">Next: Billing & Payment →</Link></div>}</section>}
      </div>
    </main>
  );
}

export default function InvestigationOrdersPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#eef2f7] p-8"><div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-sm text-sm font-semibold text-slate-500">Loading Investigation Orders…</div></main>}><InvestigationOrdersContent /></Suspense>;
}
