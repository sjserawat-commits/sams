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
type RegisteredPatient = RegistrationData & { id: number; patientId: string; aadhaarMasked?: string | null };

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

const empty: RegistrationData = { firstName: "", lastName: "", dateOfBirth: "", gender: "", phone: "", aadhaarNumber: "", address: "", emergencyContactName: "", emergencyMobile: "" };

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
  const labelClass = "text-xs font-black uppercase tracking-[0.14em] text-slate-500";
  const sectionClass = "rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(8,43,97,0.06)] sm:p-8";
  const maskedAadhaar = registered?.aadhaarMasked || (registered?.aadhaarNumber ? `XXXX XXXX ${registered.aadhaarNumber.slice(-4)}` : "Not provided");

  if (step === "complete" && registered) return <main className="min-h-screen bg-[#f5f8fc] text-slate-900"><div className="mx-auto flex min-h-screen max-w-3xl items-center px-5 py-10"><section className="w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(8,43,97,0.12)]"><div className="bg-gradient-to-br from-[#0b63ce] to-[#082b61] px-7 py-10 text-white sm:px-10"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl">✓</div><p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">Registration complete</p><h1 className="mt-2 text-3xl font-black tracking-tight">Patient record created.</h1><p className="mt-2 text-sm text-blue-100">The patient is now available in the SAMS clinical workspace.</p></div><div className="p-7 sm:p-10"><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">Patient ID</p><p className="mt-2 text-3xl font-black tracking-tight text-[#082b61]">{registered.patientId}</p></div><div className="rounded-2xl border border-slate-100 bg-slate-50 p-5"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Aadhaar</p><p className="mt-2 text-lg font-black text-[#082b61]">{maskedAadhaar}</p></div></div><div className="mt-4 rounded-2xl border border-slate-100 bg-white p-5"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Patient</p><p className="mt-2 text-lg font-black text-[#082b61]">{registered.firstName} {registered.lastName}</p><p className="mt-1 text-sm text-slate-500">{age ? `${age} years` : "Age not recorded"} · {registered.gender || "Gender not recorded"} · {registered.phone || "No mobile number"}</p></div>{error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</div>}<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end"><button onClick={() => router.push("/dashboard")} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600">Dashboard</button><button onClick={() => router.push("/patients")} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600">Patient Directory</button><button onClick={() => router.push(`/patients/profile/${registered.id}`)} className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-black text-[#0b63ce]">View Patient</button><button onClick={() => router.push(`/patients/profile/${registered.id}/encounters/new`)} className="rounded-xl bg-[#0b63ce] px-6 py-3 text-sm font-black text-white shadow-lg">Start New Visit →</button></div></div></section></div></main>;

  return <main className="min-h-screen bg-[#f5f8fc] text-slate-900"><header className="border-b border-slate-200/80 bg-white/95"><div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-5 sm:px-8"><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">SAMS · Patient Management</p><h1 className="mt-1 text-3xl font-black tracking-tight text-[#082b61]">Register New Patient</h1><p className="mt-1 text-sm text-slate-500">Create a secure patient record for clinical care.</p></div><button type="button" onClick={() => router.push("/patients")} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600">Back to Patients</button></div></header><div className="mx-auto max-w-[1200px] px-5 py-7 sm:px-8 sm:py-10"><section className="mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0b63ce] via-[#0a56b4] to-[#082b61] p-7 text-white shadow-xl shadow-blue-900/15 sm:p-9"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">{step === "review" ? "Review before saving" : "New clinical record"}</span><h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">{step === "review" ? "Check the patient details." : "Start with the essentials."}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">{step === "review" ? "Confirm the information before creating the permanent patient record." : "Enter patient information quickly and accurately."}</p></div><div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-right"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">Step</p><p className="mt-1 text-xl font-black">{step === "review" ? "2 of 2" : "1 of 2"}</p></div></div></section>

{step === "form" ? <form onSubmit={review} className="space-y-6"><section className={sectionClass}><div className="mb-6"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">01 · Identity</p><h2 className="mt-1 text-2xl font-black tracking-tight text-[#082b61]">Patient identity</h2></div><div className="grid gap-5 sm:grid-cols-2"><label className={labelClass}>First name<input className={inputClass} value={data.firstName} onChange={(e)=>set("firstName",e.target.value)} required /></label><label className={labelClass}>Last name<input className={inputClass} value={data.lastName} onChange={(e)=>set("lastName",e.target.value)} required /></label><label className={labelClass}>Aadhaar number <span className="normal-case font-semibold tracking-normal text-slate-400">optional · 12 digits</span><input className={inputClass} value={data.aadhaarNumber} onChange={(e)=>set("aadhaarNumber",e.target.value.replace(/\D/g,"").slice(0,12))} inputMode="numeric" autoComplete="off" maxLength={12} placeholder="XXXX XXXX XXXX" /></label><label className={labelClass}>Date of birth <span className="normal-case font-semibold tracking-normal text-slate-400">DD/MM/YYYY</span><input className={inputClass} value={data.dateOfBirth} onChange={(e)=>set("dateOfBirth",normalizeDob(e.target.value))} inputMode="numeric" placeholder="15/04/1998" /></label><div><label className={labelClass}>Age<div className="mt-2 flex min-h-[48px] items-center rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-bold text-[#082b61]">{age ? `${age} years` : "Calculated automatically"}</div></label></div><label className={labelClass}>Gender<select className={inputClass} value={data.gender} onChange={(e)=>set("gender",e.target.value)}><option value="">Select gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label></div></section><section className={sectionClass}><div className="mb-6"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">02 · Contact</p><h2 className="mt-1 text-2xl font-black tracking-tight text-[#082b61]">Contact information</h2></div><div className="grid gap-5 sm:grid-cols-2"><label className={labelClass}>Mobile number <span className="normal-case font-semibold tracking-normal text-slate-400">optional</span><input className={inputClass} value={data.phone} onChange={(e)=>set("phone",e.target.value)} inputMode="tel" autoComplete="tel" placeholder="9876543210" /></label><label className={labelClass}>Emergency contact name <span className="normal-case font-semibold tracking-normal text-slate-400">optional</span><input className={inputClass} value={data.emergencyContactName} onChange={(e)=>set("emergencyContactName",e.target.value)} placeholder="Full name" /></label><label className={labelClass}>Emergency mobile number <span className="normal-case font-semibold tracking-normal text-slate-400">optional</span><input className={inputClass} value={data.emergencyMobile} onChange={(e)=>set("emergencyMobile",e.target.value)} inputMode="tel" placeholder="9876543210" /></label><label className={`${labelClass} sm:col-span-2`}>Address<textarea className={inputClass} value={data.address} onChange={(e)=>set("address",e.target.value)} rows={4} /></label></div></section>{error && <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</div>}<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => router.push("/patients")} className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600">Cancel</button><button type="submit" className="rounded-xl bg-[#0b63ce] px-7 py-3 text-sm font-black text-white shadow-lg">Review Details →</button></div></form> : <section className={sectionClass}><div className="grid gap-3 sm:grid-cols-2">{[["Patient name",`${data.firstName} ${data.lastName}`],["Aadhaar",data.aadhaarNumber ? `XXXX XXXX ${data.aadhaarNumber.slice(-4)}` : "Not provided"],["Date of birth",data.dateOfBirth || "Not provided"],["Age",age ? `${age} years` : "Not recorded"],["Gender",data.gender || "Not recorded"],["Mobile",data.phone || "Not provided"],["Emergency contact name",data.emergencyContactName || "Not provided"],["Emergency mobile",data.emergencyMobile || "Not provided"],["Address",data.address || "Not provided"]].map(([label,value])=><div key={label} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4"><p className="text-[9px] font-black uppercase tracking-[0.17em] text-slate-400">{label}</p><p className="mt-2 break-words text-sm font-bold text-[#082b61]">{value}</p></div>)}</div>{error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</div>}<div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={()=>{setError("");setStep("form")}} className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600">← Edit Details</button><button type="button" onClick={savePatient} disabled={saving} className="rounded-xl bg-[#0b63ce] px-7 py-3 text-sm font-black text-white shadow-lg disabled:opacity-60">{saving ? "Saving Patient…" : "Confirm & Register Patient →"}</button></div></section>}
</div></main>;
}
