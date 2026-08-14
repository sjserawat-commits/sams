"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Patient = { id: number; patientId: string; firstName: string; lastName: string };

const specialities = [
  "PM&R / Rehabilitation",
  "Orthopaedics",
  "Spine",
  "Pain Medicine",
  "Physiotherapy",
  "Occupational Therapy",
  "Sports Medicine",
  "General Consultation",
];

export default function NewVisitPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/patients")
      .then((response) => response.json())
      .then((data) => setPatients(Array.isArray(data) ? data : data?.patients ?? []))
      .catch(() => setError("Unable to load patients."));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, speciality }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to create visit.");

      setMessage(`Visit ${data.id} created successfully.`);
      router.push(`/patients/profile/${data.patient.id}/encounters/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create visit.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#082b61]">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-5 sm:px-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">SAMS · Clinical Operations</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">New Visit</h1>
            <p className="mt-1 text-sm text-slate-500">Start a clinical visit for an existing patient.</p>
          </div>
          <Link href="/patients" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-[#082b61]">Patients</Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <form onSubmit={submit} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_15px_50px_rgba(8,43,97,0.06)] sm:p-8">
            <div className="mb-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#0b63ce]">
              <span className="rounded-full bg-blue-50 px-3 py-1.5">01 Patient</span>
              <span className="text-slate-300">→</span>
              <span className="rounded-full bg-blue-50 px-3 py-1.5">02 Speciality</span>
              <span className="text-slate-300">→</span>
              <span className="rounded-full bg-blue-50 px-3 py-1.5">03 Create Visit</span>
            </div>

            <label className="block text-sm font-bold text-[#082b61]">Patient</label>
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)} required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50">
              <option value="">Select patient</option>
              {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.firstName} {patient.lastName} · {patient.patientId}</option>)}
            </select>

            <label className="mt-7 block text-sm font-bold text-[#082b61]">Speciality</label>
            <select value={speciality} onChange={(e) => setSpeciality(e.target.value)} required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50">
              <option value="">Select speciality</option>
              {specialities.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>

            {message && <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">{message}</div>}
            {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

            <button disabled={loading} className="mt-8 w-full rounded-xl bg-[#082b61] px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:bg-[#0b63ce] disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? "Creating visit…" : "Create Visit"}
            </button>
          </form>

          <aside className="rounded-[2rem] border border-blue-100 bg-[#f7faff] p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">Workflow</p>
            <h2 className="mt-2 text-xl font-black">Clinical visit</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Create the visit first. Clinical documentation can then be attached to the same underlying ClinicalVisit record.</p>
            <div className="mt-6 border-t border-blue-100 pt-5 text-xs font-semibold leading-5 text-slate-500">SAMS uses “Visit” in the clinical interface while retaining the existing ClinicalVisit model in the backend.</div>
          </aside>
        </div>
      </div>
    </main>
  );
}
