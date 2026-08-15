"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

type Patient = Record<string, unknown> & { id?: number | string; patientId?: string; firstName?: string; lastName?: string; gender?: string; phone?: string; mobile?: string; dateOfBirth?: string };
type Department = { id: number; name: string };
type Doctor = { id: number; name?: string; firstName?: string; lastName?: string };
type Visit = { id: number; departmentId?: number | null; department?: string | null; doctorId?: number | null; tokenNumber?: number; visitType?: string; status?: string; createdAt?: string; updatedAt?: string };
type Medicine = { id: number; name: string; dose: string; frequency: string; food: string; duration: string };
type Vital = { label: string; value: string; unit: string };
type Tool = "vitals" | "investigation" | "physical" | "advice" | null;

const units: Record<string, string> = { "Blood Pressure": "mmHg", Pulse: "bpm", "Respiratory Rate": "/min", Temperature: "°F", "SpO₂": "%", Weight: "kg", Height: "cm", BMI: "kg/m²" };

const investigations = [
  "Complete Blood Count (CBC)", "Haemoglobin", "Total Leucocyte Count", "Differential Leucocyte Count", "Platelet Count", "ESR", "PT / INR", "APTT", "D-Dimer", "Blood Sugar — Random", "Blood Sugar — Fasting", "Blood Sugar — Post Prandial", "HbA1c", "Serum Urea", "Serum Creatinine", "Serum Uric Acid", "Serum Calcium", "Serum Phosphorus", "Serum Electrolytes", "Serum Bilirubin Total", "SGOT / AST", "SGPT / ALT", "Alkaline Phosphatase", "GGT", "Serum Amylase", "Serum Lipase", "Total Lipid Profile", "Triglycerides", "Total Cholesterol", "HDL Cholesterol", "LDL Cholesterol", "Serum Ferritin", "CRP", "Procalcitonin", "Troponin I", "Troponin T", "FT3", "FT4", "TSH", "Anti-TPO Antibody", "Vitamin B12", "Folate", "Vitamin D3", "Hepatitis B Surface Antigen (HBsAg)", "Anti-HCV", "HIV Testing", "VDRL", "Rheumatoid Factor", "ANA", "Anti-dsDNA", "Dengue IgM / IgG", "Urine Examination Complete", "Urine Culture & Sensitivity", "Stool Examination", "Semen Examination", "FNAC — Pathology", "Biopsy", "ECG", "Holter Monitoring", "2-D Echocardiography", "Treadmill Test", "CT Scan", "MRI", "Ultrasound / Sonography", "Colour Doppler", "X-Ray", "X-Ray — 2 Views", "X-Ray — 3 Views", "X-Ray — 4 Views", "DXA / DEXA", "Mammography", "EEG", "EMG", "NCV", "NCV / EMG", "VEP", "BAER", "Repetitive Stimulation", "Pulmonary Function Test (PFT)", "Spirometry", "Audiometry", "BERA", "Nerve Conduction Study", "Electrodiagnostic Study", "Other Investigation"
];

function displayName(patient: Patient | null) {
  if (!patient) return "Patient";
  return String(patient.name || [patient.firstName, patient.lastName].filter(Boolean).join(" ") || "Patient");
}

function ageFromDob(dob?: string) {
  if (!dob) return "—";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "—";
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age >= 0 ? String(age) : "—";
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.toLocaleDateString("en-IN")} · ${date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function ConsultationPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const patientId = String(params.id);
  const opdVisitId = search.get("opdVisitId");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [consultationStartedAt, setConsultationStartedAt] = useState<string | null>(null);
  const [department, setDepartment] = useState("—");
  const [doctor, setDoctor] = useState("—");
  const [tool, setTool] = useState<Tool>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [physicalFindings, setPhysicalFindings] = useState("");
  const [generalAdvice, setGeneralAdvice] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [investigationInput, setInvestigationInput] = useState("");
  const [selectedInvestigations, setSelectedInvestigations] = useState<string[]>([]);
  const [vitals, setVitals] = useState<Vital[]>(Object.keys(units).map(label => ({ label, value: "", unit: units[label] })));
  const [medicines, setMedicines] = useState<Medicine[]>([{ id: 1, name: "", dose: "", frequency: "", food: "", duration: "" }]);

  useEffect(() => {
    (async () => {
      try {
        const p = await fetch(`/api/patients/${patientId}`);
        if (!p.ok) throw new Error("Unable to load patient.");
        setPatient(await p.json());
        if (!opdVisitId) return;
        const v = await fetch(`/api/opd/${opdVisitId}`);
        if (!v.ok) throw new Error("Unable to load OPD visit.");
        const vd: Visit = await v.json();
        setVisit(vd);
        const statusResponse = await fetch(`/api/opd/${opdVisitId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "IN_CONSULTATION" }) });
        if (statusResponse.ok) {
          const consultationVisit: Visit = await statusResponse.json();
          setConsultationStartedAt(consultationVisit.updatedAt || new Date().toISOString());
        } else {
          setConsultationStartedAt(new Date().toISOString());
        }
        const depsResponse = await fetch("/api/departments");
        const deps: Department[] = depsResponse.ok ? await depsResponse.json() : [];
        const departmentId = vd.departmentId ?? (vd.department ? Number(vd.department) : null);
        setDepartment(deps.find(x => x.id === Number(departmentId))?.name || "—");
        const docsResponse = await fetch(departmentId ? `/api/doctors?departmentId=${departmentId}` : "/api/doctors");
        const docs: Doctor[] = docsResponse.ok ? await docsResponse.json() : [];
        const d = docs.find(x => x.id === Number(vd.doctorId));
        setDoctor(d?.name || `${d?.firstName || ""} ${d?.lastName || ""}`.trim() || "—");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load consultation.");
      } finally {
        setLoading(false);
      }
    })();
  }, [patientId, opdVisitId]);

  const suggestions = useMemo(() => {
    const q = investigationInput.trim().toLowerCase();
    if (!q) return [];
    return investigations.filter(x => x.toLowerCase().includes(q) && !selectedInvestigations.includes(x)).slice(0, 10);
  }, [investigationInput, selectedInvestigations]);

  const patientName = displayName(patient);
  const patientDob = patient?.dateOfBirth;
  const patientPhone = String(patient?.phone || patient?.mobile || "—");
  const patientIdDisplay = String(patient?.patientId || patient?.id || patientId);
  const hasVitals = vitals.some(v => v.value.trim());
  const hasInvestigations = selectedInvestigations.length > 0;
  const hasPhysical = physicalFindings.trim().length > 0;
  const hasAdvice = generalAdvice.trim().length > 0;
  const filledMedicines = medicines.filter(m => m.name.trim());

  function updateVital(i: number, value: string) { setVitals(v => v.map((x, n) => n === i ? { ...x, value } : x)); }
  function updateMedicine(id: number, key: keyof Medicine, value: string) { setMedicines(m => m.map(x => x.id === id ? { ...x, [key]: value } : x)); }
  function addInvestigation(name: string) { setSelectedInvestigations(v => [...v, name]); setInvestigationInput(""); }

  async function save() {
    setSaving(true); setSaved(false); setError("");
    try {
      const clinicalNotes = [
        physicalFindings ? `Physical / Clinical Findings:\n${physicalFindings}` : "",
        hasVitals ? `Vitals:\n${vitals.filter(x => x.value.trim()).map(x => `${x.label}: ${x.value} ${x.unit}`).join(" | ")}` : "",
        hasInvestigations ? `Investigations:\n${selectedInvestigations.join(", ")}` : "",
        generalAdvice ? `General Advice:\n${generalAdvice}` : ""
      ].filter(Boolean).join("\n\n");
      const response = await fetch("/api/patients/encounters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, chiefComplaint, diagnosis, clinicalNotes, treatmentPlan: "", followUpDate: followUpDate || null, opdVisitId: opdVisitId ? Number(opdVisitId) : null })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to save consultation.");
      if (opdVisitId) await fetch(`/api/opd/${opdVisitId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "COMPLETED" }) });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save consultation.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#f5f7fa]"><div className="rounded-2xl bg-white p-8 text-center shadow-xl"><Image src="/serawat-logo.png" alt="S" width={76} height={44} className="mx-auto object-contain" /><p className="mt-3 text-sm font-bold text-slate-500">Loading consultation…</p></div></main>;

  const toolButton = (key: Exclude<Tool, null>, label: string, icon: string) => <button type="button" onClick={() => setTool(tool === key ? null : key)} className={`no-print flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-black transition ${tool === key ? "bg-[#082b61] text-white shadow-lg" : "bg-white text-slate-600 hover:bg-blue-50 hover:text-[#0b63ce]"}`}><span>{icon}</span>{label}<span className="ml-auto">{tool === key ? "−" : "+"}</span></button>;

  return (
    <>
      <main className="consultation-screen min-h-screen bg-[#eef2f7] text-slate-900">
        <header className="no-print sticky top-0 z-40 border-b border-[#d7c08a]/30 bg-[#071f46] text-white shadow-lg">
          <div className="mx-auto flex min-h-[92px] max-w-[1600px] items-center justify-between gap-5 px-5 py-4 sm:px-8">
            <div className="flex min-w-0 items-center gap-4">
              <button type="button" onClick={() => router.back()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-xl font-black">←</button>
              <div className="h-14 w-20 shrink-0"><Image src="/serawat-logo.png" alt="S" width={76} height={44} className="h-full w-full object-contain" priority /></div>
              <div className="min-w-0 border-l border-white/15 pl-4"><p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#f1d27a]">SAMS · Clinical Record</p><h1 className="mt-1 truncate text-xl font-semibold tracking-tight sm:text-2xl" style={{ fontFamily: "'Cormorant Garamond','Baskerville','Times New Roman',serif" }}>Serawat Advanced Musculoskeletal, Joint &amp; Spine Centre</h1></div>
            </div>
            <div className="hidden text-right sm:block"><p className="text-[9px] uppercase tracking-[0.18em] text-blue-200">Patient</p><p className="text-sm font-black">{patientName} · {patientIdDisplay}</p></div>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-7 lg:px-9">
          <section className="consultation-paper overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl">
            <section className="border-b border-slate-200 bg-[#fbfaf7] px-5 py-5 sm:px-8">
              <div className="flex items-center justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#0b63ce]">Patient Details</p><h2 className="mt-1 text-2xl font-semibold text-[#082b61]" style={{ fontFamily: "'Cormorant Garamond','Baskerville','Times New Roman',serif" }}>{patientName}</h2></div><span className="rounded-full border border-[#d4af37]/40 bg-[#fffaf0] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#8b6a17]">OPD · #{visit?.tokenNumber || visit?.id || "—"}</span></div>
              <div className="mt-4 grid gap-x-6 gap-y-3 text-xs sm:grid-cols-2 lg:grid-cols-4"><div><span className="label">Patient ID</span><strong>{patientIdDisplay}</strong></div><div><span className="label">Age / Sex</span><strong>{ageFromDob(patientDob)} / {String(patient?.gender || "—")}</strong></div><div><span className="label">Mobile</span><strong>{patientPhone}</strong></div><div><span className="label">DOB</span><strong>{patientDob ? new Date(patientDob).toLocaleDateString("en-IN") : "—"}</strong></div><div><span className="label">Department</span><strong>{department}</strong></div><div><span className="label">Consultant</span><strong>{doctor}</strong></div><div><span className="label">Visit No.</span><strong>{visit?.id || "—"}</strong></div><div><span className="label">Date &amp; Time</span><strong>{formatDateTime(consultationStartedAt)}</strong></div></div>
            </section>

            <div className="grid lg:grid-cols-[220px_minmax(0,1fr)]">
              <aside className="no-print border-b border-slate-200 bg-[#f8fafc] p-4 lg:border-b-0 lg:border-r lg:p-5"><div className="mt-0 space-y-2">{toolButton("vitals","Vitals","🩺")}{toolButton("investigation","Investigations","🔬")}{toolButton("physical","Physical / Clinical","🦴")}{toolButton("advice","General Advice","📋")}</div>{tool === "vitals" && <div className="tool-panel">{vitals.map((v,i)=><label key={v.label} className="tool-field"><span>{v.label}</span><div><input value={v.value} onChange={e => updateVital(i,e.target.value)} /><b>{v.unit}</b></div></label>)}</div>}{tool === "investigation" && <div className="tool-panel"><div className="relative"><input value={investigationInput} onChange={e => setInvestigationInput(e.target.value)} placeholder="Type initials / name…" className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-blue-500" />{suggestions.length > 0 && <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-auto rounded-xl border border-slate-200 bg-white shadow-2xl">{suggestions.map(x => <button type="button" key={x} onClick={() => addInvestigation(x)} className="block w-full border-b border-slate-100 px-3 py-2.5 text-left text-[11px] font-semibold text-slate-700 hover:bg-blue-50">{x}</button>)}</div>}</div><div className="mt-2 flex flex-wrap gap-1.5">{selectedInvestigations.map(x => <button type="button" key={x} onClick={() => setSelectedInvestigations(v => v.filter(i => i !== x))} className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-bold text-[#0b63ce]">{x} ×</button>)}</div></div>}{tool === "physical" && <div className="tool-panel"><textarea value={physicalFindings} onChange={e => setPhysicalFindings(e.target.value)} rows={8} placeholder="Physical / clinical examination findings…" className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs outline-none focus:border-blue-500" /></div>}{tool === "advice" && <div className="tool-panel"><textarea value={generalAdvice} onChange={e => setGeneralAdvice(e.target.value)} rows={7} placeholder="General advice / precautions…" className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs outline-none focus:border-blue-500" /></div>}</aside>

              <section className="min-w-0 p-5 sm:p-8">
                <div className="grid gap-5 lg:grid-cols-2"><section className="clinical-box"><p className="section-label">Chief Complaint</p><textarea value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} rows={5} placeholder="Reason for consultation / presenting complaints…" /></section><section className="clinical-box"><p className="section-label">Clinical Diagnosis</p><textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} rows={5} placeholder="Diagnosis / differential diagnosis…" /></section></div>
                <section className="clinical-box mt-5"><div className="flex items-center justify-between"><p className="section-label">Medicines / Prescription</p><button type="button" onClick={() => setMedicines(v => [...v, { id: Date.now(), name:"", dose:"", frequency:"", food:"", duration:"" }])} className="no-print rounded-lg bg-[#082b61] px-3 py-2 text-[10px] font-black text-white">+ Add Medicine</button></div><div className="mt-3 space-y-2">{medicines.map((m,i) => <div key={m.id} className="grid gap-2 rounded-xl bg-slate-50 p-2.5 sm:grid-cols-5"><input value={m.name} onChange={e => updateMedicine(m.id,"name",e.target.value)} placeholder={`Medicine ${i+1}`} /><input value={m.dose} onChange={e => updateMedicine(m.id,"dose",e.target.value)} placeholder="Dose" /><input value={m.frequency} onChange={e => updateMedicine(m.id,"frequency",e.target.value)} placeholder="Frequency" /><input value={m.food} onChange={e => updateMedicine(m.id,"food",e.target.value)} placeholder="Food" /><input value={m.duration} onChange={e => updateMedicine(m.id,"duration",e.target.value)} placeholder="Duration" /></div>)}</div></section>
                {error && <div className="no-print mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
                {saved && <div className="no-print mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">Consultation saved successfully. Use Print A4 for the final single-page record.</div>}
                <div className="mt-6 flex items-end justify-between gap-6 border-t border-slate-200 pt-5"><div><label className="block text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Follow-up Date</label><input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} className="no-print mt-2 rounded-lg border border-slate-200 p-2 text-xs" /><p className="hidden text-sm font-bold text-[#082b61] print-followup">{followUpDate ? new Date(followUpDate).toLocaleDateString("en-IN") : "—"}</p></div><div className="w-56 text-center"><div className="h-8 border-b border-slate-400"/><p className="mt-1 text-xs font-black text-[#082b61]">Consultant</p><p className="text-[10px] font-semibold text-slate-500">{doctor}</p><p className="no-print mt-1 text-[9px] text-slate-400">Signature</p></div></div>
                <div className="no-print mt-5 flex justify-end gap-3 border-t border-slate-200 pt-4"><button type="button" onClick={() => window.print()} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-black text-slate-600">Print A4</button><button type="button" onClick={save} disabled={saving} className="rounded-xl bg-[#0b63ce] px-6 py-3 text-xs font-black text-white disabled:opacity-60">{saving ? "Saving…" : "Save Consultation"}</button></div>
              </section>
            </div>
          </section>
        </div>
      </main>

      <section className="print-document" aria-hidden="true">
        <div className="print-header">
          <div className="print-brand"><Image src="/serawat-logo.png" alt="S" width={42} height={42} className="print-logo" /><div><div className="print-hospital">SERAWAT ADVANCED MUSCULOSKELETAL, JOINT &amp; SPINE CENTRE</div></div></div>
          <div className="print-opd"><strong>OPD · #{visit?.tokenNumber || visit?.id || "—"}</strong><span>{formatDateTime(visit?.createdAt)}</span></div>
        </div>

        <div className="print-patient">
          <div><span>Patient</span><strong>{patientName}</strong></div><div><span>Patient ID</span><strong>{patientIdDisplay}</strong></div><div><span>Age / Sex</span><strong>{ageFromDob(patientDob)} / {String(patient?.gender || "—")}</strong></div><div><span>Mobile</span><strong>{patientPhone}</strong></div><div><span>DOB</span><strong>{patientDob ? new Date(patientDob).toLocaleDateString("en-IN") : "—"}</strong></div><div><span>Visit No.</span><strong>{visit?.id || "—"}</strong></div><div><span>Department</span><strong>{department}</strong></div><div><span>Consultant</span><strong>{doctor}</strong></div><div><span>Consultation Start</span><strong>{formatDateTime(consultationStartedAt)}</strong></div></div>

        <div className="print-complaints"><div><h3>Chief Complaint</h3><p>{chiefComplaint || "—"}</p></div><div><h3>Clinical Diagnosis</h3><p>{diagnosis || "—"}</p></div></div>

        <div className="print-body">
          <aside className="print-sidebar">
            {hasVitals && <div className="print-tool"><b>Vitals</b><p>{vitals.filter(v => v.value.trim()).map(v => `${v.label}: ${v.value} ${v.unit}`).join("  ·  ")}</p></div>}
            {hasPhysical && <div className="print-tool"><b>Physical / Clinical</b><p>{physicalFindings}</p></div>}
            {hasInvestigations && <div className="print-tool"><b>Investigations</b><p>{selectedInvestigations.join("  ·  ")}</p></div>}
            {hasAdvice && <div className="print-tool"><b>General Advice</b><p>{generalAdvice}</p></div>}
          </aside>

          <section className="print-main">
            {filledMedicines.length > 0 ? <div className="print-section"><h3>Medicines / Prescription</h3><table><thead><tr><th>Medicine</th><th>Dose</th><th>Frequency</th><th>Food</th><th>Duration</th></tr></thead><tbody>{filledMedicines.map(m => <tr key={m.id}><td>{m.name}</td><td>{m.dose}</td><td>{m.frequency}</td><td>{m.food}</td><td>{m.duration}</td></tr>)}</tbody></table></div> : <div className="print-empty">Prescription / clinical management details</div>}
            <div className="print-footer"><div><span>Follow-up Date</span><strong>{followUpDate ? new Date(followUpDate).toLocaleDateString("en-IN") : "—"}</strong></div><div className="print-sign"><span>Consultant</span><strong>{doctor}</strong><em>Signature</em></div></div>
          </section>
        </div>
      </section>

      <style jsx global>{`
        .label{display:block;font-size:9px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:#94a3b8;margin-bottom:3px}.clinical-box{border:1px solid #dbe3ec;border-radius:16px;background:#fff;padding:16px}.section-label{font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:#082b61;margin-bottom:8px}.clinical-box textarea,.clinical-box input{width:100%;border:1px solid #e2e8f0;border-radius:10px;padding:10px;font-size:12px;outline:none;background:#fff}.clinical-box textarea:focus,.clinical-box input:focus{border-color:#0b63ce}.tool-panel{margin-top:10px;border:1px solid #dbe3ec;border-radius:12px;background:#fff;padding:10px}.tool-field{display:block;margin-bottom:8px}.tool-field>span{display:block;font-size:9px;font-weight:800;color:#64748b;margin-bottom:3px}.tool-field>div{display:flex;align-items:center;gap:4px}.tool-field input{min-width:0;width:100%;border:1px solid #dbe3ec;border-radius:7px;padding:6px;font-size:11px}.tool-field b{font-size:9px;color:#64748b;white-space:nowrap}.print-document{display:none}
        @media print{
          @page{size:A4 portrait;margin:0}
          html,body{width:210mm!important;height:297mm!important;margin:0!important;padding:0!important;background:#fff!important}
          body{overflow:hidden!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
          .consultation-screen{display:none!important}
          .print-document{display:block!important;box-sizing:border-box;width:210mm;height:297mm;max-height:297mm;overflow:hidden;background:#fff;color:#172033;font-family:Arial,Helvetica,sans-serif;padding:8mm 9mm 7mm}
          .print-header{height:24mm;border-bottom:1px solid #183d70;display:flex;align-items:center;justify-content:space-between}.print-brand{display:flex;align-items:center;gap:4mm}.print-logo{width:14mm;height:14mm;object-fit:contain}.print-hospital{font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:700;letter-spacing:.045em;color:#082b61;line-height:1.15}.print-opd{display:flex;flex-direction:column;align-items:flex-end;gap:1mm;font-size:9px;font-weight:800;color:#082b61;border:1px solid #d7c08a;padding:2mm 3mm;border-radius:2mm;white-space:nowrap}.print-opd span{font-size:7px;font-weight:700;color:#64748b}
          .print-patient{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid #cbd5e1;padding:4mm 0;gap:3mm 5mm}.print-patient span,.print-footer span{display:block;font-size:7px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#64748b}.print-patient strong{display:block;font-size:9px;line-height:1.2;margin-top:1mm;color:#172033;overflow-wrap:anywhere}
          .print-complaints{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #cbd5e1}.print-complaints>div{min-height:25mm;padding:3.5mm 4mm}.print-complaints>div+div{border-left:1px solid #cbd5e1}.print-complaints h3,.print-section h3{margin:0 0 2mm;font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:#082b61;font-weight:900}.print-complaints p,.print-section p{margin:0;font-size:8.5px;line-height:1.35;white-space:pre-wrap;overflow-wrap:anywhere}
          .print-body{display:grid;grid-template-columns:39mm 1fr;min-height:166mm;border-bottom:1px solid #cbd5e1}.print-sidebar{border-right:1px solid #cbd5e1;padding:4mm 3.5mm}.print-tool{padding:3mm 0;border-bottom:1px solid #e2e8f0}.print-tool:last-child{border-bottom:0}.print-tool b{display:block;font-size:8px;color:#082b61;font-weight:900;margin-bottom:1mm}.print-tool p{margin:0;font-size:7.5px;line-height:1.35;white-space:pre-wrap;overflow-wrap:anywhere}.print-main{padding:4mm 4.5mm;display:flex;flex-direction:column;min-width:0}.print-section{border-bottom:1px solid #e2e8f0;padding-bottom:3mm;margin-bottom:3mm}.print-section table{width:100%;border-collapse:collapse;table-layout:fixed}.print-section th,.print-section td{border-bottom:1px solid #e2e8f0;padding:1.5mm 1.5mm;text-align:left;font-size:7.5px;vertical-align:top;overflow-wrap:anywhere}.print-section th{font-size:7px;color:#64748b;text-transform:uppercase;letter-spacing:.06em}.print-empty{font-size:8px;color:#94a3b8;padding:3mm 0}.print-footer{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;padding-top:4mm}.print-footer strong{display:block;font-size:9px;margin-top:1.2mm;color:#082b61}.print-sign{text-align:center;min-width:45mm}.print-sign em{display:block;font-style:normal;font-size:7px;color:#64748b;margin-top:7mm;border-top:1px solid #64748b;padding-top:1mm}.print-followup{display:block}
        }
      `}</style>
    </>
  );
}
