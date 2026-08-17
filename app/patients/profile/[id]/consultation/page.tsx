"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

type Patient = { id?: number; patientId?: string; firstName?: string; lastName?: string; name?: string; gender?: string; phone?: string; dateOfBirth?: string };
type Visit = { id: number; departmentId?: number | null; doctorId?: number | null; tokenNumber?: number; status?: string; createdAt?: string; updatedAt?: string };
type Investigation = { id: number; code?: string | null; name: string; category?: string | null; department?: string | null };
type Result = { id: number; investigationId?: number | null; investigation: string; status: string; reportText?: string | null; reportedAt?: string | null; master?: { unit?: string | null; referenceRange?: string | null } | null };
type Medicine = { id: number; name: string; dose: string; frequency: string; food: string; duration: string };
type Tool = "vitals" | "investigation" | "reports" | "physical" | "advice" | null;

const units: Record<string, string> = { "Blood Pressure": "mmHg", Pulse: "bpm", "Respiratory Rate": "/min", Temperature: "°F", "SpO₂": "%", Weight: "kg", Height: "cm", BMI: "kg/m²" };
const patientName = (p: Patient | null) => String(p?.name || [p?.firstName, p?.lastName].filter(Boolean).join(" ") || "Patient");
const age = (dob?: string) => { if (!dob) return "—"; const d = new Date(dob); const n = new Date(); let a = n.getFullYear() - d.getFullYear(); if (n.getMonth() < d.getMonth() || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) a--; return a >= 0 ? String(a) : "—"; };
const dateTime = (value?: string | null) => { if (!value) return "—"; const d = new Date(value); return Number.isNaN(d.getTime()) ? "—" : `${d.toLocaleDateString("en-IN")} · ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`; };

export default function ConsultationPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const pid = String(params.id);
  const visitId = search.get("opdVisitId");

  const [patient, setPatient] = useState<Patient | null>(null);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [department, setDepartment] = useState("—");
  const [doctor, setDoctor] = useState("—");
  const [started, setStarted] = useState<string | null>(null);
  const [tool, setTool] = useState<Tool>("investigation");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [finalized, setFinalized] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [complaint, setComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [physical, setPhysical] = useState("");
  const [advice, setAdvice] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Investigation[]>([]);
  const [selected, setSelected] = useState<Investigation[]>([]);
  const [ordered, setOrdered] = useState<Set<number>>(new Set());
  const [results, setResults] = useState<Result[]>([]);
  const [vitals, setVitals] = useState(Object.keys(units).map(label => ({ label, value: "", unit: units[label] })));
  const [medicines, setMedicines] = useState<Medicine[]>([{ id: 1, name: "", dose: "", frequency: "", food: "", duration: "" }]);

  async function reload() {
    if (!visitId) return;
    try {
      const encounterResponse = await fetch(`/api/patients/encounters?opdVisitId=${visitId}`, { cache: "no-store" });
      if (encounterResponse.ok) {
        const c = await encounterResponse.json();
        if (c) {
          setSaved(true);
          setComplaint(c.chiefComplaint || "");
          setDiagnosis(c.diagnosis || "");
          setFollowUp(c.followUpDate ? String(c.followUpDate).slice(0, 10) : "");
          const treatment = String(c.treatmentPlan || "");
          if (treatment.startsWith("Medicines:\n")) {
            try {
              const parsed = JSON.parse(treatment.slice("Medicines:\n".length));
              if (Array.isArray(parsed)) setMedicines(parsed);
            } catch { /* ignore malformed legacy medicine data */ }
          }
          const note = String(c.clinicalNotes || "");
          const marker = "Investigations:";
          const markerIndex = note.indexOf(marker);
          if (markerIndex >= 0) {
            const line = note.slice(markerIndex + marker.length).split("\n")[0];
            const names = line.split(",").map((x: string) => x.trim()).filter(Boolean);
            const rows = await Promise.all(names.map((x: string) => fetch(`/api/investigation-master?q=${encodeURIComponent(x)}`).then(r => r.ok ? r.json() : [])));
            const all = rows.flat();
            setSelected(names.map((x: string) => all.find((y: any) => String(y.name).toLowerCase() === x.toLowerCase())).filter(Boolean));
          }
        }
      }
      const ordersResponse = await fetch(`/api/investigation-orders?opdVisitId=${visitId}`, { cache: "no-store" });
      if (ordersResponse.ok) {
        const rows = await ordersResponse.json();
        setOrdered(new Set(rows.map((x: any) => Number(x.investigationId)).filter(Boolean)));
      }
      const resultsResponse = await fetch(`/api/investigation-results?opdVisitId=${visitId}`, { cache: "no-store" });
      if (resultsResponse.ok) setResults(await resultsResponse.json());
      const visitResponse = await fetch(`/api/opd/${visitId}`, { cache: "no-store" });
      if (visitResponse.ok) {
        const currentVisit = await visitResponse.json();
        setVisit(currentVisit);
        setFinalized(currentVisit.status === "COMPLETED");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to reload consultation.");
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const patientResponse = await fetch(`/api/patients/${pid}`);
        if (!patientResponse.ok) throw new Error("Unable to load patient.");
        setPatient(await patientResponse.json());
        if (visitId) {
          const visitResponse = await fetch(`/api/opd/${visitId}`);
          if (!visitResponse.ok) throw new Error("Unable to load OPD visit.");
          const currentVisit: Visit = await visitResponse.json();
          setVisit(currentVisit);
          setStarted(currentVisit.updatedAt || currentVisit.createdAt || null);
          const departmentResponse = await fetch("/api/departments");
          const departments = departmentResponse.ok ? await departmentResponse.json() : [];
          setDepartment(departments.find((x: any) => x.id === currentVisit.departmentId)?.name || "—");
          const doctorResponse = await fetch(currentVisit.doctorId ? `/api/doctors?departmentId=${currentVisit.departmentId}` : "/api/doctors");
          const doctors = doctorResponse.ok ? await doctorResponse.json() : [];
          const selectedDoctor = doctors.find((x: any) => x.id === currentVisit.doctorId);
          setDoctor(selectedDoctor?.name || [selectedDoctor?.firstName, selectedDoctor?.lastName].filter(Boolean).join(" ") || "—");
          setFinalized(currentVisit.status === "COMPLETED");
          await reload();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load consultation.");
      } finally {
        setLoading(false);
      }
    })();
  }, [pid, visitId]);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setSuggestions([]); return; }
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/investigation-master?q=${encodeURIComponent(q)}`, { cache: "no-store" });
        if (response.ok) {
          const rows: Investigation[] = await response.json();
          const ids = new Set(selected.map(x => x.id));
          setSuggestions(rows.filter(x => !ids.has(x.id)).slice(0, 10));
        }
      } catch { /* ignore search failures */ }
    }, 200);
    return () => window.clearTimeout(timer);
  }, [query, selected]);

  const save = async () => {
    setSaving(true); setError(""); setMessage("");
    try {
      const notes = [physical ? `Physical / Clinical Findings:\n${physical}` : "", advice ? `General Advice:\n${advice}` : "", selected.length ? `Investigations:\n${selected.map(x => x.name).join(", ")}` : ""].filter(Boolean).join("\n\n");
      const cleanMedicines = medicines.filter(m => m.name.trim()).map(m => ({ ...m, name: m.name.trim() }));
      const treatmentPlan = cleanMedicines.length ? `Medicines:\n${JSON.stringify(cleanMedicines)}` : "";
      const response = await fetch("/api/patients/encounters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: Number(pid), opdVisitId: visitId ? Number(visitId) : null, chiefComplaint: complaint, diagnosis, clinicalNotes: notes, treatmentPlan, followUpDate: followUp || null })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to save consultation.");
      setSaved(true);
      setMessage("Consultation and prescription saved. Visit remains open; you can continue later.");
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save consultation.");
      return false;
    } finally { setSaving(false); }
  };

  const orderInvestigations = async () => {
    if (!visitId || !selected.length) { setError("Select at least one investigation before placing the order."); return; }
    const pending = selected.filter(x => !ordered.has(x.id));
    if (!pending.length) { setMessage("All selected investigations are already ordered."); return; }
    setOrdering(true); setError("");
    try {
      const response = await fetch("/api/investigation-orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ opdVisitId: Number(visitId), investigations: pending.map(x => ({ id: x.id })) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to place investigation order.");
      setOrdered(old => new Set([...old, ...pending.map(x => x.id)]));
      setMessage("Investigation order sent → Lab & Billing.");
      await reload();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to place investigation order."); }
    finally { setOrdering(false); }
  };

  const finalize = async (print: boolean) => {
    setFinalizing(true); setError(""); setMessage("");
    try {
      const ok = await save();
      if (!ok) throw new Error("Consultation could not be saved.");
      if (!visitId) throw new Error("A Visit is required to finalize consultation.");
      const response = await fetch(`/api/opd/${visitId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "COMPLETED", finalize: true }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to finalize consultation.");
      setFinalized(true); setVisit(data); setMessage("Consultation finalized successfully.");
      if (print) window.setTimeout(() => router.push(`/patients/profile/${pid}/opd-slip/print?visitId=${visitId}`), 250);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to finalize consultation."); }
    finally { setFinalizing(false); }
  };

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#eef2f7]"><div className="rounded-2xl bg-white p-8 font-bold text-slate-500 shadow-xl">Loading consultation…</div></main>;

  const toolButton = (key: Exclude<Tool, null>, label: string, icon: string) => <button type="button" onClick={() => setTool(tool === key ? null : key)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-black ${tool === key ? "bg-[#082b61] text-white" : "bg-white text-slate-600"}`}><span>{icon}</span>{label}<span className="ml-auto">{tool === key ? "−" : "+"}</span></button>;

  return <main className="min-h-screen bg-[#eef2f7] text-slate-900 print:bg-white">
    <style>{`@media print{.no-print{display:none!important}.print-sheet{box-shadow:none!important;border:0!important}.print-only{display:block!important}}.print-only{display:none}`}</style>
    <header className="sticky top-0 z-40 bg-[#071f46] text-white shadow-lg no-print"><div className="mx-auto flex min-h-[88px] max-w-[1600px] items-center gap-4 px-5 sm:px-8"><button type="button" onClick={() => router.back()} className="h-10 w-10 rounded-xl bg-white/10 text-xl">←</button><Image src="/serawat-logo.png" alt="SAMS" width={70} height={44}/><div className="border-l border-white/15 pl-4"><p className="text-[9px] font-black uppercase tracking-[.25em] text-[#f1d27a]">SAMS · Clinical Record</p><h1 className="text-xl font-semibold sm:text-2xl">Serawat Advanced Musculoskeletal, Joint &amp; Spine Centre</h1></div></div></header>
    <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-7 lg:px-9"><section className="print-sheet overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl">
      <section className="border-b bg-[#fbfaf7] px-5 py-5 sm:px-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-[.24em] text-[#0b63ce]">Patient Details</p><h2 className="mt-1 text-2xl font-semibold text-[#082b61]">{patientName(patient)}</h2></div><div className="flex gap-2"><span className="rounded-full border border-[#d4af37]/40 bg-[#fffaf0] px-3 py-1.5 text-[9px] font-black uppercase text-[#8b6a17]">OPD · #{visit?.tokenNumber || visit?.id || "—"}</span><span className={`rounded-full px-3 py-1.5 text-[9px] font-black uppercase ${finalized ? "bg-slate-100 text-slate-700" : "bg-emerald-50 text-emerald-700"}`}>{finalized ? "Finalized" : "Open / Reopenable"}</span></div></div><div className="mt-4 grid gap-4 text-xs sm:grid-cols-2 lg:grid-cols-4">{[["Patient ID", patient?.patientId || patient?.id || pid], ["Age / Sex", `${age(patient?.dateOfBirth)} / ${patient?.gender || "—"}`], ["Mobile", patient?.phone || "—"], ["Department", department], ["Consultant", doctor], ["Visit No.", visit?.id || "—"], ["Date & Time", dateTime(started)]].map(([label, value]) => <div key={String(label)}><span className="block text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</span><strong className="mt-1 block text-slate-700">{value}</strong></div>)}</div></section>
      <div className="grid lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="border-b bg-[#f8fafc] p-4 no-print lg:border-b-0 lg:border-r lg:p-5"><div className="space-y-2">{toolButton("vitals", "Vitals", "🩺")}{toolButton("investigation", "Investigations", "🔬")}{toolButton("reports", "Investigation Results", "📄")}{toolButton("physical", "Physical / Clinical", "🦴")}{toolButton("advice", "General Advice", "📋")}</div>
          {tool === "vitals" && <div className="mt-3 rounded-xl border bg-white p-3">{vitals.map((v, i) => <label className="mb-2 block text-[10px] font-bold" key={v.label}>{v.label}<div className="mt-1 flex"><input className="w-full rounded-l-lg border px-2 py-2" value={v.value} onChange={e => setVitals(old => old.map((x, n) => n === i ? { ...x, value: e.target.value } : x))}/><b className="rounded-r-lg border border-l-0 bg-slate-50 px-2 py-2">{v.unit}</b></div></label>)}</div>}
          {tool === "investigation" && <div className="mt-3 rounded-xl border bg-white p-3"><p className="text-[10px] font-black uppercase text-[#0b63ce]">Investigation Advice</p><input className="mt-2 w-full rounded-lg border px-3 py-2 text-xs" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, code, alias…"/>{suggestions.length > 0 && <div className="mt-1 max-h-64 overflow-auto rounded-xl border bg-white shadow-xl">{suggestions.map(x => <button type="button" key={x.id} onClick={() => { setSelected(v => [...v, x]); setQuery(""); setSuggestions([]); }} className="block w-full border-b px-3 py-2 text-left"><b className="block text-[11px]">{x.name}</b><small className="text-slate-400">{[x.code, x.category, x.department].filter(Boolean).join(" · ")}</small></button>)}</div>}<div className="mt-3 space-y-1">{selected.map(x => <div key={x.id} className="flex items-center justify-between rounded-lg bg-blue-50 px-2 py-2 text-[9px] font-bold text-blue-700"><span>{x.name}{ordered.has(x.id) ? " · ORDERED" : ""}</span><button type="button" onClick={() => setSelected(v => v.filter(y => y.id !== x.id))} className="text-red-500">Remove</button></div>)}</div>{selected.length > 0 && <button type="button" onClick={orderInvestigations} disabled={ordering || !visitId} className="mt-3 w-full rounded-xl bg-[#0b63ce] px-3 py-3 text-[10px] font-black text-white disabled:opacity-50">{ordering ? "Sending…" : "Send Investigation Order → Lab & Billing"}</button>}</div>}
          {tool === "reports" && <div className="mt-3 rounded-xl border bg-white p-3"><p className="text-[10px] font-black uppercase text-[#0b63ce]">Investigation Results</p><div className="mt-3 space-y-2">{results.length === 0 ? <p className="text-xs text-slate-400">No investigation orders found for this Visit.</p> : results.map(r => <div key={r.id} className="rounded-xl border p-3"><div className="flex items-start justify-between gap-2"><b className="text-[11px] text-[#082b61]">{r.investigation}</b><span className={`rounded-full px-2 py-1 text-[8px] font-black ${r.reportText ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{r.reportText ? "REPORT READY" : "PENDING"}</span></div>{r.reportText && <p className="mt-2 whitespace-pre-wrap text-[10px] text-slate-700">{r.reportText}</p>}<div className="mt-2 text-[9px] text-slate-400">{[r.master?.unit, r.master?.referenceRange].filter(Boolean).join(" · ")}{r.reportedAt ? ` · ${dateTime(r.reportedAt)}` : ""}</div></div>)}</div></div>}
          {tool === "physical" && <div className="mt-3 rounded-xl border bg-white p-3"><textarea className="w-full rounded-lg border p-2 text-xs" value={physical} onChange={e => setPhysical(e.target.value)} rows={8} placeholder="Physical / clinical findings…"/></div>}
          {tool === "advice" && <div className="mt-3 rounded-xl border bg-white p-3"><textarea className="w-full rounded-lg border p-2 text-xs" value={advice} onChange={e => setAdvice(e.target.value)} rows={7} placeholder="General advice / precautions…"/></div>}
        </aside>
        <section className="p-5 sm:p-8"><div className="grid gap-5 lg:grid-cols-2"><div className="rounded-2xl border p-4"><p className="mb-2 text-[10px] font-black uppercase tracking-[.18em] text-[#082b61]">Chief Complaint</p><textarea className="w-full rounded-lg border p-2 text-xs" value={complaint} onChange={e => setComplaint(e.target.value)} rows={5}/></div><div className="rounded-2xl border p-4"><p className="mb-2 text-[10px] font-black uppercase tracking-[.18em] text-[#082b61]">Clinical Diagnosis</p><textarea className="w-full rounded-lg border p-2 text-xs" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} rows={5}/></div></div>
          <div className="mt-5 rounded-2xl border p-4 no-print"><div className="flex items-center justify-between"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#082b61]">Medicines / Prescription</p><button type="button" onClick={() => setMedicines(v => [...v, { id: Date.now(), name: "", dose: "", frequency: "", food: "", duration: "" }])} className="rounded-lg bg-[#082b61] px-3 py-2 text-[10px] font-black text-white">+ Add Medicine</button></div>{medicines.map((m, i) => <div key={m.id} className="mt-3 grid gap-2 rounded-xl bg-slate-50 p-2 sm:grid-cols-5">{(["name", "dose", "frequency", "food", "duration"] as const).map(k => <input key={k} className="rounded-lg border px-2 py-2 text-xs" value={m[k]} onChange={e => setMedicines(v => v.map(x => x.id === m.id ? { ...x, [k]: e.target.value } : x))} placeholder={k === "name" ? `Medicine ${i + 1}` : k}/>)}</div>)}</div>
          {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}{message && <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{message}</div>}
          <div className="mt-6 flex flex-col gap-3 border-t pt-5 no-print sm:flex-row sm:items-end sm:justify-between"><div><span className="block text-[9px] font-black uppercase tracking-wider text-slate-400">Follow-up Date</span><input type="date" value={followUp} onChange={e => setFollowUp(e.target.value)} className="mt-2 rounded-lg border p-2 text-xs"/></div><div className="flex flex-wrap gap-2"><button type="button" onClick={reload} disabled={!visitId} className="rounded-xl border border-[#0b63ce] bg-white px-4 py-3 text-xs font-black text-[#0b63ce]">↻ Reopen Saved Consultation</button><button type="button" onClick={() => save()} disabled={saving || finalized} className="rounded-xl bg-[#0b63ce] px-5 py-3 text-xs font-black text-white disabled:opacity-50">{saving ? "Saving…" : "Save Consultation · Keep Visit Open"}</button><button type="button" onClick={() => finalize(false)} disabled={finalizing || finalized} className="rounded-xl bg-[#082b61] px-5 py-3 text-xs font-black text-white disabled:opacity-50">{finalizing ? "Finalizing…" : "Finalize Consultation"}</button><button type="button" onClick={() => finalize(true)} disabled={finalizing || finalized} className="rounded-xl bg-[#0b63ce] px-5 py-3 text-xs font-black text-white disabled:opacity-50">Finalize &amp; Print</button>{finalized && <button type="button" onClick={() => window.print()} className="rounded-xl border border-[#082b61] bg-white px-5 py-3 text-xs font-black text-[#082b61]">Print Final Consultation</button>}</div></div>
          <div className="print-only mt-6 border-t pt-4"><p className="text-xs font-black uppercase">Consultation Summary</p><p className="mt-2 text-sm"><b>Chief Complaint:</b> {complaint || "—"}</p><p className="mt-2 text-sm"><b>Diagnosis:</b> {diagnosis || "—"}</p><p className="mt-2 text-sm"><b>Follow-up:</b> {followUp || "—"}</p></div>
        </section>
      </div>
    </section></div>
  </main>;
}
