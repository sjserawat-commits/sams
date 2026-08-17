"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Navigation from "@/components/Navigation";

type Department = { id: number; name: string; code?: string };
type Doctor = { id: number; name?: string; firstName?: string; lastName?: string };
type Patient = { id: number; patientId?: string; firstName?: string; lastName?: string };
type Visit = { id: number; tokenNumber: number; patientId: number; doctorId?: number | null; status?: string; visitType?: string; patient: Patient };

const doctorName = (d?: Doctor) => d?.name || [d?.firstName, d?.lastName].filter(Boolean).join(" ") || "Consultant";
const patientName = (p: Patient) => [p.firstName, p.lastName].filter(Boolean).join(" ") || "Patient";
const DOCTOR_DESK_SELECTION_KEY = "sams.doctorDesk.selection";

export default function DoctorDeskPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [queueLoading, setQueueLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [selectionReady, setSelectionReady] = useState(false);

  async function loadDepartments() {
    setLoading(true);
    try {
      const r = await fetch("/api/departments", { cache: "no-store" });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Unable to load departments.");
      setDepartments(Array.isArray(data) ? data : []);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load departments."); }
    finally { setLoading(false); }
  }

  async function loadQueue() {
    if (!departmentId) { setVisits([]); return; }
    setQueueLoading(true);
    try {
      const r = await fetch(`/api/opd/queue?departmentId=${departmentId}`, { cache: "no-store" });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Unable to load OPD queue.");
      setVisits(Array.isArray(data?.visits) ? data.visits : []);
      setError("");
    } catch (e) { setVisits([]); setError(e instanceof Error ? e.message : "Unable to load OPD queue."); }
    finally { setQueueLoading(false); }
  }

  useEffect(() => {
    let stored: { departmentId?: string; doctorId?: string } = {};
    try { stored = JSON.parse(localStorage.getItem(DOCTOR_DESK_SELECTION_KEY) || "{}"); } catch { /* ignore malformed stored selection */ }
    if (stored.departmentId) setDepartmentId(String(stored.departmentId));
    if (stored.doctorId) setDoctorId(String(stored.doctorId));
    setSelectionReady(true);
    loadDepartments();
  }, []);

  useEffect(() => {
    if (!selectionReady) return;
    localStorage.setItem(DOCTOR_DESK_SELECTION_KEY, JSON.stringify({ departmentId, doctorId }));
  }, [selectionReady, departmentId, doctorId]);

  useEffect(() => {
    async function loadDoctors() {
      if (!departmentId) { setDoctors([]); setVisits([]); return; }
      try {
        const r = await fetch(`/api/doctors?departmentId=${departmentId}`, { cache: "no-store" });
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || "Unable to load consultants.");
        setDoctors(Array.isArray(data) ? data : []);
      } catch (e) { setDoctors([]); setError(e instanceof Error ? e.message : "Unable to load consultants."); }
      loadQueue();
    }
    loadDoctors();
  }, [departmentId]);

  const selectedDoctorVisits = useMemo(() => doctorId ? visits.filter(v => String(v.doctorId || "") === doctorId) : visits, [doctorId, visits]);
  const activeVisits = selectedDoctorVisits.filter(v => v.status === "WAITING" || v.status === "IN_CONSULTATION");
  const waiting = selectedDoctorVisits.filter(v => v.status === "WAITING");
  const inConsultation = selectedDoctorVisits.filter(v => v.status === "IN_CONSULTATION");
  const completed = selectedDoctorVisits.filter(v => v.status === "COMPLETED");
  const selectedDepartment = departments.find(d => String(d.id) === departmentId);
  const selectedDoctor = doctors.find(d => String(d.id) === doctorId);
  const nextPatient = waiting[0];

  async function callNextPatient() {
    if (!nextPatient) return;
    setActionId(nextPatient.id);
    try {
      const r = await fetch(`/api/opd/${nextPatient.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "IN_CONSULTATION" }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Unable to call next patient.");
      setVisits(current => current.map(v => v.id === nextPatient.id ? { ...v, status: data.status || "IN_CONSULTATION" } : v));
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to call next patient."); }
    finally { setActionId(null); }
  }

  return (
    <main className="min-h-screen bg-[#050c16] text-slate-100 lg:flex">
      <div className="lg:sticky lg:top-0 lg:h-screen lg:w-[270px] lg:shrink-0"><Sidebar /></div>
      <div className="min-w-0 flex-1"><Navigation />
        <div className="px-3 py-4 sm:px-6 lg:px-8 lg:py-6">
          <section className="relative mx-auto max-w-[1500px] overflow-hidden rounded-[2.25rem] border border-[#d6a443]/45 bg-[linear-gradient(135deg,#061525,#0c263d_55%,#050e18)] px-5 py-7 shadow-[0_30px_90px_rgba(0,0,0,.48)] sm:px-10 sm:py-9">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#082b61] via-[#d6a443] to-[#f4d58c]" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]"><Image src="/serawat-logo.png" alt="" width={600} height={600} className="h-[500px] w-[500px] object-contain" /></div>
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
              <div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#d6a443]">SAMS · Clinical Operations</p><h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-5xl">Doctor Desk</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Select your department and doctor, monitor today’s OPD, call the next patient and enter consultation.</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-right"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#d6a443]">Active Queue</p><p className="mt-1 text-3xl font-black text-white">{activeVisits.length}</p></div>
            </div>
          </section>

          <section className="mx-auto mt-6 max-w-[1500px] rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,27,45,.94),rgba(4,14,25,.97))] p-5 shadow-[0_22px_70px_rgba(0,0,0,.32)] sm:p-7">
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#d6a443]">Select Your Department</span><select value={departmentId} onChange={e => { setDepartmentId(e.target.value); setDoctorId(""); }} disabled={loading} className="mt-2 w-full rounded-xl border border-white/10 bg-[#071525] px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#d6a443]"><option value="">Choose department</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}{d.code ? ` · ${d.code}` : ""}</option>)}</select></label>
              <label className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#d6a443]">Doctor</span><select value={doctorId} onChange={e => setDoctorId(e.target.value)} disabled={!departmentId || !doctors.length} className="mt-2 w-full rounded-xl border border-white/10 bg-[#071525] px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#d6a443] disabled:opacity-50"><option value="">All consultants</option>{doctors.map(d => <option key={d.id} value={d.id}>{doctorName(d)}</option>)}</select></label>
            </div>

            {error && <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-200">{error}</div>}

            {departmentId && <>
              <div className="mt-7"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#d6a443]">Doctor Dashboard</p><h2 className="mt-1 text-xl font-black text-white">{selectedDepartment?.name || "Department"}{selectedDoctor ? ` · ${doctorName(selectedDoctor)}` : ""}</h2></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[["Today's OPD", selectedDoctorVisits.length], ["Waiting", waiting.length], ["In Consultation", inConsultation.length], ["Completed", completed.length]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p><p className="mt-2 text-2xl font-black text-white">{value}</p></div>)}
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#d6a443]">Today’s Registered Patients</p><p className="mt-1 text-sm font-semibold text-slate-400">Token number · patient name · patient ID · queue status</p></div><div className="flex gap-2"><button type="button" onClick={callNextPatient} disabled={!nextPatient || actionId !== null} className="rounded-xl bg-[#d6a443] px-4 py-2.5 text-xs font-black text-[#071525] disabled:cursor-not-allowed disabled:opacity-40">{actionId ? "Calling…" : "Call Next Patient"}</button><button type="button" onClick={loadQueue} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-black text-slate-300 hover:border-[#d6a443]/50">Refresh</button></div></div>

              {queueLoading ? <div className="mt-5 rounded-[1.5rem] bg-white/[0.035] p-10 text-center text-sm font-semibold text-slate-400">Loading today’s OPD queue…</div> : selectedDoctorVisits.length === 0 ? <div className="mt-5 rounded-[1.5rem] border border-dashed border-white/10 p-10 text-center text-sm font-semibold text-slate-500">No patients registered for this department today.</div> : <div className="mt-5 space-y-3">{selectedDoctorVisits.map(v => <div key={v.id} className="flex flex-col gap-4 rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-4 sm:flex-row sm:items-center"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#d6a443]/30 bg-[#071525] text-lg font-black text-[#f4d58c]">{v.tokenNumber}</div><div className="min-w-0 flex-1"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#d6a443]">Token #{v.tokenNumber} · {v.visitType === "FOLLOW_UP" ? "Follow-up" : "New Visit"}</p><h3 className="mt-1 truncate text-base font-black text-white">{patientName(v.patient)}</h3><p className="mt-1 text-xs text-slate-400">Patient ID · {v.patient.patientId || v.patientId} · Status · {v.status || "WAITING"}</p></div><div className="flex flex-wrap gap-2"><Link href={`/opd/doctor-reports?opdVisitId=${v.id}`} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-black text-slate-300 hover:border-[#d6a443]/50">Review Reports</Link><Link href={`/patients/profile/${v.patientId}/consultation?opdVisitId=${v.id}`} className="rounded-xl bg-[#d6a443] px-4 py-2.5 text-xs font-black text-[#071525]">{v.status === "IN_CONSULTATION" ? "Continue Consultation" : "Start Consultation"} →</Link></div></div>)}</div>}
            </>}
          </section>
        </div>
      </div>
    </main>
  );
}
