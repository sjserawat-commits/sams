"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Patient = { id: string; firstName?: string; lastName?: string; patientId?: string; gender?: string; phone?: string; dateOfBirth?: string };

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState("");
  useEffect(() => { fetch("/api/patients").then((r) => r.json()).then((data) => setPatients(Array.isArray(data) ? data : [])).catch(() => setPatients([])); }, []);
  const filtered = useMemo(() => { const q = query.trim().toLowerCase(); if (!q) return patients; return patients.filter((p) => [p.firstName, p.lastName, p.patientId, p.phone, p.dateOfBirth].filter(Boolean).join(" ").toLowerCase().includes(q)); }, [patients, query]);
  return (
    <main className="min-h-screen bg-[#f5f8fc] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/95"><div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-5 sm:px-8"><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">SAMS · Clinical Operations</p><h1 className="mt-1 text-3xl font-black tracking-tight text-[#082b61]">Patients</h1><p className="mt-1 text-sm text-slate-500">Find an existing patient before creating a new record.</p></div><Link href="/patients/new" className="rounded-xl bg-[#0b63ce] px-5 py-3 text-sm font-bold text-white">+ Register Patient</Link></div></header>
      <div className="mx-auto max-w-[1500px] space-y-6 px-5 py-7 sm:px-8">
        <section className="rounded-[2rem] bg-gradient-to-br from-[#0b63ce] via-[#0a56b4] to-[#082b61] p-7 text-white shadow-xl sm:p-9"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">Returning patient workflow</p><h2 className="mt-3 text-3xl font-black">Find an existing patient</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">Search by patient ID, name, mobile number or date of birth. Verify the record before creating a new OPD visit.</p><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Patient ID, name, mobile or date of birth" className="mt-6 w-full max-w-2xl rounded-xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 outline-none" /></section>
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">Patient directory</p><h2 className="mt-1 text-2xl font-black text-[#082b61]">{filtered.length} matching record{filtered.length === 1 ? "" : "s"}</h2><div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">{filtered.length === 0 ? <div className="px-5 py-12 text-center"><p className="font-bold text-slate-600">No matching patient found</p><p className="mt-1 text-xs text-slate-400">Verify the details or register a new patient if no existing record belongs to this person.</p></div> : filtered.slice(0, 50).map((p) => <div key={p.id} className="grid gap-3 border-t border-slate-100 px-5 py-4 sm:grid-cols-[1fr_150px_150px_110px] sm:items-center"><div><p className="font-bold text-[#082b61]">{[p.firstName, p.lastName].filter(Boolean).join(" ") || "Unnamed patient"}</p><p className="text-xs text-slate-400">{p.dateOfBirth ? `DOB: ${new Date(p.dateOfBirth).toLocaleDateString("en-IN")}` : "Patient record"}</p></div><span className="text-sm font-semibold text-slate-600">{p.patientId ?? p.id}</span><span className="text-sm text-slate-500">{p.phone ?? "—"}</span><Link href={`/patients/profile/${p.id}`} className="text-sm font-bold text-[#0b63ce] hover:underline">Verify →</Link></div>)}</div></section>
      </div>
    </main>
  );
}
