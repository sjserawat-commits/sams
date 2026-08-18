"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Patient = { id: number; patientId?: string; firstName: string; lastName?: string; gender?: string };
type Department = { id: number; name: string; code?: string };
type Doctor = { id: number; name?: string; firstName?: string; lastName?: string };
type OPDVisit = { id: number; tokenNumber: number; visitType: string; department?: string | null; status?: string; doctorId?: number | null };

const nav = [
  ["Home", "/"], ["Dashboard", "/dashboard"], ["Patient", "/patients"],
  ["Clinical", "/clinical"], ["Admin", "/admin"], ["Patient Portal", "/portal"],
];

export default function OPDSlipPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = String(params.id);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [department, setDepartment] = useState("");
  const [doctor, setDoctor] = useState("");
  const [visitType, setVisitType] = useState("New");
  const [createdVisit, setCreatedVisit] = useState<OPDVisit | null>(null);
  const [loading, setLoading] = useState(true);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [departmentError, setDepartmentError] = useState("");

  async function loadDepartments() {
    setDepartmentsLoading(true); setDepartmentError("");
    try {
      const response = await fetch("/api/departments", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to load departments.");
      if (!Array.isArray(data)) throw new Error("Department service returned an invalid response.");
      setDepartments(data);
    } catch (err) {
      setDepartments([]);
      setDepartmentError(err instanceof Error ? err.message : "Unable to load departments.");
    } finally { setDepartmentsLoading(false); }
  }

  useEffect(() => {
    async function loadPatient() {
      try {
        const response = await fetch(`/api/patients/${patientId}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load patient.");
        setPatient(await response.json());
      } catch (err) { setError(err instanceof Error ? err.message : "Unable to load patient details."); }
      finally { setLoading(false); }
    }
    if (patientId) { loadPatient(); loadDepartments(); }
    else { setError("Invalid patient ID."); setLoading(false); }
  }, [patientId]);

  useEffect(() => {
    async function loadDoctors() {
      if (!department) { setDoctors([]); setDoctor(""); return; }
      setDoctorsLoading(true);
      try {
        const response = await fetch(`/api/doctors?departmentId=${department}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || "Unable to load doctors.");
        setDoctors(Array.isArray(data) ? data : []); setDoctor("");
      } catch (err) {
        setDoctors([]); setDoctor(""); setError(err instanceof Error ? err.message : "Unable to load doctors.");
      } finally { setDoctorsLoading(false); }
    }
    loadDoctors();
  }, [department]);

  async function createOPDSlip() {
    if (!department) { setError("Please select a department."); return; }
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/opd", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: Number(patientId), department, doctorId: doctor ? Number(doctor) : null, visitType }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to create OPD visit.");
      setCreatedVisit(data);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to create OPD visit."); }
    finally { setSaving(false); }
  }

  const selectedDepartment = useMemo(() => departments.find((item) => String(item.id) === department), [departments, department]);
  const doctorName = useMemo(() => {
    const d = doctors.find((item) => item.id === Number(doctor));
    if (!d) return "Not assigned";
    return d.name || `${d.firstName || ""} ${d.lastName || ""}`.trim() || "Not assigned";
  }, [doctors, doctor]);
  const printSlip = () => { if (createdVisit) router.push(`/patients/profile/${patientId}/opd-slip/print?visitId=${createdVisit.id}`); };

  if (loading) return <main className="min-h-screen grid place-items-center bg-slate-100"><div className="rounded-3xl bg-white p-10 text-center shadow-xl"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#082b61] text-xl font-black text-white">S</div><p className="mt-5 font-black text-[#082b61]">Preparing OPD workspace</p><p className="mt-1 text-xs font-semibold text-slate-400">Loading patient and department information…</p></div></main>;

  if (!patient) return <main className="min-h-screen grid place-items-center bg-slate-100 px-5"><div className="max-w-lg rounded-3xl bg-white p-8 shadow-xl"><p className="text-xs font-black uppercase tracking-[.2em] text-red-500">Patient workspace</p><h1 className="mt-2 text-2xl font-black text-[#082b61]">Patient unavailable</h1><p className="mt-2 text-sm font-semibold text-red-600">{error || "Patient not found."}</p><button onClick={() => router.push("/patients")} className="mt-6 rounded-xl bg-[#0b63ce] px-5 py-3 text-sm font-black text-white">Patient Directory</button></div></main>;

  return <main className="min-h-screen overflow-hidden text-slate-900">
    <div className="fixed inset-0 -z-20 bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=85)" }} />
    <div className="fixed inset-0 -z-10 bg-gradient-to-b from-white/88 via-slate-50/94 to-white/96" />

    <header className="sticky top-0 z-40 border-b border-white/30 bg-[#071f42]/95 text-white shadow-lg backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-4 py-3 sm:px-7">
        <button onClick={() => router.push(`/patients/profile/${patientId}`)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-lg font-black hover:bg-white/15" aria-label="Back to patient profile">←</button>
        <div className="min-w-0 flex-1"><p className="text-[8px] font-black uppercase tracking-[.28em] text-blue-200">SAMS · Patient Management</p><p className="truncate text-sm font-black">Registration for OPD Visit</p></div>
        <nav className="hidden items-center gap-1 xl:flex">{nav.map(([label, href]) => <button key={label} onClick={() => router.push(href)} className="rounded-lg px-3 py-2 text-[10px] font-black text-white/75 hover:bg-white/10 hover:text-white">{label}</button>)}</nav>
        <div className="hidden rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-right sm:block"><p className="text-[7px] font-black uppercase tracking-[.15em] text-blue-200">Patient</p><p className="max-w-[170px] truncate text-xs font-black">{patient.firstName} {patient.lastName || ""}</p></div>
      </div>
      <div className="flex gap-1 overflow-x-auto px-4 pb-2 xl:hidden">{nav.map(([label, href]) => <button key={label} onClick={() => router.push(href)} className="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-[9px] font-black text-white/80">{label}</button>)}</div>
    </header>

    <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-7 sm:py-9">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-[.28em] text-[#0b637c]">Outpatient Department · Front Desk</p><h1 className="mt-1 text-3xl font-black tracking-tight text-[#082b61] sm:text-4xl">OPD Visit Registration</h1><p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">Create today's visit, assign the right clinical destination, and move the patient directly into the OPD queue.</p></div><div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur"><p className="text-[8px] font-black uppercase tracking-[.16em] text-slate-400">Patient ID</p><p className="mt-1 text-sm font-black text-[#082b61]">{patient.patientId || patient.id}</p></div></div>

      {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50/95 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

      <div className="grid gap-5 lg:grid-cols-[1.45fr_.75fr] lg:items-start">
        <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/92 shadow-[0_24px_70px_rgba(8,43,97,.13)] backdrop-blur">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#082b61] via-[#07577b] to-[#0d8a73] px-6 py-7 text-white sm:px-8"><div className="absolute -right-20 -top-24 h-60 w-60 rounded-full border-[45px] border-white/10"/><div className="relative"><span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[8px] font-black uppercase tracking-[.2em]">Step · Create Visit</span><h2 className="mt-3 text-2xl font-black sm:text-3xl">Set the OPD destination</h2><p className="mt-2 max-w-xl text-sm leading-6 text-blue-50/80">Select the department first; the consultant list will update from the live master automatically.</p></div></div>
          <div className="p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"><span className="text-[9px] font-black uppercase tracking-[.18em] text-slate-500">Department</span><select value={department} disabled={departmentsLoading} onChange={(e) => setDepartment(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-800 outline-none focus:border-[#0b63ce] focus:ring-2 focus:ring-blue-100"><option value="">{departmentsLoading ? "Loading departments…" : "Select department"}</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}{d.code ? ` · ${d.code}` : ""}</option>)}</select>{departmentError && <button onClick={loadDepartments} className="mt-2 text-[10px] font-black text-red-600">Retry department master</button>}</label>
              <label className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"><span className="text-[9px] font-black uppercase tracking-[.18em] text-slate-500">Consultant</span><select value={doctor} disabled={!department || doctorsLoading} onChange={(e) => setDoctor(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-800 outline-none focus:border-[#0b63ce] focus:ring-2 focus:ring-blue-100"><option value="">{doctorsLoading ? "Loading consultants…" : department ? "Select consultant (optional)" : "Select department first"}</option>{doctors.map((d) => <option key={d.id} value={d.id}>{d.name || `${d.firstName || ""} ${d.lastName || ""}`.trim()}</option>)}</select></label>
            </div>

            <div className="mt-6"><p className="text-[9px] font-black uppercase tracking-[.18em] text-slate-500">Visit Type</p><div className="mt-2 grid gap-2 sm:grid-cols-4">{["New","Follow-up","Review","Emergency"].map((type) => <button key={type} type="button" onClick={() => setVisitType(type)} className={`rounded-2xl border px-4 py-4 text-left text-xs font-black transition ${visitType === type ? "border-[#0b63ce] bg-blue-50 text-[#082b61] shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-slate-50"}`}><span className="block text-[9px] uppercase tracking-[.14em] text-slate-400">Visit</span><span className="mt-1 block">{type}</span></button>)}</div></div>

            <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-slate-400">Ready to create</p><p className="mt-1 text-xs font-semibold text-slate-500">{selectedDepartment?.name || "Choose a department"} · {doctorName}</p></div><button type="button" onClick={createOPDSlip} disabled={saving || !department} className="rounded-2xl bg-[#082b61] px-7 py-4 text-sm font-black text-white shadow-lg shadow-blue-950/20 transition hover:bg-[#0b4b82] disabled:cursor-not-allowed disabled:opacity-45">{saving ? "Creating OPD Visit…" : "Create OPD Visit →"}</button></div>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-[1.75rem] border border-white/80 bg-white/90 p-6 shadow-[0_18px_55px_rgba(15,38,70,.10)] backdrop-blur"><p className="text-[9px] font-black uppercase tracking-[.2em] text-[#0b637c]">Patient Snapshot</p><h3 className="mt-2 text-xl font-black text-[#082b61]">{patient.firstName} {patient.lastName || ""}</h3><div className="mt-5 space-y-3"><div className="flex justify-between gap-4 border-b border-slate-100 pb-3"><span className="text-xs font-semibold text-slate-400">Patient ID</span><span className="text-xs font-black text-slate-700">{patient.patientId || patient.id}</span></div><div className="flex justify-between gap-4 border-b border-slate-100 pb-3"><span className="text-xs font-semibold text-slate-400">Gender</span><span className="text-xs font-black text-slate-700">{patient.gender || "Not recorded"}</span></div><div className="flex justify-between gap-4"><span className="text-xs font-semibold text-slate-400">Visit type</span><span className="text-xs font-black text-slate-700">{visitType}</span></div></div></section>
          <section className="rounded-[1.75rem] border border-emerald-100 bg-emerald-50/90 p-6 shadow-sm"><p className="text-[9px] font-black uppercase tracking-[.2em] text-emerald-700">Workflow</p><div className="mt-4 space-y-3 text-xs font-bold text-emerald-950"><div className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white font-black">1</span><span>Register OPD visit</span></div><div className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white font-black">2</span><span>Generate token</span></div><div className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white font-black">3</span><span>Move patient to OPD queue</span></div><div className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white font-black">4</span><span>Start consultation</span></div></div></section>
        </aside>
      </div>

      {createdVisit && <section className="mt-5 overflow-hidden rounded-[2rem] border border-emerald-200 bg-white shadow-[0_24px_70px_rgba(16,120,82,.12)]"><div className="bg-gradient-to-r from-emerald-700 to-teal-600 px-6 py-6 text-white sm:px-8"><p className="text-[9px] font-black uppercase tracking-[.22em] text-emerald-100">OPD Visit Created</p><div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-3xl font-black">Token #{createdVisit.tokenNumber}</h2><p className="mt-1 text-sm font-semibold text-emerald-50/80">{selectedDepartment?.name || createdVisit.department || "OPD"} · {visitType}</p></div><span className="rounded-full bg-white/15 px-4 py-2 text-[9px] font-black uppercase tracking-[.15em]">Ready for queue</span></div></div><div className="grid gap-3 p-6 sm:grid-cols-3 sm:p-8"><button onClick={() => router.push(`/opd`)} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs font-black text-slate-700 hover:bg-slate-50">Open OPD Queue</button><button onClick={printSlip} className="rounded-2xl bg-[#082b61] px-5 py-4 text-xs font-black text-white hover:bg-[#0b4b82]">Print OPD Slip</button><button onClick={() => router.push(`/patients/profile/${patientId}`)} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs font-black text-slate-700 hover:bg-slate-50">Back to Patient Profile</button></div></section>}
    </div>
  </main>;
}
