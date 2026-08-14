"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Patient = { id: string; firstName?: string; lastName?: string; patientId?: string; gender?: string; phone?: string; dateOfBirth?: string };

const serif = { fontFamily: "Georgia, 'Times New Roman', serif" };
const sans = { fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState("");
  useEffect(() => { fetch("/api/patients").then((r) => r.json()).then((data) => setPatients(Array.isArray(data) ? data : [])).catch(() => setPatients([])); }, []);
  const filtered = useMemo(() => { const q = query.trim().toLowerCase(); if (!q) return patients; return patients.filter((p) => [p.firstName, p.lastName, p.patientId, p.phone, p.dateOfBirth].filter(Boolean).join(" ").toLowerCase().includes(q)); }, [patients, query]);
  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-900" style={sans}>
      <header className="relative overflow-hidden border-b border-[#d8c9a8] bg-[#082b61] text-white shadow-[0_12px_35px_rgba(8,43,97,0.18)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(212,175,55,0.22),transparent_30%),radial-gradient(circle_at_12%_110%,rgba(11,99,206,0.38),transparent_34%)]" />
        <div className="relative mx-auto max-w-[1500px] px-5 py-6 sm:px-8 sm:py-7">
          <div className="flex items-center justify-between gap-5">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#d4af37]/70 bg-white/10 shadow-[0_8px_25px_rgba(0,0,0,0.16)] sm:flex">
                <span className="text-2xl font-black text-[#f1d27a]" style={serif}>S</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-px w-7 bg-[#d4af37]" />
                  <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#f1d27a]">SAMS · Clinical Operations</p>
                </div>
                <h1 className="mt-1 text-3xl font-black tracking-[-0.02em] sm:text-4xl" style={serif}>Patient Registry</h1>
                <p className="mt-1 text-xs font-medium tracking-wide text-blue-100 sm:text-sm">A refined workspace for identifying, verifying and continuing patient care.</p>
              </div>
            </div>
            <Link href="/patients/new" className="group flex shrink-0 items-center gap-2 rounded-2xl border border-[#f1d27a]/70 bg-[#d4af37] px-4 py-3 text-xs font-black text-[#082b61] shadow-[0_8px_25px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f1d27a] sm:px-5 sm:py-3.5 sm:text-sm">
              <span className="text-base">✦</span><span className="hidden sm:inline">Register Patient</span><span className="sm:hidden">Register</span>
            </Link>
          </div>
          <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200">
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Patient Care Workspace</span>
            <span className="hidden h-1 w-1 rounded-full bg-[#d4af37] sm:block" />
            <span className="hidden sm:inline">Secure Clinical Directory</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] space-y-7 px-5 py-7 sm:px-8 sm:py-9">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0b63ce] via-[#0a56b4] to-[#082b61] p-7 text-white shadow-[0_18px_45px_rgba(8,43,97,0.20)] sm:p-9">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="absolute -right-4 -top-8 h-40 w-40 rounded-full border border-[#d4af37]/20" />
          <p className="relative text-[9px] font-black uppercase tracking-[0.26em] text-[#f1d27a]">Returning Patient Workflow</p>
          <h2 className="relative mt-3 text-3xl font-black tracking-tight sm:text-4xl" style={serif}>Find an existing patient</h2>
          <p className="relative mt-2 max-w-2xl text-sm leading-6 text-blue-100">Search by patient ID, name, mobile number or date of birth. Verify the record before creating a new OPD visit.</p>
          <div className="relative mt-6 flex max-w-3xl items-center gap-3 rounded-2xl border border-white/20 bg-white p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.14)]">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eef5ff] text-lg text-[#0b63ce]">⌕</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Patient ID, name, mobile or date of birth" className="h-11 w-full bg-transparent px-1 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" />
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,38,70,0.06)] sm:p-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#0b63ce]">Patient Directory</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-[#082b61] sm:text-3xl" style={serif}>{filtered.length} matching record{filtered.length === 1 ? "" : "s"}</h2>
            </div>
            <span className="hidden rounded-full border border-[#d4af37]/40 bg-[#fffaf0] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#8b6a17] sm:inline-flex">Verified Clinical Records</span>
          </div>
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
            {filtered.length === 0 ? <div className="px-5 py-12 text-center"><p className="font-bold text-slate-600" style={serif}>No matching patient found</p><p className="mt-1 text-xs text-slate-400">Verify the details or register a new patient if no existing record belongs to this person.</p></div> : filtered.slice(0, 50).map((p) => <div key={p.id} className="grid gap-3 border-t border-slate-100 px-5 py-4 transition hover:bg-[#f8fbff] sm:grid-cols-[1fr_150px_150px_110px] sm:items-center">
              <div><p className="font-bold tracking-tight text-[#082b61]" style={serif}>{[p.firstName, p.lastName].filter(Boolean).join(" ") || "Unnamed patient"}</p><p className="text-xs text-slate-400">{p.dateOfBirth ? `DOB: ${new Date(p.dateOfBirth).toLocaleDateString("en-IN")}` : "Patient record"}</p></div>
              <span className="text-sm font-semibold text-slate-600">{p.patientId ?? p.id}</span><span className="text-sm text-slate-500">{p.phone ?? "—"}</span><Link href={`/patients/profile/${p.id}`} className="text-sm font-black text-[#0b63ce] hover:underline">Verify →</Link>
            </div>)}
          </div>
        </section>
      </div>
    </main>
  );
}
