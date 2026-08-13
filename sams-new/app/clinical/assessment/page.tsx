"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const sections = ["History", "Physical Examination", "Functional Assessment", "PM&R Assessment", "Clinical Impression", "Management & Rehabilitation"];

type AssessmentData = {
  standard?: string;
  sections: Record<string, Record<string, string>>;
};

const fieldMap: Record<string, { label: string; key: string; large?: boolean }[]> = {
  History: [
    { label: "Chief Complaint", key: "chiefComplaint" },
    { label: "History of Present Illness", key: "historyPresentIllness", large: true },
    { label: "Past Medical History", key: "pastMedicalHistory" },
    { label: "Past Surgical History", key: "pastSurgicalHistory" },
  ],
  "Physical Examination": [
    { label: "General Examination", key: "generalExamination" },
    { label: "Musculoskeletal Examination", key: "musculoskeletalExamination" },
    { label: "Neurological Examination", key: "neurologicalExamination" },
    { label: "Pain Assessment", key: "painAssessment" },
    { label: "Detailed Examination Findings", key: "detailedFindings", large: true },
  ],
  "Functional Assessment": [
    { label: "Mobility", key: "mobility" },
    { label: "Activities of Daily Living", key: "adl" },
    { label: "Upper Limb Function", key: "upperLimbFunction" },
    { label: "Lower Limb Function", key: "lowerLimbFunction" },
    { label: "Functional Limitations", key: "functionalLimitations", large: true },
  ],
  "PM&R Assessment": [
    { label: "Impairments", key: "impairments" },
    { label: "Activity Limitations", key: "activityLimitations" },
    { label: "Participation Restrictions", key: "participationRestrictions" },
    { label: "Rehabilitation Potential", key: "rehabilitationPotential" },
    { label: "PM&R Assessment Summary", key: "pmrSummary", large: true },
  ],
  "Clinical Impression": [
    { label: "Primary Diagnosis / Impression", key: "primaryDiagnosis" },
    { label: "Differential Diagnosis", key: "differentialDiagnosis", large: true },
    { label: "Clinical Reasoning", key: "clinicalReasoning", large: true },
  ],
  "Management & Rehabilitation": [
    { label: "Treatment Plan", key: "treatmentPlan" },
    { label: "Rehabilitation Plan", key: "rehabilitationPlan" },
    { label: "Assistive Devices", key: "assistiveDevices" },
    { label: "Prosthetics & Orthotics", key: "prostheticsOrthotics" },
    { label: "Goals & Follow-up", key: "goalsFollowUp", large: true },
  ],
};

export default function AssessmentPage() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");
  const encounterId = searchParams.get("encounterId");
  const standard = searchParams.get("standard") || undefined;
  const [activeSection, setActiveSection] = useState("History");
  const [data, setData] = useState<AssessmentData>({ sections: {} });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!encounterId) return;
    fetch(`/api/patients/encounters/${encounterId}`)
      .then((response) => response.ok ? response.json() : null)
      .then((encounter) => {
        if (!encounter?.assessmentData) return;
        try { setData(JSON.parse(encounter.assessmentData) as AssessmentData); } catch { /* ignore malformed legacy data */ }
      })
      .catch(() => undefined);
  }, [encounterId]);

  function updateField(key: string, value: string) {
    setData((current) => ({
      ...current,
      standard: current.standard || standard,
      sections: {
        ...current.sections,
        [activeSection]: { ...(current.sections[activeSection] || {}), [key]: value },
      },
    }));
  }

  async function saveAssessment() {
    setError("");
    setMessage("");
    if (!encounterId) {
      setError("Open this assessment from a clinical encounter so the assessment can be saved to that encounter.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`/api/patients/encounters/${encounterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentData: { ...data, standard: data.standard || standard } }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save assessment");
      setMessage("Assessment saved to the current clinical encounter.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save assessment");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5 sm:p-7">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-3xl bg-[#082b61] shadow-lg">
          <div className="px-6 py-8 text-white sm:px-9 sm:py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-100">Clinical Workspace</span>
                <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Assessment & PM&R</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">Structured assessment for clinical findings, function, rehabilitation needs and management planning.</p>
                {encounterId && <p className="mt-2 text-xs font-semibold text-blue-200">Current encounter #{encounterId}{standard ? ` · ${standard}` : ""}</p>}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={patientId && encounterId ? `/clinical/assessment/standard?patientId=${patientId}&encounterId=${encounterId}` : "/clinical/assessment/standard"} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#082b61] shadow-sm hover:bg-blue-50">Standard Assessments</Link>
                <Link href="/clinical" className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/20">← Clinical</Link>
              </div>
            </div>
          </div>
        </section>

        {!encounterId && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">Assessment is in standalone mode. Open it from a clinical encounter to save the assessment against that encounter.</div>}
        {message && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">{message}</div>}
        {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</div>}

        <div className="mt-7 grid gap-6 lg:grid-cols-[250px_1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">Assessment Workflow</p>
            <div className="space-y-1">{sections.map((section) => <button key={section} onClick={() => setActiveSection(section)} className={`w-full rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${activeSection === section ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>{section}</button>)}</div>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5 sm:px-8"><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Current Section</p><h2 className="mt-1 text-2xl font-bold text-slate-900">{activeSection}</h2></div>
            <div className="space-y-6 p-6 sm:p-8">
              <div className="grid gap-5 md:grid-cols-2">
                {fieldMap[activeSection].map((field) => <label key={field.key} className="block"><span className="mb-2 block text-sm font-semibold text-slate-800">{field.label}</span><textarea value={data.sections[activeSection]?.[field.key] || ""} onChange={(event) => updateField(field.key, event.target.value)} rows={field.large ? 5 : 3} placeholder={`Document ${field.label.toLowerCase()}...`} className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100" /></label>)}
              </div>
              <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                {patientId && encounterId ? <Link href={`/patients/profile/${patientId}/encounters/${encounterId}`} className="text-sm font-bold text-[#0b63ce]">← Back to Encounter</Link> : <span />}
                <button type="button" onClick={saveAssessment} disabled={saving} className="rounded-xl bg-[#082b61] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0b397e] disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving…" : "Save Assessment"}</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
