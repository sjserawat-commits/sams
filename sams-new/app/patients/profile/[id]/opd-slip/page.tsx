"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Patient = {
  id: number;
  patientId: string;
  firstName: string;
  lastName: string;
  gender?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
};

export default function OPDSlipPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [department, setDepartment] = useState("");
  const [doctor, setDoctor] = useState("");
  const [visitType, setVisitType] = useState("New");
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/patients/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Unable to load patient");
        return res.json();
      })
      .then((data) => setPatient(data))
      .catch(() => setError("Unable to load patient details."));
  }, [params.id]);

  function createOPDSlip() {
    setSaving(true);
    setError("");

    if (!department.trim()) {
      setError("Please select a department.");
      setSaving(false);
      return;
    }

    const opdSlipNumber = `OPD-${Date.now()}`;

    sessionStorage.setItem(
      `opd-slip-${params.id}`,
      JSON.stringify({
        opdSlipNumber,
        patientId: params.id,
        department,
        doctor,
        visitType,
        token,
        createdAt: new Date().toISOString(),
      })
    );

    router.push(`/patients/profile/${params.id}/encounters/new`);
  }

  if (!patient && !error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f8fc]">
        <p className="text-sm font-semibold text-slate-500">
          Loading patient…
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f8fc] px-5 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => router.push(`/patients/profile/${params.id}`)}
          className="text-sm font-bold text-[#0b63ce]"
        >
          ← Back to Patient Profile
        </button>

        <section className="mt-5 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0b63ce] via-[#0a56b4] to-[#082b61] p-7 text-white shadow-xl sm:p-9">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">
            SAMS · OPD
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Create OPD Slip
          </h1>
          <p className="mt-2 text-sm text-blue-100">
            Create today's outpatient visit before starting the clinical
            consultation.
          </p>
        </section>

        {patient && (
          <section className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">
              Patient Details
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs font-bold text-slate-400">Patient</p>
                <p className="mt-1 font-black text-[#082b61]">
                  {patient.firstName} {patient.lastName}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400">Patient ID</p>
                <p className="mt-1 font-bold text-slate-700">
                  {patient.patientId}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400">Gender</p>
                <p className="mt-1 font-bold text-slate-700">
                  {patient.gender || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400">Mobile</p>
                <p className="mt-1 font-bold text-slate-700">
                  {patient.phone || "—"}
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">
            Visit Details
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-black text-[#082b61]">
              Department / Specialty
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none focus:border-blue-400 focus:bg-white"
              >
                <option value="">Select department</option>
                <option>General Medicine</option>
                <option>Orthopaedics</option>
                <option>Neurology</option>
                <option>Paediatrics</option>
                <option>General Surgery</option>
                <option>Physiotherapy</option>
              </select>
            </label>

            <label className="text-sm font-black text-[#082b61]">
              Consultant / Doctor
              <input
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                placeholder="Doctor name"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none focus:border-blue-400 focus:bg-white"
              />
            </label>

            <label className="text-sm font-black text-[#082b61]">
              Visit Type
              <select
                value={visitType}
                onChange={(e) => setVisitType(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none focus:border-blue-400 focus:bg-white"
              >
                <option>New</option>
                <option>Follow-up</option>
              </select>
            </label>

            <label className="text-sm font-black text-[#082b61]">
              Token / Queue Number
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Optional"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none focus:border-blue-400 focus:bg-white"
              />
            </label>
          </div>
        </section>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={() => router.push(`/patients/profile/${params.id}`)}
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600"
          >
            Cancel
          </button>

          <button
            onClick={createOPDSlip}
            disabled={saving}
            className="rounded-xl bg-[#0b63ce] px-7 py-3 text-sm font-black text-white shadow-lg disabled:opacity-60"
          >
            {saving ? "Creating…" : "Create OPD Slip →"}
          </button>
        </div>
      </div>
    </main>
  );
}
