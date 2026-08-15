"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

type Patient = Record<string, unknown> & { id?: number | string; patientId?: string; firstName?: string; lastName?: string; gender?: string; phone?: string; mobile?: string; dateOfBirth?: string };
type Department = { id: number; name: string };
type Doctor = { id: number; name?: string; firstName?: string; lastName?: string };
type Visit = { id: number; departmentId?: number | null; department?: string | null; doctorId?: number | null; tokenNumber?: number; visitType?: string; status?: string };
type Medicine = { id: number; name: string; dose: string; frequency: string; food: string; duration: string };
type Vital = { label: string; value: string; unit: string };
type Tool = "vitals" | "investigation" | "physical" | "advice" | null;

const units: Record<string, string> = { "Blood Pressure": "mmHg", Pulse: "bpm", "Respiratory Rate": "/min", Temperature: "°F", "SpO₂": "%", Weight: "kg", Height: "cm", BMI: "kg/m²" };

// Investigation master is based on the published SMS Hospital, Jaipur investigation list; keep aliases/search-friendly spellings here.
const investigations = [
  "Complete Blood Count (CBC)", "Haemoglobin", "Total Leucocyte Count", "Differential Leucocyte Count", "Total Eosinophil Count", "Platelet Count", "Total Red Blood Cells", "ESR", "Peripheral Blood Film", "Reticulocyte Count", "Reticulocyte Count & Profile", "Packed Cell Volume", "Bleeding Time", "Clotting Time", "PT / INR", "APTT", "FDP", "D-Dimer", "Direct Coombs Test", "Indirect Coombs Test", "G-6-PD", "Sickling Test", "HPLC", "Hb Electrophoresis",
  "Blood Sugar — Random", "Blood Sugar — Fasting", "Blood Sugar — Post Prandial", "Blood Sugar — Glucose Tolerance", "Serum Urea", "Serum Creatinine", "Serum Uric Acid", "Serum Calcium", "Serum Phosphorus", "Serum Iron", "Serum TIBC", "Serum Total Protein / A:G Ratio", "Serum Electrolytes", "Ionic Calcium", "Lithium", "Serum Bilirubin Total", "Serum Bilirubin Direct", "SGOT / AST", "SGPT / ALT", "Alkaline Phosphatase", "Acid Phosphatase", "Serum LDH", "CPK-NAC", "CPK-MB", "GGT", "Serum Amylase", "Serum Lipase", "Total Lipid Profile", "Triglycerides", "Total Cholesterol", "HDL Cholesterol", "HbA1c", "Serum Ferritin", "Troponin T", "Troponin I", "CK-MB", "Myoglobin", "NT-proBNP", "CRP", "β-hCG", "Procalcitonin", "D-Dimer Quantitative", "Blood Gas Analysis / ABG", "CSF Examination", "Ascitic Fluid Examination", "Pleural Fluid Examination",
  "FT3", "FT4", "TSH", "Anti-TPO Antibody", "FSH", "LH", "Prolactin", "Beta-hCG", "Testosterone", "Cortisol", "Growth Hormone", "Parathyroid Hormone (PTH)", "Insulin", "Vitamin B12", "Folate", "Vitamin D3", "CEA", "AFP", "CA-125", "PSA", "Total IgE", "Thyroglobulin", "Estradiol", "IGF-1", "IGFBP-3", "ACTH", "Calcitonin", "C-Peptide", "DHEAS", "17-OH Progesterone", "AMH",
  "Hepatitis B Surface Antigen (HBsAg)", "Hepatitis B Surface Antibody", "Anti-HBc IgM", "HBeAg", "Anti-HBe", "Anti-HAV IgM", "Anti-HCV", "HEV IgM", "HIV Testing", "VDRL Qualitative", "VDRL Quantitative", "ASLO", "Rheumatoid Factor", "ANA", "Anti-dsDNA", "Dengue IgM / IgG", "TB IgM Antibody", "TB IgG Antibody", "TB IgA Antibody", "Complete TORCH Profile", "Toxoplasma IgM", "Toxoplasma IgG", "Rubella IgM", "Rubella IgG", "CMV IgM", "CMV IgG", "HSV IgM", "HSV IgG", "H. pylori IgM", "H. pylori IgG", "Scrub Typhus IgG", "Scrub Typhus IgM", "Chikungunya IgM", "Anti-D S DNA", "Chlamydia IgM", "Chlamydia IgG", "Chlamydia IgA", "EBV IgM", "EBV IgG",
  "Aerobic Bacterial Culture & Sensitivity — Blood", "Aerobic Bacterial Culture & Sensitivity — Pus", "Aerobic Bacterial Culture & Sensitivity — Semen", "Aerobic Bacterial Culture & Sensitivity — Sputum", "Aerobic Bacterial Culture & Sensitivity — Stool", "Urine Culture & Sensitivity", "CSF for Culture & Sensitivity", "Anaerobic Bacterial Culture", "Fungus Culture", "KOH Mount and Smear", "Gram Staining", "Albert / Neisser Staining", "Acid Fast Bacilli Stain", "Malarial Parasite", "Malaria Card Test", "Microfilaria", "Leishmania Detection", "Giardia Detection", "Trichomonas Detection", "Mycobacterial Culture & Identification", "BACTEC TB Culture", "TB Drug Sensitivity Testing", "MTBDR Plus", "MTBDRSL", "Xpert MTB", "Xpert Flu", "Xpert HCV", "Xpert HIV Viral Load", "Xpert HIV Qualitative", "Xpert HPV", "Xpert CT/NG", "Xpert C. difficile", "Xpert Norovirus", "GI Panel", "Respiratory Panel", "Sepsis Panel", "Encephalitis Panel",
  "FNAC — Pathology", "Biopsy", "Bone Marrow Aspiration and PBF", "Pap Smear", "Fluid for Cytology", "Urine for Cytology", "Sputum for Malignant Cells", "Ascitic Fluid for Malignant Cells", "Pleural Fluid for Malignant Cells", "Pericardial Fluid Cell Count", "CSF Cell Count", "Urine Examination Complete", "Microalbuminuria", "Semen Examination", "Stool Examination", "Gastric Aspirate",
  "ECG", "Holter Monitoring", "2-D Echocardiography", "TEE", "Treadmill Test", "Coronary Angiography", "Cerebral Angiography", "Venogram", "CT Scan", "CT Guided Biopsy", "MRI", "Ultrasound / Sonography", "Colour Doppler", "USG Guided Procedure", "USG Biophysical Profile", "USG Follicular Study", "USG Small Parts", "X-Ray", "Digital X-Ray", "X-Ray — 2 Views", "X-Ray — 3 Views", "X-Ray — 4 Views", "Dental X-Ray", "OPG", "DXA / DEXA", "Mammography", "Myelogram", "Barium Swallow", "Barium Meal", "Barium Enema", "IVP", "HSG", "Cystogram / Cystourethrogram", "Sinogram / Nephrostogram",
  "EEG", "Video EEG", "Ambulatory EEG", "EMG", "NCV", "NCV / EMG", "VEP", "BAER", "Evoked Response", "Repetitive Stimulation", "Polysomnography / Sleep Study", "Audiometry", "BERA", "Pulmonary Function Test (PFT)", "PFT Pre and Post", "Spirometry", "Diffusion Test", "Lung Volume", "FeNO", "Bronchoscopy", "Skin Prick Test", "Common Drug Allergy Test",
  "Polysomnography Test", "Nerve Conduction Study", "Electrodiagnostic Study", "Radiology / Imaging Consultation", "Other Investigation"
];

const links = [
  { label: "Dashboard", path: "/dashboard", icon: "⌂" },
  { label: "Patient Directory", path: "/patients", icon: "P" },
  { label: "Appointments", path: "/appointments", icon: "A" },
  { label: "OPD", path: "/opd", icon: "O" },
  { label: "Billing & Payments", path: "/billing", icon: "₹" },
];

function displayName(patient: Patient | null) {
  if (!patient) return "Patient";
  return String(patient.name || [patient.firstName, patient.lastName].filter(Boolean).join(" ") || "Patient");
}

function ageFromDob(dob?: string) {
  if (!dob) return "—";
  const birth = new Date(dob); if (Number.isNaN(birth.getTime())) return "—";
  const now = new Date(); let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth(); if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age >= 0 ? String(age) : "—";
}

export default function ConsultationPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const patientId = String(params.id);
  const opdVisitId = search.get("opdVisitId");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [department, setDepartment] = useState("—");
  const [doctor, setDoctor] = useState("—");
  const [tool, setTool] = useState<Tool>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [physicalFindings, setPhysicalFindings] = useState("");
  const [generalAdvice, setGeneralAdvice] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
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
        const patientData = await p.json(); setPatient(patientData);
        if (!opdVisitId) return;
        const v = await fetch(`/api/opd/${opdVisitId}`);
        if (!v.ok) throw new Error("Unable to load OPD visit.");
        const vd: Visit = await v.json(); setVisit(vd);
        fetch(`/api/opd/${opdVisitId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "IN_CONSULTATION" }) }).catch(() => undefined);
        const departmentResponse = await fetch("/api/departments");
        const deps: Department[] = departmentResponse.ok ? await departmentResponse.json() : [];
        setDepartments(deps);
        const departmentId = vd.departmentId ?? (vd.department ? Number(vd.department) : null);
        const doctorResponse = await fetch(departmentId ? `/api/doctors?departmentId=${departmentId}` : "/api/doctors");
        const docs: Doctor[] = doctorResponse.ok ? await doctorResponse.json() : [];
        setDoctors(docs);
        setDepartment(deps.find(x => x.id === Number(departmentId))?.name || "—");
        const d = docs.find(x => x.id === Number(vd.doctorId));
        setDoctor(d?.name || `${d?.firstName || ""} ${d?.lastName || ""}`.trim() || "—");
      } catch (e) { setError(e instanceof Error ? e.message : "Unable to load consultation."); }
      finally { setLoading(false); }
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
  const patientAddress = String(patient?.address || patient?.currentAddress || patient?.permanentAddress || "—");
  const patientIdDisplay = String(patient?.patientId || patient?.id || patientId);

  function updateVital(i: number, value: string) { setVitals(v => v.map((x, n) => n === i ? { ...x, value } : x)); }
  function updateMedicine(id: number, key: keyof Medicine, value: string) { setMedicines(m => m.map(x => x.id === id ? { ...x, [key]: value } : x)); }
  function addInvestigation(name: string) { setSelectedInvestigations(v => [...v, name]); setInvestigationInput(""); }
  const hasVitals = vitals.some(v => v.value.trim());
  const hasInvestigations = selectedInvestigations.length > 0;
  const hasPhysical = physicalFindings.trim().length > 0;
  const hasAdvice = generalAdvice.trim().length > 0;

  async function save() {
    setSaving(true); setError("");
    try {
      const clinicalNotes = [
        physicalFindings ? `Physical / Clinical Findings:\n${physicalFindings}` : "",
        hasVitals ? `Vitals:\n${vitals.filter(x => x.value.trim()).map(x => `${x.label}: ${x.value} ${x.unit}`).join(" | ")}` : "",
        hasInvestigations ? `Investigations:\n${selectedInvestigations.join(", ")}` : "",
        generalAdvice ? `General Advice:\n${generalAdvice}` : "",
      ].filter(Boolean).join("\n\n");
      const response = await fetch("/api/patients/encounters", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patientId, chiefComplaint, diagnosis, clinicalNotes, treatmentPlan, followUpDate: followUpDate || null, opdVisitId: opdVisitId ? Number(opdVisitId) : null }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to save consultation.");
      if (opdVisitId) await fetch(`/api/opd/${opdVisitId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "COMPLETED" }) });
      router.push(`/patients/profile/${patientId}/opd-slip`);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save consultation."); setSaving(false); }
  }

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#f5f7fa]"><div className="rounded-2xl bg-white p-8 text-center shadow-xl"><div className="mx-auto h-14 w-14 overflow-hidden rounded-2xl"><Image src="/serawat-logo.png" alt="SAMS" width={76} height={44} className="h-full w-full object-contain" /></div><p className="mt-3 text-sm font-bold text-slate-500">Loading consultation…</p></div></main>;

  return (
    <main className="consultation-screen min-h-screen bg-[#eef2f7] text-slate-900">
      <header className="no-print sticky top-0 z-40 border-b border-[#d7c08a]/30 bg-[#071f46] text-white shadow-lg">
        <div className="mx-auto flex min-h-[92px] max-w-[1600px] items-center justify-between gap-5 px-5 py-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <button type="button" onClick={() => router.back()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-xl font-black">←</button>
            <div className="h-14 w-20 shrink-0"><Image src="/serawat-logo.png" alt="SAMS" width={76} height={44} className="h-full w-full object-contain" priority /></div>
            <div className="min-w-0 border-l border-white/15 pl-4">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#f1d27a]">SAMS · Clinical Record</p>
              <h1 className="mt-1 truncate text-xl font-semibold tracking-tight sm:text-2xl" style={{ fontFamily: "'Cormorant Garamond','Baskerville','Times New Roman',serif" }}>Serawat Advanced Musculoskeletal, Joint &amp; Spine Centre</h1>
              <p className="mt-0.5 text-[11px] font-medium text-blue-100">Consultation / Clinical Record</p>
            </div>
          </div>
          <div className="hidden text-right sm:block"><p className="text-[9px] uppercase tracking-[0.18em] text-blue-200">Patient</p><p className="text-sm font-black">{patientName} · {patientIdDisplay}</p></div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-7 lg:px-9">
        <section className="consultation-paper overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl">
          <section className="border-b border-slate-200 bg-[#fbfaf7] px-5 py-5 sm:px-8">
            <div className="flex items-center justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#0b63ce]">Patient Details</p><h2 className="mt-1 text-2xl font-semibold text-[#082b61]" style={{ fontFamily: "'Cormorant Garamond','Baskerville','Times New Roman',serif" }}>{patientName}</h2></div><span className="rounded-full border border-[#d4af37]/40 bg-[#fffaf0] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#8b6a17]">OPD · #{visit?.tokenNumber || visit?.id || "—"}</span></div>
            <div className="mt-4 grid gap-x-6 gap-y-3 text-xs sm:grid-cols-2 lg:grid-cols-4"><div><span className="label">Patient ID</span><strong>{patientIdDisplay}</strong></div><div><span className="label">Age / Sex</span><strong>{ageFromDob(patientDob)} / {String(patient?.gender || "—")}</strong></div><div><span className="label">Mobile</span><strong>{patientPhone}</strong></div><div><span className="label">DOB</span><strong>{patientDob ? new Date(patientDob).toLocaleDateString("en-IN") : "—"}</strong></div><div className="lg:col-span-2"><span className="label">Address</span><strong>{patientAddress}</strong></div><div><span className="label">Department</span><strong>{department}</strong></div><div><span className="label">Consultant</span><strong>{doctor}</strong></div></div>
          </section>

          <div className="grid lg:grid-cols-[220px_minmax(0,1fr)]">
            <aside className="no-print border-b border-slate-200 bg-[#f8fafc] p-4 lg:border-b-0 lg:border-r lg:p-5">
              <p className="px-2 text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Clinical Tools</p>
              <div className="mt-3 space-y-2">
                {[{key:"vitals",label:"Vitals",icon:"🩺"},{key:"investigation",label:"Investigation",icon:"🔬"},{key:"physical",label:"Physical / Clinical",icon:"🦴"},{key:"advice",label:"General Advice",icon:"📋"}].map(x => <button key={x.key} type="button" onClick={() => setTool(tool === x.key ? null : x.key as Tool)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-black transition ${tool === x.key ? "bg-[#082b61] text-white shadow-lg" : "bg-white text-slate-600 hover:bg-blue-50 hover:text-[#0b63ce]"}`}><span>{x.icon}</span>{x.label}<span className="ml-auto">{tool === x.key ? "−" : "+"}</span></button>)}
              </div>
              {tool === "vitals" && <div className="tool-panel">{vitals.map((v,i)=><label key={v.label} className="tool-field"><span>{v.label}</span><div><input value={v.value} onChange={e => updateVital(i,e.target.value)} /><b>{v.unit}</b></div></label>)}</div>}
              {tool === "investigation" && <div className="tool-panel"><div className="relative"><input value={investigationInput} onChange={e => setInvestigationInput(e.target.value)} placeholder="Type initials / name…" className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-blue-500" />{suggestions.length > 0 && <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-auto rounded-xl border border-slate-200 bg-white shadow-2xl">{suggestions.map(x => <button type="button" key={x} onClick={() => addInvestigation(x)} className="block w-full border-b border-slate-100 px-3 py-2.5 text-left text-[11px] font-semibold text-slate-700 hover:bg-blue-50">{x}</button>)}</div>}</div><div className="mt-2 flex flex-wrap gap-1.5">{selectedInvestigations.map(x => <button type="button" key={x} onClick={() => setSelectedInvestigations(v => v.filter(i => i !== x))} className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-bold text-[#0b63ce]">{x} ×</button>)}</div></div>}
              {tool === "physical" && <div className="tool-panel"><textarea value={physicalFindings} onChange={e => setPhysicalFindings(e.target.value)} rows={8} placeholder="Physical / clinical examination findings…" className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs outline-none focus:border-blue-500" /></div>}
              {tool === "advice" && <div className="tool-panel"><textarea value={generalAdvice} onChange={e => setGeneralAdvice(e.target.value)} rows={7} placeholder="General advice / precautions…" className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs outline-none focus:border-blue-500" /></div>}
            </aside>

            <section className="min-w-0 p-5 sm:p-8">
              <div className="grid gap-5 lg:grid-cols-2">
                <section className="clinical-box"><p className="section-label">Chief Complaint</p><textarea value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} rows={5} placeholder="Reason for consultation / presenting complaints…" /></section>
                <section className="clinical-box"><p className="section-label">Clinical Diagnosis</p><textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} rows={5} placeholder="Diagnosis / differential diagnosis…" /></section>
              </div>

              <section className="clinical-box mt-5"><p className="section-label">Treatment / Plan</p><textarea value={treatmentPlan} onChange={e => setTreatmentPlan(e.target.value)} rows={6} placeholder="Treatment, procedures, rehabilitation plan, investigations to be reviewed, and follow-up instructions…" /></section>

              <section className="clinical-box mt-5"><div className="flex items-center justify-between"><p className="section-label">Medicines / Prescription</p><button type="button" onClick={() => setMedicines(v => [...v, { id: Date.now(), name:"", dose:"", frequency:"", food:"", duration:"" }])} className="no-print rounded-lg bg-[#082b61] px-3 py-2 text-[10px] font-black text-white">+ Add Medicine</button></div><div className="mt-3 space-y-2">{medicines.map((m,i) => <div key={m.id} className="grid gap-2 rounded-xl bg-slate-50 p-2.5 sm:grid-cols-5"><input value={m.name} onChange={e => updateMedicine(m.id,"name",e.target.value)} placeholder={`Medicine ${i+1}`} /><input value={m.dose} onChange={e => updateMedicine(m.id,"dose",e.target.value)} placeholder="Dose" /><input value={m.frequency} onChange={e => updateMedicine(m.id,"frequency",e.target.value)} placeholder="Frequency" /><input value={m.food} onChange={e => updateMedicine(m.id,"food",e.target.value)} placeholder="Food" /><input value={m.duration} onChange={e => updateMedicine(m.id,"duration",e.target.value)} placeholder="Duration" /></div>)}</div></section>

              {(hasVitals || hasInvestigations || hasPhysical || hasAdvice) && <section className="print-only mt-4 space-y-2">{hasVitals && <div><p className="print-label">Vitals</p><p>{vitals.filter(v=>v.value.trim()).map(v => `${v.label}: ${v.value} ${v.unit}`).join("   |   ")}</p></div>}{hasPhysical && <div><p className="print-label">Physical / Clinical Findings</p><p className="whitespace-pre-line">{physicalFindings}</p></div>}{hasInvestigations && <div><p className="print-label">Investigations Advised</p><p>{selectedInvestigations.join("   •   ")}</p></div>}{hasAdvice && <div><p className="print-label">General Advice</p><p className="whitespace-pre-line">{generalAdvice}</p></div>}</section>}

              {error && <div className="no-print mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
              <div className="mt-6 flex items-end justify-between gap-6 border-t border-slate-200 pt-5"><div><label className="block text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Follow-up Date</label><input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} className="no-print mt-2 rounded-lg border border-slate-200 p-2 text-xs" /><p className="print-followup hidden text-sm font-bold text-[#082b61]">{followUpDate ? new Date(followUpDate).toLocaleDateString("en-IN") : "—"}</p></div><div className="w-56 text-center"><div className="h-8 border-b border-slate-400"/><p className="mt-1 text-xs font-black text-[#082b61]">Consultant</p><p className="text-[10px] font-semibold text-slate-500">{doctor}</p><p className="no-print mt-1 text-[9px] text-slate-400">Signature</p></div></div>
              <div className="no-print mt-5 flex justify-end gap-3 border-t border-slate-200 pt-4"><button type="button" onClick={() => window.print()} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-black text-slate-600">Print A4</button><button type="button" onClick={save} disabled={saving} className="rounded-xl bg-[#0b63ce] px-6 py-3 text-xs font-black text-white disabled:opacity-60">{saving ? "Saving…" : "Save Consultation"}</button></div>
            </section>
          </div>
        </section>
      </div>

      <style jsx global>{`
        .label{display:block;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.12em;color:#94a3b8;margin-bottom:3px}.clinical-box{border:1px solid #dfe4ea;border-radius:18px;background:#fff;padding:16px}.clinical-box textarea{width:100%;border:1px solid #e2e8f0;border-radius:12px;padding:11px;font-size:13px;line-height:1.55;outline:none;resize:vertical}.clinical-box textarea:focus{border-color:#0b63ce}.clinical-box input{border:1px solid #e2e8f0;border-radius:8px;padding:7px;font-size:11px;outline:none;width:100%}.section-label{font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.2em;color:#0b63ce}.tool-panel{margin-top:12px;border-top:1px solid #e2e8f0;padding-top:12px}.tool-field{display:block;margin-bottom:8px}.tool-field>span{display:block;font-size:8px;font-weight:900;color:#64748b;margin-bottom:3px}.tool-field>div{display:flex;align-items:center;gap:5px}.tool-field input{width:100%;min-width:0;border:1px solid #e2e8f0;border-radius:7px;padding:6px;font-size:10px}.tool-field b{font-size:8px;color:#0b63ce;white-space:nowrap}.print-only{display:none}.print-label{font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:.12em;color:#082b61;margin-bottom:2px}
        @media print{ @page{size:A4 portrait;margin:7mm} html,body{background:#fff!important;color:#111827!important} body{font-family:Arial,sans-serif!important} .no-print{display:none!important} .print-only{display:block!important} .print-followup{display:block!important} .consultation-screen{background:#fff!important;min-height:auto!important} .consultation-paper{width:196mm!important;max-width:196mm!important;margin:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;overflow:visible!important} .consultation-paper>section:first-child{padding:4mm 5mm!important} .consultation-paper .grid.lg\:grid-cols-\[220px_minmax\(0\,1fr\)\]{display:block!important} .consultation-paper .lg\:grid-cols-\[220px_minmax\(0\,1fr\)\]>section{padding:4mm 5mm!important} .clinical-box{border:1px solid #cbd5e1!important;border-radius:4px!important;padding:3mm!important;break-inside:avoid}.clinical-box textarea{border:0!important;padding:0!important;min-height:0!important;height:auto!important;font-size:8.2pt!important;line-height:1.25!important;overflow:visible!important;resize:none!important}.clinical-box input{border:0!important;padding:0!important;font-size:7.5pt!important}.section-label{font-size:7pt!important;margin-bottom:2mm!important}.label{font-size:6.5pt!important}.consultation-paper h2{font-size:17pt!important}.consultation-paper header h1{font-size:16pt!important}.consultation-paper .text-sm{font-size:8pt!important}.consultation-paper .text-xs{font-size:7pt!important}.consultation-paper .mt-5{margin-top:3mm!important}.consultation-paper .p-5,.consultation-paper .sm\:p-8{padding:0!important}.consultation-paper .gap-5{gap:3mm!important}.consultation-paper .space-y-2>*+*{margin-top:2mm!important}.print-only{font-size:7.5pt!important;line-height:1.25!important}.print-only>div{border-top:1px solid #dbe2ea;padding-top:2mm;margin-top:2mm}.print-label{font-size:6.5pt!important}.consultation-paper .border-t{border-top-color:#cbd5e1!important}.consultation-paper .h-8{height:7mm!important}.consultation-paper .w-56{width:45mm!important} }
      `}</style>
    </main>
  );
}
