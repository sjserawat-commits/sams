"use client";
import { useSearchParams } from "next/navigation";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function NewVisitPage() {
  const searchParams = useSearchParams();
  const opdVisitId = searchParams.get("opdVisitId");
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const patientId = params.id;

  const [chiefComplaint, setChiefComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!opdVisitId) return;

    fetch(`/api/opd/${opdVisitId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "IN_CONSULTATION" }),
    }).catch(() => {
      // The clinical form can still be used if the queue status update fails.
    });
  }, [opdVisitId]);

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
          opdVisitId: opdVisitId ? Number(opdVisitId) : null,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create encounter");

      if (opdVisitId) {
        await fetch(`/api/opd/${opdVisitId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "COMPLETED" }),
        });
      }

      router.push(`/clinical?patientId=${patientId}&encounterId=${data.id}&opdVisitId=${opdVisitId ?? ""}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create encounter");
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f8fc] px-5 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <a href={`/patients/profile/${patientId}`} className="text-sm font-bold text-[#0b63ce]">
          ← Back to Patient Profile
        </a>

        <div className="mt-5 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(8,43,97,0.06)] sm:p-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">SAMS · Clinical Workspace</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#082b61]">New Visit</h1>
            <p className="mt-2 text-sm text-slate-500">Create a clinical encounter for patient #{patientId}.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="text-sm font-black text-[#082b61]">Chief Complaint</label>
              <textarea
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                rows={3}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Reason for today's visit"
              />
            </div>

            <div>
              <label className="text-sm font-black text-[#082b61]">Diagnosis</label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                rows={3}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Clinical diagnosis / differential diagnosis"
              />
            </div>

            <div>
              <label className="text-sm font-black text-[#082b61]">Clinical Notes</label>
              <textarea
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                rows={6}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="History, examination and other clinical documentation"
              />
            </div>

            <div>
              <label className="text-sm font-black text-[#082b61]">Treatment Plan</label>
              <textarea
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Treatment, investigations, advice and plan"
              />
            </div>

            <div>
              <label className="text-sm font-black text-[#082b61]">Follow-up Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="mt-2 rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-6">
              <a
                href={`/patients/profile/${patientId}`}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600"
              >
                Cancel
              </a>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#0b63ce] px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-900/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save Visit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
