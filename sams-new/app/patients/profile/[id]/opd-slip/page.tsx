"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Patient = {
  id: number;
  patientId?: string;
  firstName: string;
  lastName?: string;
  gender?: string;
};

type Department = {
  id: number;
  name: string;
  code?: string;
};

type Doctor = {
  id: number;
  name?: string;
  firstName?: string;
  lastName?: string;
};

type OPDVisit = {
  id: number;
  tokenNumber: number;
  visitType: string;
  department?: string | null;
  status?: string;
  doctorId?: number | null;
};

const appLinks = [
  { label: "Dashboard", path: "/dashboard", icon: "⌂" },
  { label: "Patient Directory", path: "/patients", icon: "P" },
  { label: "Appointments", path: "/appointments", icon: "A" },
  { label: "OPD", path: "/opd", icon: "O" },
  { label: "Billing & Payments", path: "/billing", icon: "₹" },
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const patientResponse = await fetch("/api/patients/" + patientId);
        if (!patientResponse.ok) throw new Error("Unable to load patient.");

        const patientData = await patientResponse.json();
        setPatient(patientData);

        const departmentResponse = await fetch("/api/departments");
        if (!departmentResponse.ok) throw new Error("Unable to load departments.");

        const departmentData = await departmentResponse.json();
        setDepartments(Array.isArray(departmentData) ? departmentData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load patient details.");
      } finally {
        setLoading(false);
      }
    }

    if (patientId) {
      loadData();
    } else {
      setError("Invalid patient ID.");
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    async function loadDoctors() {
      if (!department) {
        setDoctors([]);
        setDoctor("");
        return;
      }

      try {
        const response = await fetch(`/api/doctors?departmentId=${department}`);
        if (!response.ok) throw new Error("Unable to load doctors.");

        const data = await response.json();
        setDoctors(Array.isArray(data) ? data : []);
      } catch (err) {
        setDoctors([]);
        setDoctor("");
        setError(err instanceof Error ? err.message : "Unable to load doctors.");
      }
    }

    loadDoctors();
  }, [department]);

  async function createOPDSlip() {
    if (!department) {
      setError("Please select a department.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/opd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: Number(patientId),
          department,
          doctorId: doctor ? Number(doctor) : null,
          visitType,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Unable to create OPD visit.");
      }

      setCreatedVisit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create OPD visit.");
    } finally {
      setSaving(false);
    }
  }

  function getDoctorName() {
    const selectedDoctor = doctors.find((item) => item.id === Number(doctor));
    if (!selectedDoctor) return "—";
    if (selectedDoctor.name) return selectedDoctor.name;
    return `${selectedDoctor.firstName || ""} ${selectedDoctor.lastName || ""}`.trim() || "—";
  }

  function getDepartmentName() {
    const selectedDepartment = departments.find((item) => String(item.id) === department);
    return selectedDepartment?.name || "—";
  }

  function startConsultation() {
    if (!createdVisit) return;
    router.push(`/patients/profile/${patientId}/consultation?opdVisitId=${createdVisit.id}`);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb]">
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-7 text-center shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b63ce] to-[#082b61] text-lg font-black text-white shadow-lg">S</div>
          <p className="mt-4 text-sm font-bold text-slate-500">Loading patient workspace...</p>
        </div>
      </main>
    );
  }

  if (!patient) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] px-5 py-8 text-slate-900 sm:px-8">
        <div className="mx-auto max-w-4xl rounded-[1.75rem] border border-red-100 bg-white p-8 shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">SAMS · Patient Workspace</p>
          <p className="mt-3 font-bold text-red-600">{error || "Patient not found."}</p>
          <button type="button" onClick={() => router.push("/patients")} className="mt-6 rounded-xl bg-[#0b63ce] px-5 py-3 text-sm font-black text-white">Patient Directory</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-white/20 bg-gradient-to-r from-[#061b3a] via-[#0b3d78] to-[#0b63ce] text-white shadow-[0_10px_35px_rgba(8,43,97,0.20)]">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-4 sm:px-7 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-lg font-black shadow-inner">S</div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-100">Smart Adv Med System</p>
              <h1 className="truncate text-base font-black sm:text-lg">OPD Visit Workspace</h1>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-right backdrop-blur">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-100">Patient</p>
              <p className="max-w-[220px] truncate text-sm font-black">{patient.firstName} {patient.lastName || ""}</p>
            </div>
            <button type="button" onClick={() => router.push(`/patients/profile/${patientId}`)} className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-black transition hover:bg-white/20">Profile</button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[235px_minmax(0,1fr)] lg:px-8">
        <aside className="h-fit rounded-[1.6rem] border border-slate-200/80 bg-white/90 p-3 shadow-[0_14px_45px_rgba(15,38,70,0.08)] backdrop-blur lg:sticky lg:top-[92px]">
          <div className="px-3 pb-3 pt-2">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Application</p>
            <p className="mt-1 text-sm font-black text-[#082b61]">Clinical Operations</p>
          </div>
          <nav className="space-y-1.5">
            {appLinks.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => router.push(item.path)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-black transition ${item.label === "OPD" ? "bg-[#082b61] text-white shadow-lg shadow-blue-950/15" : "text-slate-600 hover:bg-blue-50 hover:text-[#0b63ce]"}`}
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-black ${item.label === "OPD" ? "bg-white/15 text-white" : "bg-slate-100 text-[#0b63ce] group-hover:bg-white"}`}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="mt-4 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#0b63ce]">Current Patient</p>
            <p className="mt-1 truncate text-xs font-black text-[#082b61]">{patient.firstName} {patient.lastName || ""}</p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-400">ID · {patient.patientId || patient.id}</p>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <button type="button" onClick={() => router.push(`/patients/profile/${patientId}`)} className="text-xs font-black text-[#0b63ce] transition hover:text-[#082b61]">← Back to Patient Profile</button>
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Patient Registration · Outpatient Department</p>
            </div>
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black text-slate-500 shadow-sm">Patient ID · {patient.patientId || patient.id}</div>
          </div>

          <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_20px_65px_rgba(15,38,70,0.10)]">
            <header className="relative overflow-hidden bg-gradient-to-br from-[#082b61] via-[#0b4d96] to-[#0b63ce] px-6 py-7 text-white sm:px-9 sm:py-8">
              <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-cyan-300/10 blur-3xl" />
              <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-blue-50 backdrop-blur">SAMS · OPD</div>
                  <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Create OPD Slip</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">Register today&apos;s outpatient visit, assign the clinical team, and continue directly into the consultation workspace.</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-100">Patient</p>
                  <p className="mt-1 text-sm font-black">{patient.firstName} {patient.lastName || ""}</p>
                </div>
              </div>
            </header>

            <section className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/70 p-6 sm:p-8">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">Patient Snapshot</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">Verified registration details for today&apos;s visit</p>
                </div>
                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-700">Registration Active</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Patient</p>
                  <p className="mt-2 text-base font-black text-[#082b61]">{patient.firstName} {patient.lastName || ""}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Patient ID</p>
                  <p className="mt-2 text-base font-black text-[#082b61]">{patient.patientId || patient.id}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Gender</p>
                  <p className="mt-2 text-base font-black text-[#082b61]">{patient.gender || "—"}</p>
                </div>
              </div>
            </section>

            {!createdVisit && (
              <section className="p-6 sm:p-8">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">Visit Configuration</p>
                    <h3 className="mt-1 text-xl font-black tracking-tight text-[#082b61]">Set today&apos;s OPD pathway</h3>
                  </div>
                  <p className="hidden text-[10px] font-bold text-slate-400 sm:block">Step 1 · Registration → Visit</p>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Department</label>
                    <select value={department} onChange={(event) => setDepartment(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0b63ce] focus:ring-4 focus:ring-blue-50">
                      <option value="">Select Department</option>
                      {departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Consultant</label>
                    <select value={doctor} onChange={(event) => setDoctor(event.target.value)} disabled={!department} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0b63ce] focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100 disabled:text-slate-400">
                      <option value="">Select Consultant</option>
                      {doctors.map((item) => <option key={item.id} value={item.id}>{item.name || `${item.firstName || ""} ${item.lastName || ""}`.trim()}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Visit Type</label>
                    <select value={visitType} onChange={(event) => setVisitType(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0b63ce] focus:ring-4 focus:ring-blue-50">
                      <option value="New">New</option>
                      <option value="FOLLOW_UP">Follow-up</option>
                    </select>
                  </div>
                </div>

                {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</div>}

                <div className="mt-7 flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center">
                  <p className="text-xs font-semibold text-slate-400">The visit will receive a queue/token number automatically.</p>
                  <button type="button" onClick={createOPDSlip} disabled={saving} className="rounded-xl bg-gradient-to-r from-[#0b63ce] to-[#082b61] px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
                    {saving ? "Creating Visit..." : "Create OPD Visit →"}
                  </button>
                </div>
              </section>
            )}

            {createdVisit && (
              <section className="p-6 sm:p-8">
                <div className="rounded-[1.5rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 p-6 text-center shadow-inner sm:p-8">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b63ce] to-[#082b61] text-xl font-black text-white shadow-lg">✓</div>
                  <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">OPD Visit Created</p>
                  <p className="mt-2 text-sm font-semibold text-slate-500">Token / Queue Number</p>
                  <p className="mt-1 text-6xl font-black tracking-tight text-[#082b61]">{createdVisit.tokenNumber}</p>
                  <span className="mt-3 inline-flex rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-amber-700">Waiting</span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    ["Patient", `${patient.firstName} ${patient.lastName || ""}`],
                    ["Department", createdVisit.department || getDepartmentName()],
                    ["Visit Type", createdVisit.visitType === "FOLLOW_UP" ? "Follow-up" : "New"],
                    ["Consultant", getDoctorName()],
                    ["Status", "Waiting"],
                    ["OPD Visit ID", String(createdVisit.id)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
                      <p className="mt-2 text-sm font-black text-[#082b61]">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
<button
  type="button"
    onClick={() =>
        router.push(
              `/patients/profile/${patientId}/opd-slip/print?visitId=${createdVisit.id}`
                  )
                    }
                      className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        Print OPD Slip
                        </button>
                  <button type="button" onClick={startConsultation} className="rounded-xl bg-gradient-to-r from-[#0b63ce] to-[#082b61] px-7 py-3 text-sm font-black text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5">Start Consultation →</button>
                </div>
              </section>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
