"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Patient = { id: number; patientId: string; firstName: string; lastName: string };
type Department = { id: number; name: string; code: string };

export default function NewVisitPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [patientId, setPatientId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMasters, setLoadingMasters] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMasters() {
      setLoadingMasters(true);
      setError("");
      try {
        const [patientsResponse, departmentsResponse] = await Promise.all([
          fetch("/api/patients", { cache: "no-store" }),
          fetch("/api/departments", { cache: "no-store" }),
        ]);

        const patientsData = await patientsResponse.json();
        const departmentsData = await departmentsResponse.json();

        if (!patientsResponse.ok) {
          throw new Error(patientsData?.error || "Unable to load patients.");
        }
        if (!departmentsResponse.ok) {
          throw new Error(departmentsData?.error || "Unable to load Department Master.");
        }

        setPatients(Array.isArray(patientsData) ? patientsData : patientsData?.patients ?? []);
        setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load visit masters.");
      } finally {
        setLoadingMasters(false);
      }
    }

    loadMasters();
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
        body: JSON.stringify({ patientId, departmentId }),
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
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)} required disabled={loadingMasters} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:opacity-60">
              <option value="">{loadingMasters ? "Loading patients…" : "Select patient"}</option>
              {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.firstName} {patient.lastName} · {patient.patientId}</option>)}
            </select>

            <label className="mt-7 block text-sm font-bold text-[#082b61]">Speciality</label>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required disabled={loadingMasters || departments.length === 0} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:opacity-60">
              <option value="">
                {loadingMasters ? "Loading Department Master…" : departments.length === 0 ? "No active speciality found" : "Select speciality"}
              </option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}{department.code ? ` · ${department.code}` : ""}
                </option>
              ))}
            </select>
            <p className="mt-2 text-[11px] font-medium text-slate-400">Speciality is loaded from the active Department Master.</p>

            {message && <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">{message}</div>}
            {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

            <button disabled={loading || loadingMasters || !patientId || !departmentId} className="mt-8 w-full rounded-xl bg-[#082b61] px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:bg-[#0b63ce] disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? "Creating visit…" : "Create Visit"}
            </button>
          </form>

          <aside className="rounded-[2rem] border border-blue-100 bg-[#f7faff] p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">Workflow</p>
            <h2 className="mt-2 text-xl font-black">Clinical visit</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Create the visit first. Clinical documentation can then be attached to the same underlying ClinicalVisit record.</p>
            <div className="mt-6 border-t border-blue-100 pt-5 text-xs font-semibold leading-5 text-slate-500">SAMS uses the active Department Master for speciality selection while retaining the existing ClinicalEncounter model in the backend.</div>
          </aside>
        </div>
      </div>
    </main>
  );
}
