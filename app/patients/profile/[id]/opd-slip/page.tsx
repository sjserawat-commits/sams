"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [departmentError, setDepartmentError] = useState("");

  async function loadDepartments() {
    setDepartmentsLoading(true);
    setDepartmentError("");
    try {
      const response = await fetch("/api/departments", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to load departments.");
      if (!Array.isArray(data)) throw new Error("Department service returned an invalid response.");
      setDepartments(data);
    } catch (err) {
      setDepartments([]);
      setDepartmentError(err instanceof Error ? err.message : "Unable to load departments.");
    } finally {
      setDepartmentsLoading(false);
    }
  }

  useEffect(() => {
    async function loadPatient() {
      try {
        const response = await fetch(`/api/patients/${patientId}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load patient.");
        setPatient(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load patient details.");
      } finally {
        setLoading(false);
      }
    }

    if (patientId) {
      loadPatient();
      loadDepartments();
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

      setDoctorsLoading(true);
      try {
        const response = await fetch(`/api/doctors?departmentId=${department}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || "Unable to load doctors.");
        setDoctors(Array.isArray(data) ? data : []);
        setDoctor("");
      } catch (err) {
        setDoctors([]);
        setDoctor("");
        setError(err instanceof Error ? err.message : "Unable to load doctors.");
      } finally {
        setDoctorsLoading(false);
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
      if (!response.ok) throw new Error(data?.error || "Unable to create OPD visit.");
      setCreatedVisit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create OPD visit.");
    } finally {
      setSaving(false);
    }
  }

  const selectedDepartment = useMemo(
    () => departments.find((item) => String(item.id) === department),
    [departments, department]
  );

  const getDoctorName = () => {
    const selectedDoctor = doctors.find((item) => item.id === Number(doctor));
    if (!selectedDoctor) return "—";
    if (selectedDoctor.name) return selectedDoctor.name;
    return `${selectedDoctor.firstName || ""} ${selectedDoctor.lastName || ""}`.trim() || "—";
  };

  const startConsultation = () => {
    if (createdVisit) {
      router.push(`/patients/profile/${patientId}/consultation?opdVisitId=${createdVisit.id}`);
    }
  };

  const printSlip = () => {
    if (createdVisit) {
      router.push(`/patients/profile/${patientId}/opd-slip/print?visitId=${createdVisit.id}`);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white px-10 py-9 text-center shadow-[0_25px_70px_rgba(8,43,97,0.12)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#082b61] to-[#0b63ce] text-xl font-black text-white shadow-lg">S</div>
          <p className="mt-5 text-sm font-black text-[#082b61]">Preparing OPD workspace</p>
          <p className="mt-1 text-xs font-semibold text-slate-400">Loading patient and department information…</p>
        </div>
      </main>
    );
  }

  if (!patient) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] px-5 py-8 text-slate-900 sm:px-8">
        <div className="mx-auto max-w-3xl rounded-[1.75rem] border border-red-100 bg-white p-8 shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">SAMS · Patient Workspace</p>
          <h1 className="mt-2 text-2xl font-black text-[#082b61]">Patient unavailable</h1>
          <p className="mt-2 text-sm font-semibold text-red-600">{error || "Patient not found."}</p>
          <button type="button" onClick={() => router.push("/patients")} className="mt-6 rounded-xl bg-[#0b63ce] px-5 py-3 text-sm font-black text-white">Patient Directory</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-white/15 bg-[#071f42]/95 text-white shadow-[0_12px_40px_rgba(8,43,97,0.18)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3.5 sm:px-7 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-lg font-black">S</div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-blue-200">Smart Adv Med System</p>
              <h1 className="truncate text-base font-black sm:text-lg">OPD Visit Workspace</h1>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-right">
              <p className="text-[8px] font-black uppercase tracking-[0.16em] text-blue-200">Current Patient</p>
              <p className="max-w-[240px] truncate text-sm font-black">{patient.firstName} {patient.lastName || ""}</p>
            </div>
            <button type="button" onClick={() => router.push(`/patients/profile/${patientId}`)} className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-black transition hover:bg-white/15">Profile</button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:px-8">
        <aside className="h-fit rounded-[1.6rem] border border-slate-200/80 bg-white p-3 shadow-[0_18px_55px_rgba(15,38,70,0.07)] lg:sticky lg:top-[88px]">
          <div className="px-3 pb-3 pt-2">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Application</p>
            <p className="mt-1 text-sm font-black text-[#082b61]">Clinical Operations</p>
          </div>
          <nav className="space-y-1.5">
            {appLinks.map((item) => (
              <button key={item.label} type="button" onClick={() => router.push(item.path)} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-black transition ${item.label === "OPD" ? "bg-[#082b61] text-white shadow-lg shadow-blue-950/15" : "text-slate-600 hover:bg-blue-50 hover:text-[#0b63ce]"}`}>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-black ${item.label === "OPD" ? "bg-white/15 text-white" : "bg-slate-100 text-[#0b63ce] group-hover:bg-white"}`}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="mt-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#0b63ce]">Patient Context</p>
            <p className="mt-1 truncate text-xs font-black text-[#082b61]">{patient.firstName} {patient.lastName || ""}</p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-400">ID · {patient.patientId || patient.id}</p>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <button type="button" onClick={() => router.push(`/patients/profile/${patientId}`)} className="text-xs font-black text-[#0b63ce] hover:text-[#082b61]">← Back to Patient Profile</button>
              <p className="mt-2 text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Patient Management · Outpatient Department</p>
            </div>
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black text-slate-500 shadow-sm">Patient ID · {patient.patientId || patient.id}</div>
          </div>

          <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_24px_75px_rgba(15,38,70,0.10)]">
            <header className="relative overflow-hidden bg-gradient-to-br from-[#061b3a] via-[#0a477f] to-[#0b63ce] px-6 py-8 text-white sm:px-10 sm:py-10">
              <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full border-[55px] border-white/5" />
              <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
              <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-blue-50 backdrop-blur">SAMS · OPD WORKFLOW</span>
                  <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] sm:text-5xl">Create Today&apos;s OPD Visit</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">A streamlined front-desk gateway from patient registration to department assignment and consultation.</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-xl">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-200">Patient</p>
                  <p className="mt-1 text-lg font-black">{patient.firstName} {patient.lastName || ""}</p>
                  <p className="mt-1 text-[10px] font-semibold text-blue-100">{patient.patientId || `Record ${patient.id}`}</p>
                </div>
              </div>
            </header>

            <section className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/70 p-6 sm:p-8">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">Patient Snapshot</p>
                  <h3 className="mt-1 text-xl font-black tracking-tight text-[#082b61]">Verified registration context</h3>
                </div>
                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-700">Registration Active</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Patient</p><p className="mt-2 text-base font-black text-[#082b61]">{patient.firstName} {patient.lastName || ""}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Patient ID</p><p className="mt-2 text-base font-black text-[#082b61]">{patient.patientId || patient.id}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Gender</p><p className="mt-2 text-base font-black text-[#082b61]">{patient.gender || "Not recorded"}</p></div>
              </div>
            </section>

            {!createdVisit ? (
              <section className="p-6 sm:p-8">
                <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">Visit Configuration</p>
                    <h3 className="mt-1 text-2xl font-black tracking-tight text-[#082b61]">Set today&apos;s clinical pathway</h3>
                    <p className="mt-1 text-xs font-semibold text-slate-400">Departments are loaded from the live master list.</p>
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-right">
                    <p className="text-[8px] font-black uppercase tracking-[0.15em] text-[#0b63ce]">Available Departments</p>
                    <p className="mt-0.5 text-lg font-black text-[#082b61]">{departmentsLoading ? "…" : departments.length}</p>
                  </div>
                </div>

                {departmentError ? (
                  <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div><p className="text-xs font-black text-red-700">Unable to load department master</p><p className="mt-1 text-[11px] font-semibold text-red-600">{departmentError}</p></div>
                    <button type="button" onClick={loadDepartments} className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-black text-red-700">Retry</button>
                  </div>
                ) : null}

                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/60 p-5">
                    <label className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                      Department
                      <div className="relative mt-2">
                        <select value={department} onChange={(e) => setDepartment(e.target.value)} disabled={departmentsLoading || departments.length === 0} className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-4 pr-11 text-sm font-bold text-[#082b61] outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-100">
                          <option value="">{departmentsLoading ? "Loading departments…" : departments.length ? "Select department" : "No departments available"}</option>
                          {departments.map((item) => <option key={item.id} value={item.id}>{item.name}{item.code ? ` · ${item.code}` : ""}</option>)}
                        </select>
                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">⌄</span>
                      </div>
                    </label>
                    <p className="mt-2 text-[10px] font-semibold text-slate-400">Every active department in the master list is available here.</p>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/60 p-5">
                    <label className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                      Consultant
                      <div className="relative mt-2">
                        <select value={doctor} onChange={(e) => setDoctor(e.target.value)} disabled={!department || doctorsLoading} className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-4 pr-11 text-sm font-bold text-[#082b61] outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-100">
                          <option value="">{!department ? "Select department first" : doctorsLoading ? "Loading consultants…" : doctors.length ? "Select consultant (optional)" : "No consultant assigned"}</option>
                          {doctors.map((item) => <option key={item.id} value={item.id}>{item.name || `${item.firstName || ""} ${item.lastName || ""}`.trim()}</option>)}
                        </select>
                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">⌄</span>
                      </div>
                    </label>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/60 p-5 lg:col-span-2">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">Visit Type</p>
                        <p className="mt-1 text-xs font-semibold text-slate-400">Choose whether this is a new or follow-up visit.</p>
                      </div>
                      <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2">
                        {[
                          { value: "New", label: "New Visit", note: "First / fresh OPD" },
                          { value: "Follow-up", label: "Follow-up Visit", note: "Existing care pathway" },
                        ].map((item) => (
                          <button key={item.value} type="button" onClick={() => setVisitType(item.value)} className={`rounded-2xl border px-5 py-3 text-left transition ${visitType === item.value ? "border-blue-300 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-blue-200"}`}>
                            <p className={`text-xs font-black ${visitType === item.value ? "text-[#0b63ce]" : "text-[#082b61]"}`}>{item.label}</p>
                            <p className="mt-0.5 text-[10px] font-semibold text-slate-400">{item.note}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {error ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</div> : null}

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button type="button" onClick={() => router.push(`/patients/profile/${patientId}`)} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:border-blue-200 hover:text-[#0b63ce]">Cancel</button>
                  <button type="button" onClick={createOPDSlip} disabled={saving || !department || departmentsLoading} className="rounded-xl bg-gradient-to-r from-[#082b61] to-[#0b63ce] px-7 py-3.5 text-sm font-black text-white shadow-[0_12px_30px_rgba(11,99,206,0.25)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Creating OPD Visit…" : "Create OPD Visit →"}</button>
                </div>
              </section>
            ) : (
              <section className="p-6 sm:p-8">
                <div className="rounded-[1.8rem] bg-gradient-to-br from-[#062c61] via-[#0759ae] to-[#0b63ce] p-6 text-white shadow-[0_20px_60px_rgba(8,43,97,0.20)] sm:p-8">
                  <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em]">OPD visit created</span>
                      <h3 className="mt-4 text-3xl font-black tracking-tight">Token #{createdVisit.tokenNumber}</h3>
                      <p className="mt-2 text-sm leading-6 text-blue-100">The patient is now registered for today&apos;s {createdVisit.visitType === "FOLLOW_UP" ? "follow-up" : "new"} OPD pathway.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/15 bg-white/10 p-4"><p className="text-[8px] font-black uppercase tracking-[0.16em] text-blue-200">Department</p><p className="mt-1 text-sm font-black">{selectedDepartment?.name || createdVisit.department || "—"}</p></div>
                      <div className="rounded-2xl border border-white/15 bg-white/10 p-4"><p className="text-[8px] font-black uppercase tracking-[0.16em] text-blue-200">Consultant</p><p className="mt-1 text-sm font-black">{getDoctorName()}</p></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <button type="button" onClick={startConsultation} className="rounded-2xl bg-[#0b63ce] px-5 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5">Start Consultation <span className="ml-2">→</span></button>
                  <button type="button" onClick={printSlip} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-[#082b61] shadow-sm transition hover:border-blue-200 hover:text-[#0b63ce]">Print OPD Slip</button>
                  <button type="button" onClick={() => router.push(`/patients/profile/${patientId}`)} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-[#0b63ce]">Patient Profile</button>
                </div>

                {error ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</div> : null}
              </section>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
