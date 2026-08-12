"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Patient = {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  patientId?: string;
  gender?: string;
  age?: number;
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/patients")
      .then((r) => r.json())
      .then((data) => setPatients(Array.isArray(data) ? data : data?.patients ?? []))
      .catch(() => setPatients([]));
  }, []);

  const filtered = patients.filter((patient) => {
    const name = patient.name || [patient.firstName, patient.lastName].filter(Boolean).join(" ");
    return `${name} ${patient.patientId ?? ""}`.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <main className="min-h-screen bg-[#f5f8fc] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-5 sm:px-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">SAMS · Clinical Operations</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-[#082b61]">Patients</h1>
            <p className="mt-1 text-sm text-slate-500">Patient records, demographics and clinical history.</p>
          </div>
          <Link href="/patients/new" className="rounded-xl bg-[#0b63ce] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-[#0958b5]">+ Register Patient</Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] space-y-6 px-5 py-7 sm:px-8 sm:py-9">
        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0b63ce] via-[#0a56b4] to-[#082b61] p-7 text-white shadow-xl shadow-blue-900/15 sm:p-9">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">Patient management</span>
              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">One workspace for every patient.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">Find records quickly, review patient information and move directly into clinical care.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">Total records</p><p className="mt-1 text-3xl font-black tabular-nums">{patients.length}</p></div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Total patients</p><p className="mt-2 text-3xl font-black text-[#082b61]">{patients.length}</p><p className="mt-1 text-xs text-slate-400">All registered records</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Search</p><p className="mt-2 text-3xl font-black text-[#0b63ce]">{filtered.length}</p><p className="mt-1 text-xs text-slate-400">Matching records</p></div>
          <div className="rounded-2xl border border-[#bfe3cf] bg-[#f7fcf9] p-5 shadow-sm"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700/60">Workspace</p><p className="mt-2 text-xl font-black text-emerald-800">Operational</p><p className="mt-1 text-xs text-emerald-700/70">Patient service available</p></div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(8,43,97,0.06)] sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">Patient directory</p><h2 className="mt-1 text-2xl font-black tracking-tight text-[#082b61]">Find a patient</h2></div>
            <div className="relative w-full sm:max-w-sm"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or patient ID" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50" /></div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
            <div className="hidden grid-cols-[1fr_160px_120px_110px] gap-4 bg-slate-50 px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 sm:grid"><span>Patient</span><span>Patient ID</span><span>Gender</span><span>Action</span></div>
            {filtered.length === 0 ? <div className="px-5 py-12 text-center"><p className="text-sm font-bold text-slate-600">No patient records found</p><p className="mt-1 text-xs text-slate-400">Register a patient or change your search.</p></div> : filtered.slice(0, 20).map((patient) => { const name = patient.name || [patient.firstName, patient.lastName].filter(Boolean).join(" ") || "Unnamed patient"; return <div key={patient.id} className="grid gap-3 border-t border-slate-100 px-5 py-4 transition hover:bg-blue-50/40 sm:grid-cols-[1fr_160px_120px_110px] sm:items-center sm:gap-4"><div><p className="font-bold text-[#082b61]">{name}</p><p className="text-xs text-slate-400">Patient record</p></div><span className="text-sm font-semibold text-slate-600">{patient.patientId ?? patient.id}</span><span className="text-sm text-slate-500">{patient.gender ?? "—"}</span><Link href={`/patients/profile/${patient.id}`} className="text-sm font-bold text-[#0b63ce] hover:underline">View →</Link></div>; })}
          </div>
        </section>
      </div>
    </main>
  );
}
