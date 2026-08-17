"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type RegistrationData = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  aadhaarNumber: string;
  address: string;
  emergencyContactName: string;
  emergencyMobile: string;
};

type RegisteredPatient = RegistrationData & {
  id: number;
  patientId: string;
  aadhaarMasked?: string | null;
};

function normalizeDob(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function parseManualDate(value: string) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const date = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  const today = new Date();
  if (date.getFullYear() !== Number(match[3]) || date.getMonth() !== Number(match[2]) - 1 || date.getDate() !== Number(match[1]) || date > today || date.getFullYear() < 1900) return null;
  return date;
}

function calculateAge(value: string) {
  const birth = parseManualDate(value);
  if (!birth) return "";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age -= 1;
  return age >= 0 && age < 150 ? String(age) : "";
}

function toApiDate(value: string) {
  const date = parseManualDate(value);
  return date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` : "";
}

const empty: RegistrationData = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  aadhaarNumber: "",
  address: "",
  emergencyContactName: "",
  emergencyMobile: "",
};

export default function NewPatientPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "review" | "complete">("form");
  const [data, setData] = useState<RegistrationData>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState<RegisteredPatient | null>(null);
  const age = useMemo(() => calculateAge(data.dateOfBirth), [data.dateOfBirth]);
  const set = (key: keyof RegistrationData, value: string) => setData((current) => ({ ...current, [key]: value }));

  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!data.firstName.trim() || !data.lastName.trim()) { setError("First name and last name are required."); return; }
    if (data.dateOfBirth && !parseManualDate(data.dateOfBirth)) { setError("Please enter a valid date of birth."); return; }
    const phone = data.phone.replace(/\D/g, "");
    const emergencyMobile = data.emergencyMobile.replace(/\D/g, "");
    const aadhaar = data.aadhaarNumber.replace(/\D/g, "");
    if (phone && (phone.length < 10 || phone.length > 15)) { setError("Please enter a valid mobile number."); return; }
    if (emergencyMobile && (emergencyMobile.length < 10 || emergencyMobile.length > 15)) { setError("Please enter a valid emergency mobile number."); return; }
    if (aadhaar && aadhaar.length !== 12) { setError("Aadhaar number must contain exactly 12 digits."); return; }
    setData((current) => ({ ...current, phone, emergencyMobile, aadhaarNumber: aadhaar }));
    setStep("review");
  }

  async function savePatient() {
    setError(""); setSaving(true);
    try {
      const emergencyContact = [data.emergencyContactName.trim(), data.emergencyMobile.trim()].filter(Boolean).join(" · ");
      const response = await fetch("/api/patients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, emergencyContact, dateOfBirth: toApiDate(data.dateOfBirth) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to register patient.");
      setRegistered({ ...result, ...data });
      setStep("complete");
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to register patient."); }
    finally { setSaving(false); }
  }

  const inputClass = "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50";
  const labelClass = "text-[10px] font-black uppercase tracking-[0.16em] text-slate-500";
  const sectionClass = "rounded-[1.4rem] border border-slate-200/90 bg-white p-5 shadow-[0_10px_30px_rgba(8,43,97,0.06)] sm:p-6";
  const maskedAadhaar = registered?.aadhaarMasked || (registered?.aadhaarNumber ? `XXXX XXXX ${registered.aadhaarNumber.slice(-4)}` : "Not provided");

  if (step === "complete" && registered) {
    const displayName = `${registered.firstName} ${registered.lastName}`.trim();
    const genderLabel = registered.gender ? registered.gender.charAt(0).toUpperCase() + registered.gender.slice(1) : "Not recorded";

    return (
      <main className="min-h-screen bg-[#f4f7fb] text-slate-900">
        <div className="mx-auto max-w-[1180px] px-4 py-5 sm:px-7 sm:py-8 lg:px-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0b63ce]">SAMS · Patient Management</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">Registration / New Patient</p>
            </div>
            <button type="button" onClick={() => router.push("/patients")} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-[#0b63ce]">Patient Directory</button>
          </div>

          <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#063b83] via-[#075dcc] to-[#0b63ce] px-6 py-8 text-white shadow-[0_25px_70px_rgba(8,43,97,0.22)] sm:px-10 sm:py-10">
            <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full border-[45px] border-white/10" />
            <div className="absolute -bottom-32 left-1/2 h-72 w-72 rounded-full border-[50px] border-white/5" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[11px] font-black text-white">✓</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-50">Registration complete</span>
                </div>
                <h1 className="mt-5 text-3xl font-black tracking-[-0.035em] sm:text-5xl">Patient record created.</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">The patient is now registered in SAMS and ready for the next clinical workflow.</p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-200">Patient ID</p>
                    <p className="mt-1 text-xl font-black tracking-tight">{registered.patientId}</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-200">Status</p>
                    <p className="mt-1 text-sm font-black text-emerald-200">Active</p>
                  </div>
                </div>
              </div>
              <div className="hidden lg:flex lg:h-32 lg:w-32 lg:items-center lg:justify-center lg:rounded-[2rem] lg:border lg:border-white/15 lg:bg-white/10 lg:shadow-inner">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/15 text-4xl font-black shadow-lg">✓</div>
              </div>
            </div>
          </section>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_340px]">
            <section className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(8,43,97,0.08)]">
              <div className="border-b border-slate-100 px-6 py-5 sm:px-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">Patient snapshot</p>
                    <h2 className="mt-1 text-xl font-black tracking-tight text-[#082b61]">{displayName}</h2>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700">Active record</span>
                </div>
              </div>
              <div className="grid gap-px bg-slate-100 sm:grid-cols-2">
                <div className="bg-white p-5 sm:p-6"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Patient ID</p><p className="mt-2 text-lg font-black text-[#082b61]">{registered.patientId}</p></div>
                <div className="bg-white p-5 sm:p-6"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Aadhaar</p><p className="mt-2 text-lg font-black tracking-wide text-[#082b61]">{maskedAadhaar}</p></div>
                <div className="bg-white p-5 sm:p-6"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Age / Gender</p><p className="mt-2 text-sm font-bold text-slate-700">{age ? `${age} years` : "Age not recorded"} · {genderLabel}</p></div>
                <div className="bg-white p-5 sm:p-6"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Mobile</p><p className="mt-2 text-sm font-bold text-slate-700">{registered.phone || "Not provided"}</p></div>
                <div className="bg-white p-5 sm:col-span-2 sm:p-6"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Address</p><p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{registered.address || "No address recorded"}</p></div>
              </div>
            </section>

            <aside className="space-y-5">
              <section className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(8,43,97,0.08)]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">Next clinical step</p>
                <h3 className="mt-2 text-xl font-black text-[#082b61]">Start today&apos;s visit</h3>
                <p className="mt-2 text-sm leading-5 text-slate-500">Create the OPD visit, assign the department and consultant, then continue to consultation.</p>
                <button type="button" onClick={() => router.push(`/patients/profile/${registered.id}/opd-slip`)} className="mt-5 flex w-full items-center justify-between rounded-xl bg-[#0b63ce] px-5 py-3.5 text-sm font-black text-white shadow-[0_10px_25px_rgba(11,99,206,0.25)] transition hover:bg-[#0959b9]">Start New Visit <span className="text-lg">→</span></button>
              </section>

              <section className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(8,43,97,0.06)]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Workflow</p>
                <div className="mt-5 space-y-4">
                  <div className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">✓</span><div><p className="text-sm font-black text-slate-700">Patient registration</p><p className="text-[11px] text-slate-400">Completed</p></div></div>
                  <div className="ml-3.5 h-4 border-l border-dashed border-slate-300" />
                  <div className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-[#0b63ce]">2</span><div><p className="text-sm font-black text-slate-700">OPD / New Visit</p><p className="text-[11px] text-slate-400">Next</p></div></div>
                  <div className="ml-3.5 h-4 border-l border-dashed border-slate-300" />
                  <div className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-400">3</span><div><p className="text-sm font-black text-slate-500">Consultation</p><p className="text-[11px] text-slate-400">After OPD</p></div></div>
                </div>
              </section>
            </aside>
          </div>

          {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</div>}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => router.push("/dashboard")} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-[#0b63ce]">Dashboard</button>
            <button type="button" onClick={() => window.print()} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-[#0b63ce]">Print Registration</button>
            <button type="button" onClick={() => router.push(`/patients/profile/${registered.id}`)} className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-black text-[#0b63ce]">View Patient Profile</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f8fc] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/95 shadow-[0_4px_20px_rgba(8,43,97,0.04)]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-3 sm:px-8">
          <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">SAMS · Patient Management</p><h1 className="mt-1 text-2xl font-black tracking-[-0.02em] text-[#082b61]">Register New Patient</h1><p className="mt-1 text-[13px] text-slate-500">Create a secure patient record for clinical care.</p></div>
          <button type="button" onClick={() => router.push("/patients")} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-bold text-slate-600">Back to Patients</button>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-5 py-5 sm:px-8 sm:py-7">
        <section className="mb-5 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#0b63ce] via-[#0a56b4] to-[#082b61] p-5 text-white shadow-[0_18px_45px_rgba(8,43,97,0.14)] sm:p-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">{step === "review" ? "Review before saving" : "Patient Registration"}</span><h2 className="mt-3 text-2xl font-black tracking-[-0.025em] sm:text-3xl">{step === "review" ? "Check the patient details." : "Build a Complete Patient Record"}</h2><p className="mt-2 max-w-2xl text-[13px] leading-5 text-blue-100">{step === "review" ? "Confirm the information before creating the permanent patient record." : "Enter the essential details to create a secure patient record for clinical care and future visits."}</p></div><div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-right"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">Step</p><p className="mt-1 text-lg font-black">{step === "review" ? "2 of 2" : "1 of 2"}</p></div></div>
        </section>

        {step === "form" ? (
          <form onSubmit={review} className="space-y-4">
            <section className={sectionClass}><div className="mb-6"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">01 · Identity</p><h2 className="mt-1 text-2xl font-black tracking-tight text-[#082b61]">Patient identity</h2></div><div className="grid gap-3.5 sm:grid-cols-2"><label className={labelClass}>First name<input className={inputClass} value={data.firstName} onChange={(e) => set("firstName", e.target.value)} required /></label><label className={labelClass}>Last name<input className={inputClass} value={data.lastName} onChange={(e) => set("lastName", e.target.value)} required /></label><label className={labelClass}>Aadhaar number <span className="normal-case font-semibold tracking-normal text-slate-400">optional · 12 digits</span><input className={inputClass} value={data.aadhaarNumber} onChange={(e) => set("aadhaarNumber", e.target.value.replace(/\D/g, "").slice(0, 12))} inputMode="numeric" autoComplete="off" maxLength={12} placeholder="XXXX XXXX XXXX" /></label><label className={labelClass}>Date of birth <span className="normal-case font-semibold tracking-normal text-slate-400">DD/MM/YYYY</span><input className={inputClass} value={data.dateOfBirth} onChange={(e) => set("dateOfBirth", normalizeDob(e.target.value))} inputMode="numeric" placeholder="15/04/1998" /></label><div><label className={labelClass}>Age<div className="mt-2 flex min-h-[42px] items-center rounded-xl border border-slate-200 bg-slate-100 px-3 text-[13px] font-bold text-[#082b61]">{age ? `${age} years` : "Calculated automatically"}</div></label></div><label className={labelClass}>Gender<select className={inputClass} value={data.gender} onChange={(e) => set("gender", e.target.value)}><option value="">Select gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label></div></section>
            <section className={sectionClass}><div className="mb-6"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">02 · Contact</p><h2 className="mt-1 text-2xl font-black tracking-tight text-[#082b61]">Contact information</h2></div><div className="grid gap-3.5 sm:grid-cols-2"><label className={labelClass}>Mobile number <span className="normal-case font-semibold tracking-normal text-slate-400">optional</span><input className={inputClass} value={data.phone} onChange={(e) => set("phone", e.target.value)} inputMode="tel" autoComplete="tel" placeholder="9876543210" /></label><label className={labelClass}>Emergency contact name <span className="normal-case font-semibold tracking-normal text-slate-400">optional</span><input className={inputClass} value={data.emergencyContactName} onChange={(e) => set("emergencyContactName", e.target.value)} placeholder="Full name" /></label><label className={labelClass}>Emergency mobile number <span className="normal-case font-semibold tracking-normal text-slate-400">optional</span><input className={inputClass} value={data.emergencyMobile} onChange={(e) => set("emergencyMobile", e.target.value)} inputMode="tel" placeholder="9876543210" /></label><label className={`${labelClass} sm:col-span-2`}>Address<textarea className={inputClass} value={data.address} onChange={(e) => set("address", e.target.value)} rows={3} /></label></div></section>
            {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</div>}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => router.push("/patients")} className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600">Cancel</button><button type="submit" className="rounded-xl bg-[#0b63ce] px-7 py-3 text-sm font-black text-white shadow-lg">Review Details →</button></div>
          </form>
        ) : (
          <section className={sectionClass}><div className="mb-6"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">Final review</p><h2 className="mt-1 text-2xl font-black tracking-tight text-[#082b61]">Confirm patient information</h2></div><div className="grid gap-3 sm:grid-cols-2">{[["Patient name", `${data.firstName} ${data.lastName}`], ["Aadhaar", data.aadhaarNumber ? `XXXX XXXX ${data.aadhaarNumber.slice(-4)}` : "Not provided"], ["Date of birth", data.dateOfBirth || "Not provided"], ["Age", age ? `${age} years` : "Not recorded"], ["Gender", data.gender || "Not recorded"], ["Mobile", data.phone || "Not provided"], ["Emergency contact", data.emergencyContactName || "Not provided"], ["Emergency mobile", data.emergencyMobile || "Not provided"], ["Address", data.address || "Not provided"]].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p><p className="mt-1.5 text-sm font-bold text-[#082b61]">{value}</p></div>)}</div>{error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</div>}<div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => setStep("form")} className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600">Edit Details</button><button type="button" onClick={savePatient} disabled={saving} className="rounded-xl bg-[#0b63ce] px-7 py-3 text-sm font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Creating Patient..." : "Create Patient Record →"}</button></div></section>
        )}
      </div>
    </main>
  );
}
