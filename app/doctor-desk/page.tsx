"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Navigation from "@/components/Navigation";

type Department = { id: number; name: string; code?: string };
type Doctor = { id: number; name?: string; firstName?: string; lastName?: string };
type Patient = { id: number; patientId?: string; firstName?: string; lastName?: string; gender?: string; phone?: string };
type Visit = { id: number; tokenNumber: number; patientId: number; doctorId?: number | null; departmentId?: number | null; visitType?: string; status?: string; patient: Patient };

const doctorName = (doctor?: Doctor) => doctor?.name || [doctor?.firstName, doctor?.lastName].filter(Boolean).join(" ") || "Consultant";
const patientName = (patient: Patient) => [patient.firstName, patient.lastName].filter(Boolean).join(" ") || "Patient";

export default function DoctorDeskPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [queueLoading, setQueueLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDepartments() {
      try {
        const response = await fetch("/api/departments", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || "Unable to load departments.");
        setDepartments(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load departments.");
      } finally {
        setLoading(false);
      }
    }
    loadDepartments();
  }, []);

  useEffect(() => {
    async function loadDoctors() {
      setDoctorId("");
      if (!departmentId) { setDoctors([]); setVisits([]); return; }
      try {
        const response = await fetch(`/api/doctors?departmentId=${departmentId}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || "Unable to load consultants.");
        setDoctors(Array.isArray(data) ? data : []);
      } catch (e) {
        setDoctors([]);
        setError(e instanceof Error ? e.message : "Unable to load consultants.");
      }
    }
    loadDoctors();
  }, [departmentId]);

  useEffect(() => {
    async function loadQueue() {
      if (!departmentId) { setVisits([]); return; }
      setQueueLoading(true);
      try {
        const response = await fetch(`/api/opd/queue?departmentId=${departmentId}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || "Unable to load OPD queue.");
        setVisits(Array.isArray(data?.visits) ? data.visits : []);
        setError("");
      } catch (e) {
        setVisits([]);
        setError(e instanceof Error ? e.message : "Unable to load OPD queue.");
      } finally {
        setQueueLoading(false);
      }
    }
    loadQueue();
  }, [departmentId]);

  const filteredVisits = useMemo(() => doctorId ? visits.filter((visit) => String(visit.doctorId || "") === doctorId) : visits, [doctorId, visits]);
  const selectedDepartment = departments.find((item) => String(item.id) === departmentId);
  const selectedDoctor = doctors.find((item) => String(item.id) === doctorId);

  return (
    <main className="min-h-screen bg-[#050c16] text-slate-100 lg:flex">
      <div className="lg:sticky lg:top-0 lg:h-screen lg:w-[270px] lg:shrink-0"><Sidebar /></div>
      <div className="min-w-0 flex-1"><Navigation />
        <div className="relative overflow-hidden px-3 py-4 sm:px-6 lg:px-8 lg:py-6">
          <section className="relative mx-auto max-w-[1500px] overflow-hidden rounded-[2.25rem] border border-[#d6a443]/45 bg-[linear-gradient(135deg,rgba(5,18,31,0.98),rgba(12,38,61,0.96)_52%,rgba(5,14,24,0.99))] px-5 py-7 shadow-[0_30px_90px_rgba(0,0,0,0.48)] sm:px-10 sm:py-9">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#082b61] via-[#d6a443] to-[#f4d58c]" />
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.045] pointer-events-none"><Image src="/serawat-logo.png" alt="" width={600} height={600} className="h-[500px] w-[500px] object-contain" /></div>
            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-5">
                <div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#d6a443]">SAMS · Clinical Operations</p><h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-5xl">Doctor Desk</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Access today’s registered OPD patients and open their consultation workspace from one doctor-facing desk.</p></div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-right"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#d6a443]">Today’s Queue</p><p className="mt-1 text-3xl font-black text-white">{filteredVisits.length}</p></div>
              </div>
            </div>
          </section>

          <section className="relative mx-auto mt-6 max-w-[1500px] rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,27,45,0.92),rgba(4,14,25,0.96))] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.32)] sm:p-7">
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#d6a443]">Choose Department</span><select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} disabled={loading} className="mt-2 w-full rounded-xl border border-white/10 bg-[#071525] px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#d6a443]"><option value="">Select department</option>{departments.map((item) => <option key={item.id} value={item.id}>{item.name}{item.code ? ` · ${item.code}` : ""}</option>)}</select></label>
              <label className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#d6a443]">Choose Consultant</span><select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} disabled={!departmentId || !doctors.length} className="mt-2 w-full rounded-xl border border-white/10 bg-[#071525] px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#d6a443] disabled:opacity-50"><option value="">All consultants</option>{doctors.map((item) => <option key={item.id} value={item.id}>{doctorName(item)}</option>)}</select></label>
            </div>

            <div className="mt-7 flex flex-wrap items-end justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#d6a443]">OPD Patient Queue</p><h2 className="mt-1 text-xl font-black text-white">{selectedDepartment?.name || "Select a department"}{selectedDoctor ? ` · ${doctorName(selectedDoctor)}` : ""}</h2></div>{departmentId && <button type="button" onClick={() => setDepartmentId((value) => value)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-slate-300 hover:border-[#d6a443]/50">Refresh Queue</button>}</div>

            {error ? <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-200">{error}</div> : null}
            {!departmentId ? <div className="mt-6 rounded-[1.5rem] border border-dashed border-white/10 p-10 text-center text-sm font-semibold text-slate-500">Choose a department to load today’s registered OPD patients.</div> : queueLoading ? <div className="mt-6 rounded-[1.5rem] bg-white/[0.035] p-10 text-center text-sm font-semibold text-slate-400">Loading today’s OPD queue…</div> : filteredVisits.length === 0 ? <div className="mt-6 rounded-[1.5rem] bg-white/[0.035] p-10 text-center text-sm font-semibold text-slate-500">No waiting patients in this selection.</div> : <div className="mt-6 space-y-3">{filteredVisits.map((visit) => <Link key={visit.id} href={`/patients/profile/${visit.patientId}/consultation?opdVisitId=${visit.id}`} className="group flex flex-col gap-4 rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-4 transition hover:-translate-y-0.5 hover:border-[#d6a443]/45 hover:bg-white/[0.06] sm:flex-row sm:items-center"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#d6a443]/30 bg-[#071525] text-lg font-black text-[#f4d58c]">{visit.tokenNumber}</div><div className="min-w-0 flex-1"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#d6a443]">Token #{visit.tokenNumber} · {visit.visitType === "FOLLOW_UP" ? "Follow-up" : "New Visit"}</p><h3 className="mt-1 truncate text-base font-black text-white">{patientName(visit.patient)}</h3><p className="mt-1 text-xs text-slate-400">Patient ID · {visit.patient.patientId || visit.patientId} · Status · {visit.status || "WAITING"}</p></div><span className="rounded-xl bg-[#d6a443] px-4 py-2.5 text-xs font-black text-[#071525] transition group-hover:bg-[#f4d58c]">Open Consultation →</span></Link>)}</div>}
          </section>
        </div>
      </div>
    </main>
  );
}
