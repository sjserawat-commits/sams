"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function EncounterForm({ patientId, patientName }: { patientId: number; patientName: string }) {
  const router = useRouter();
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/patients/encounters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          chiefComplaint,
          diagnosis,
          clinicalNotes,
          treatmentPlan,
          followUpDate: followUpDate || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save encounter.");

      router.push(`/patients/profile/${patientId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save encounter.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl bg-blue-50 p-4 text-sm font-semibold text-blue-900">Patient: {patientName}</div>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

      <Field label="Chief Complaint">
        <textarea value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} rows={3} placeholder="Main reason for today's visit" className="input" />
      </Field>

      <Field label="Diagnosis">
        <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={3} placeholder="Clinical diagnosis / impression" className="input" />
      </Field>

      <Field label="Clinical Notes">
        <textarea value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)} rows={5} placeholder="Examination findings, relevant history and assessment" className="input" />
      </Field>

      <Field label="Treatment Plan">
        <textarea value={treatmentPlan} onChange={(e) => setTreatmentPlan(e.target.value)} rows={5} placeholder="Medication, rehabilitation, investigations and advice" className="input" />
      </Field>

      <Field label="Follow-up Date">
        <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className="input" />
      </Field>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => router.push(`/patients/profile/${patientId}`)} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
        <button disabled={saving} type="submit" className="rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving…" : "Save Encounter"}</button>
      </div>

      <style jsx>{`.input{width:100%;border:1px solid rgb(203 213 225);border-radius:.75rem;padding:.75rem .875rem;font-size:.875rem;outline:none}.input:focus{border-color:rgb(37 99 235);box-shadow:0 0 0 3px rgb(219 234 254)}`}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-slate-800">{label}</span>{children}</label>;
}
