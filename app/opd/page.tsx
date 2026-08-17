"use client";

import { useEffect, useState } from "react";

type Department = { id: number; name: string; code?: string };
type Doctor = { id: number; name: string; departmentId?: number | null };
type Visit = { id: number; tokenNumber: number; visitType: string; status: string; patient: { id: number; patientId: string; firstName: string; lastName: string } };

const STORAGE_KEY = "sams-opd-queue-desk";

export default function OPDQueuePage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [department, setDepartment] = useState<Department | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/departments", { cache: "no-store" });
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || "Unable to load departments.");
        setDepartments(Array.isArray(data) ? data : []);
        try {
          const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
          if (saved.departmentId) setDepartmentId(String(saved.departmentId));
          if (saved.doctorId) setDoctorId(String(saved.doctorId));
        } catch {}
      } catch (e) { setError(e instanceof Error ? e.message : "Unable to load departments."); }
      finally { setLoadingDepartments(false); }
    })();
  }, []);

  useEffect(() => {
    if (!departmentId) { setDoctors([]); setDoctorId(""); return; }
    (async () => {
      setLoadingDoctors(true); setError("");
      try {
        const r = await fetch(`/api/doctors?departmentId=${departmentId}`, { cache: "no-store" });
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || "Unable to load consultants.");
        const rows = Array.isArray(data) ? data : [];
        setDoctors(rows);
        if (doctorId && !rows.some((d: Doctor) => String(d.id) === doctorId)) setDoctorId("");
      } catch (e) { setDoctors([]); setError(e instanceof Error ? e.message : "Unable to load consultants."); }
      finally { setLoadingDoctors(false); }
    })();
  }, [departmentId]);

  useEffect(() => {
    if (!departmentId || !doctorId) { setVisits([]); setLoading(false); return; }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ departmentId, doctorId }));
    setLoading(true); setError("");
    (async () => {
      try {
        const r = await fetch(`/api/opd/queue?departmentId=${departmentId}&doctorId=${doctorId}`, { cache: "no-store" });
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || "Unable to load OPD queue.");
        setDepartment(data.department || null); setDoctor(data.doctor || null); setVisits(Array.isArray(data.visits) ? data.visits : []);
      } catch (e) { setVisits([]); setError(e instanceof Error ? e.message : "Unable to load OPD queue."); }
      finally { setLoading(false); }
    })();
  }, [departmentId, doctorId]);

  function changeDesk() { localStorage.removeItem(STORAGE_KEY); setDepartmentId(""); setDoctorId(""); setDepartment(null); setDoctor(null); setVisits([]); }
  const waiting = visits.filter(v => v.status === "WAITING");
  const called = visits.filter(v => v.status === "IN_CONSULTATION");
  const completed = visits.filter(v => v.status === "COMPLETED");

  return <main className="min-h-screen bg-[#f5f8fc] px-4 py-6 text-slate-900 sm:px-7 sm:py-8">
    <div className="mx-auto max-w-7xl">
      <header className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#061525,#0c2f50_55%,#082b61)] p-6 text-white shadow-[0_24px_70px_rgba(8,43,97,.22)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="text-[9px] font-black uppercase tracking-[.25em] text-[#f2d38b]">SAMS · OPD Queue Manager</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">{department && doctor ? `${department.name} · ${doctor.name}` : "OPD Queue"}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Select the department and consultant operating from this OPD desk. Only that OPD's registered patients will appear.</p></div>
          {departmentId && doctorId && <button onClick={changeDesk} className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-black hover:bg-white/15">Change OPD</button>}
        </div>
      </header>

      <section className="mt-5 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4"><p className="text-[9px] font-black uppercase tracking-[.2em] text-[#0b63ce]">OPD Desk Configuration</p><h2 className="mt-1 text-xl font-black text-[#082b61]">Choose Department &amp; Consultant</h2></div>
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><span className="text-[9px] font-black uppercase tracking-[.18em] text-slate-500">Department</span><select value={departmentId} disabled={loadingDepartments} onChange={e => { setDepartmentId(e.target.value); setDoctorId(""); setDoctor(null); }} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#082b61] outline-none focus:border-[#0b63ce]"><option value="">Select department</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
          <label className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><span className="text-[9px] font-black uppercase tracking-[.18em] text-slate-500">Consultant</span><select value={doctorId} disabled={!departmentId || loadingDoctors} onChange={e => setDoctorId(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#082b61] outline-none focus:border-[#0b63ce] disabled:bg-slate-100"><option value="">{loadingDoctors ? "Loading consultants…" : "Select consultant"}</option>{doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
        </div>
      </section>

      {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

      {departmentId && doctorId && <>
        <section className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="text-[9px] font-black uppercase tracking-[.15em] text-amber-700">Waiting</p><p className="mt-2 text-3xl font-black text-amber-900">{waiting.length}</p></div><div className="rounded-2xl border border-blue-200 bg-blue-50 p-5"><p className="text-[9px] font-black uppercase tracking-[.15em] text-blue-700">In Consultation</p><p className="mt-2 text-3xl font-black text-blue-900">{called.length}</p></div><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-[9px] font-black uppercase tracking-[.15em] text-emerald-700">Completed Today</p><p className="mt-2 text-3xl font-black text-emerald-900">{completed.length}</p></div></section>
        <section className="mt-5 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-5 sm:px-6"><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#d6a443]">Today’s OPD Queue</p><h2 className="mt-1 text-xl font-black text-[#082b61]">{department?.name} · {doctor?.name}</h2></div>{loading ? <div className="p-8 text-sm font-semibold text-slate-500">Loading queue…</div> : visits.length === 0 ? <div className="p-10 text-center text-sm font-semibold text-slate-500">No registered patients in this OPD today.</div> : <div className="divide-y divide-slate-100">{visits.map(v => <div key={v.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#082b61] text-lg font-black text-[#f2d38b]">{v.tokenNumber}</div><div><p className="font-black text-[#082b61]">{v.patient.firstName} {v.patient.lastName}</p><p className="mt-1 text-xs font-semibold text-slate-500">HID · {v.patient.patientId} · {v.visitType}</p></div></div><span className={`w-fit rounded-full px-3 py-1.5 text-[9px] font-black uppercase ${v.status === "WAITING" ? "bg-amber-50 text-amber-700" : v.status === "IN_CONSULTATION" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}`}>{v.status.replaceAll("_", " ")}</span></div>)}</div>}</section>
      </>}
    </div>
  </main>;
}
