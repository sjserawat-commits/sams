"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, ReactNode, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navigation from "@/components/Navigation";

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

type Step = 1 | 2 | 3;

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

const steps = [
  { number: 1, label: "Identity", hint: "Basic patient details" },
  { number: 2, label: "Contact & Safety", hint: "Contact and emergency details" },
  { number: 3, label: "Review", hint: "Verify before registration" },
];

export default function NewPatientPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<RegistrationData>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState<RegisteredPatient | null>(null);
  const age = useMemo(() => calculateAge(data.dateOfBirth), [data.dateOfBirth]);
  const set = (key: keyof RegistrationData, value: string) => setData((current) => ({ ...current, [key]: key === "phone" || key === "emergencyMobile" ? value.replace(/\D/g, "").slice(0, 10) : value }));

  function validateIdentity() {
    if (!data.firstName.trim() || !data.lastName.trim()) return "First name and last name are required.";
    if (data.dateOfBirth && !parseManualDate(data.dateOfBirth)) return "Please enter a valid date of birth in DD/MM/YYYY format.";
    const aadhaar = data.aadhaarNumber.replace(/\D/g, "");
    if (aadhaar && aadhaar.length !== 12) return "Aadhaar number must contain exactly 12 digits.";
    return "";
  }

  function validateContact() {
    const phone = data.phone.replace(/\D/g, "");
    const emergencyMobile = data.emergencyMobile.replace(/\D/g, "");
    if (phone && phone.length !== 10) return "Please enter a valid 10-digit mobile number.";
    if (emergencyMobile && emergencyMobile.length !== 10) return "Please enter a valid 10-digit emergency mobile number.";
    if (emergencyMobile && !data.emergencyContactName.trim()) return "Enter the emergency contact name when an emergency mobile is provided.";
    return "";
  }

  function next(event?: FormEvent) {
    event?.preventDefault();
    setError("");
    const message = step === 1 ? validateIdentity() : validateContact();
    if (message) { setError(message); return; }
    if (step === 1) setData((current) => ({ ...current, aadhaarNumber: current.aadhaarNumber.replace(/\D/g, "") }));
    if (step === 2) setData((current) => ({ ...current, phone: current.phone.replace(/\D/g, "").slice(0, 10), emergencyMobile: current.emergencyMobile.replace(/\D/g, "").slice(0, 10) }));
    setStep((current) => Math.min(3, current + 1) as Step);
  }

  function back() {
    setError("");
    if (step > 1) setStep((current) => Math.max(1, current - 1) as Step);
    else router.back();
  }

  async function savePatient() {
    setError("");
    setSaving(true);
    try {
      const aadhaarNumber = data.aadhaarNumber.replace(/\D/g, "");
      const phone = data.phone.replace(/\D/g, "").slice(0, 10);
      const emergencyMobile = data.emergencyMobile.replace(/\D/g, "").slice(0, 10);
      const emergencyContact = [data.emergencyContactName.trim(), emergencyMobile].filter(Boolean).join(" · ");
      const response = await fetch("/api/patients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, aadhaarNumber, phone, emergencyMobile, emergencyContact, dateOfBirth: toApiDate(data.dateOfBirth) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to register patient.");
      setRegistered({ ...result, ...data, phone, emergencyMobile, aadhaarNumber, aadhaarMasked: result.aadhaarNumber });
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to register patient."); }
    finally { setSaving(false); }
  }

  if (registered) return <Completion registered={registered} age={calculateAge(registered.dateOfBirth)} onNew={() => { setRegistered(null); setData(empty); setStep(1); setError(""); }} onProfile={() => router.push(`/patients/profile/${registered.id}`)} onVisit={() => router.push(`/patients/profile/${registered.id}/opd-slip`)} />;

  const inputClass = "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#d6a443] focus:bg-white focus:ring-4 focus:ring-[#d6a443]/10";
  const sectionClass = "rounded-[1.6rem] border border-slate-200/80 bg-white p-5 shadow-[0_14px_45px_rgba(8,43,97,0.07)] sm:p-7";

  return (
    <main className="min-h-screen bg-[#050c16] text-slate-100 lg:flex">
      <div className="lg:sticky lg:top-0 lg:h-screen lg:w-[270px] lg:shrink-0"><Sidebar variant="reception" /></div>
      <div className="min-w-0 flex-1">
        <Navigation variant="reception" />
        <div className="relative overflow-hidden px-3 py-4 sm:px-6 lg:px-8 lg:py-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_8%,rgba(214,164,67,0.13),transparent_25%),radial-gradient(circle_at_18%_45%,rgba(11,99,206,0.14),transparent_30%),linear-gradient(135deg,#040b14_0%,#08182a_52%,#050c16_100%)]" />
          <section className="relative mx-auto max-w-[1500px] overflow-hidden rounded-[2.25rem] border border-[#d6a443]/40 bg-[linear-gradient(135deg,rgba(5,18,31,0.96),rgba(12,38,61,0.92)_52%,rgba(5,14,24,0.97))] px-5 py-7 shadow-[0_30px_90px_rgba(0,0,0,0.42)] sm:px-9 sm:py-9 lg:px-12">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#082b61] via-[#d6a443] to-[#f4d58c]" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-end overflow-hidden"><Image src="/serawat-H-logo.png" alt="" aria-hidden="true" fill sizes="(max-width: 1024px) 100vw, 1500px" className="object-contain object-right p-6 opacity-[0.14]" /></div>
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div><Link href="/reception" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#f4d58c] transition hover:text-white">← Reception Desk</Link><p className="mt-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#d6a443]">SAMS · Patient Management</p><h1 className="mt-2 text-3xl font-black tracking-[-0.035em] text-white sm:text-5xl">New Patient Registration</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">A guided intake workspace designed to capture the right information once and move the patient smoothly into the clinical workflow.</p></div>
              <div className="rounded-2xl border border-white/10 bg-[#071525]/70 px-4 py-3 backdrop-blur-xl"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Workflow status</p><p className="mt-1 text-sm font-black text-white">Step {step} of 3 · {steps[step - 1].label}</p></div>
            </div>
          </section>
          <section className="relative mx-auto mt-5 max-w-[1500px] rounded-[1.8rem] border border-white/10 bg-[#071525]/80 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-5"><div className="grid gap-3 md:grid-cols-3">{steps.map((item) => { const active = step === item.number; const complete = step > item.number; return <button key={item.number} type="button" onClick={() => item.number < step && setStep(item.number as Step)} disabled={item.number > step} className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${active ? "border-[#d6a443]/60 bg-[#d6a443]/10" : complete ? "border-emerald-400/20 bg-emerald-400/5 hover:border-emerald-400/40" : "border-white/10 bg-white/[0.02] opacity-60"}`}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black ${complete ? "bg-emerald-400 text-[#071525]" : active ? "bg-[#d6a443] text-[#071525]" : "bg-white/10 text-slate-400"}`}>{complete ? "✓" : item.number}</span><span><span className={`block text-xs font-black ${active ? "text-[#f4d58c]" : complete ? "text-emerald-200" : "text-slate-300"}`}>{item.label}</span><span className="mt-0.5 block text-[10px] text-slate-500">{item.hint}</span></span></button>; })}</div></section>
          <div className="relative mx-auto mt-5 max-w-[1500px]">
            {error && <div role="alert" className="mb-5 flex items-start gap-3 rounded-2xl border border-red-300/20 bg-red-950/50 px-5 py-4 text-sm font-semibold text-red-100"><span className="mt-0.5">⚠</span><span>{error}</span></div>}
            {step === 1 && <form onSubmit={next} className="grid gap-5 lg:grid-cols-[1fr_330px]"><section className={sectionClass}><div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">01 · Identity</p><h2 className="mt-1 text-xl font-black text-[#082b61]">Who is the patient?</h2><p className="mt-1 text-sm text-slate-500">Start with the core identity information. Fields marked * are required.</p></div><span className="rounded-full bg-blue-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#0b63ce]">Required first</span></div><div className="mt-6 grid gap-5 sm:grid-cols-2"><Field label="First name *"><input autoFocus value={data.firstName} onChange={(e) => set("firstName", e.target.value)} className={inputClass} placeholder="Enter first name" autoComplete="given-name" /></Field><Field label="Last name *"><input value={data.lastName} onChange={(e) => set("lastName", e.target.value)} className={inputClass} placeholder="Enter last name" autoComplete="family-name" /></Field><Field label="Date of birth"><input value={data.dateOfBirth} onChange={(e) => set("dateOfBirth", normalizeDob(e.target.value))} inputMode="numeric" maxLength={10} className={inputClass} placeholder="DD/MM/YYYY" />{age && <p className="mt-2 text-xs font-bold text-[#0b63ce]">Calculated age: {age} years</p>}</Field><Field label="Gender"><select value={data.gender} onChange={(e) => set("gender", e.target.value)} className={inputClass}><option value="">Select gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option><option value="prefer-not-to-say">Prefer not to say</option></select></Field><Field label="Aadhaar number" hint="Optional · 12 digits"><input value={data.aadhaarNumber} onChange={(e) => set("aadhaarNumber", e.target.value.replace(/\D/g, "").slice(0, 12))} inputMode="numeric" maxLength={12} className={inputClass} placeholder="12-digit Aadhaar" /></Field></div></section><aside className="space-y-5"><section className="rounded-[1.6rem] border border-[#d6a443]/25 bg-[linear-gradient(145deg,#0b2238,#071525)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.28)]"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d6a443]">Registration principle</p><h3 className="mt-2 text-xl font-black text-white">One patient. One identity.</h3><p className="mt-2 text-sm leading-6 text-slate-300">SAMS creates a unique Patient ID after successful registration. Keep the identity details accurate before continuing.</p><div className="mt-5 space-y-3 text-xs font-semibold text-slate-300"><p>✓ Required identity fields are validated before review.</p><p>✓ Aadhaar is optional and masked after registration.</p><p>✓ Mobile remains optional.</p></div></section><section className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-6"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">Next</p><p className="mt-2 text-sm font-bold text-white">Contact &amp; Safety</p><p className="mt-1 text-xs leading-5 text-slate-400">Optional contact details and emergency information.</p></section></aside><div className="lg:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><button type="button" onClick={back} className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-white/20 hover:bg-white/[0.07]">← Back</button><button type="submit" className="rounded-xl bg-[#d6a443] px-6 py-3 text-sm font-black text-[#071525] shadow-[0_10px_30px_rgba(214,164,67,0.18)] transition hover:bg-[#f4d58c]">Continue to Contact →</button></div></form>}
            {step === 2 && <form onSubmit={next} className="grid gap-5 lg:grid-cols-[1fr_330px]"><section className={sectionClass}><div className="border-b border-slate-100 pb-5"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">02 · Contact &amp; Safety</p><h2 className="mt-1 text-xl font-black text-[#082b61]">How can we reach the patient?</h2><p className="mt-1 text-sm text-slate-500">Contact information is optional. Emergency details can be added when available.</p></div><div className="mt-6 grid gap-5 sm:grid-cols-2"><Field label="Mobile number" hint="Optional"><input value={data.phone} onChange={(e) => set("phone", e.target.value)} inputMode="tel" maxLength={10} pattern="[0-9]{10}" className={inputClass} placeholder="10-digit mobile number" autoComplete="tel" /></Field><Field label="Address" hint="Optional"><input value={data.address} onChange={(e) => set("address", e.target.value)} className={inputClass} placeholder="House / locality / city" autoComplete="street-address" /></Field><div className="sm:col-span-2 rounded-[1.4rem] border border-amber-200 bg-amber-50/80 p-5"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">Emergency contact · Optional</p><div className="mt-4 grid gap-5 sm:grid-cols-2"><Field label="Contact name"><input value={data.emergencyContactName} onChange={(e) => set("emergencyContactName", e.target.value)} className={inputClass} placeholder="Name of contact person" /></Field><Field label="Emergency mobile"><input value={data.emergencyMobile} onChange={(e) => set("emergencyMobile", e.target.value)} inputMode="tel" maxLength={10} pattern="[0-9]{10}" className={inputClass} placeholder="Contact mobile number" /></Field></div></div></div></section><aside className="space-y-5"><section className="rounded-[1.6rem] border border-white/10 bg-[#071525] p-6"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d6a443]">Patient identity</p><p className="mt-2 text-2xl font-black text-white">{data.firstName} {data.lastName}</p><p className="mt-1 text-xs text-slate-400">{age ? `${age} years` : "Age not recorded"} · {data.gender || "Gender not recorded"}</p><div className="mt-5 border-t border-white/10 pt-5"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">Identity status</p><p className="mt-1 text-sm font-black text-emerald-300">Ready for review</p></div></section><section className="rounded-[1.6rem] border border-[#d6a443]/20 bg-[#d6a443]/5 p-6"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#d6a443]">Privacy</p><p className="mt-2 text-xs leading-5 text-slate-300">Only information provided by the patient or attendant is recorded. Mobile number is not mandatory for registration or Patient Portal access.</p></section></aside><div className="lg:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><button type="button" onClick={back} className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-white/20 hover:bg-white/[0.07]">← Back to Identity</button><button type="submit" className="rounded-xl bg-[#d6a443] px-6 py-3 text-sm font-black text-[#071525] shadow-[0_10px_30px_rgba(214,164,67,0.18)] transition hover:bg-[#f4d58c]">Review Patient →</button></div></form>}
            {step === 3 && <div className="grid gap-5 lg:grid-cols-[1fr_330px]"><section className={sectionClass}><div className="border-b border-slate-100 pb-5"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">03 · Final Review</p><h2 className="mt-1 text-xl font-black text-[#082b61]">Verify before creating the record</h2><p className="mt-1 text-sm text-slate-500">Check the information once. After registration, SAMS will issue the Patient ID.</p></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><ReviewCard label="Patient name" value={`${data.firstName} ${data.lastName}`} /><ReviewCard label="Date of birth / age" value={data.dateOfBirth ? `${data.dateOfBirth}${age ? ` · ${age} years` : ""}` : "Not provided"} /><ReviewCard label="Gender" value={data.gender || "Not provided"} /><ReviewCard label="Aadhaar" value={data.aadhaarNumber ? `XXXX XXXX ${data.aadhaarNumber.slice(-4)}` : "Not provided"} /><ReviewCard label="Mobile" value={data.phone || "Not provided"} /><ReviewCard label="Address" value={data.address || "Not provided"} /><ReviewCard label="Emergency contact" value={data.emergencyContactName ? `${data.emergencyContactName}${data.emergencyMobile ? ` · ${data.emergencyMobile}` : ""}` : "Not provided"} wide /></div></section><aside className="space-y-5"><section className="rounded-[1.6rem] border border-[#d6a443]/30 bg-[linear-gradient(145deg,#0b2238,#071525)] p-6"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d6a443]">Ready to register</p><h3 className="mt-2 text-2xl font-black text-white">Create patient record</h3><p className="mt-2 text-sm leading-6 text-slate-300">This will create the patient in SAMS and make the record available to Reception, OPD, Clinical, Investigations, Billing and Patient Portal.</p><button type="button" disabled={saving} onClick={savePatient} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#d6a443] px-5 py-3.5 text-sm font-black text-[#071525] shadow-[0_12px_32px_rgba(214,164,67,0.2)] transition hover:bg-[#f4d58c] disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Creating patient…" : "✓ Create Patient Record"}</button></section><section className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-6"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">Workflow after save</p><div className="mt-4 space-y-3 text-xs font-bold text-slate-300"><p><span className="text-emerald-300">01</span> Patient ID generated</p><p><span className="text-[#d6a443]">02</span> Patient profile available</p><p><span className="text-[#d6a443]">03</span> OPD / New Visit can begin</p><p><span className="text-[#d6a443]">04</span> Clinical workflow continues</p></div></section></aside><div className="lg:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><button type="button" onClick={back} className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-white/20 hover:bg-white/[0.07]">← Edit Details</button><button type="button" onClick={() => router.push("/reception")} className="rounded-xl border border-white/10 bg-transparent px-5 py-3 text-sm font-bold text-slate-400 transition hover:text-white">Cancel Registration</button></div></div>}
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="block"><span className="flex items-center justify-between gap-3"><span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">{label}</span>{hint && <span className="text-[9px] font-semibold text-slate-400">{hint}</span>}</span>{children}</label>;
}

function ReviewCard({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return <div className={`rounded-2xl border border-slate-100 bg-slate-50 p-4 ${wide ? "sm:col-span-2" : ""}`}><p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p><p className="mt-2 break-words text-sm font-bold text-[#082b61]">{value}</p></div>;
}

function Completion({ registered, age, onNew, onProfile, onVisit }: { registered: RegisteredPatient; age: string; onNew: () => void; onProfile: () => void; onVisit: () => void }) {
  const displayName = `${registered.firstName} ${registered.lastName}`.trim();
  const masked = registered.aadhaarMasked || (registered.aadhaarNumber ? `XXXX XXXX ${registered.aadhaarNumber.slice(-4)}` : "Not provided");
  return <main className="min-h-screen bg-[#050c16] text-slate-100 lg:flex"><div className="lg:sticky lg:top-0 lg:h-screen lg:w-[270px] lg:shrink-0"><Sidebar variant="reception" /></div><div className="min-w-0 flex-1"><Navigation variant="reception" /><div className="relative overflow-hidden px-3 py-5 sm:px-6 lg:px-8 lg:py-8"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_65%_10%,rgba(214,164,67,0.15),transparent_28%),linear-gradient(135deg,#040b14,#08182a_50%,#050c16)]" /><div className="relative mx-auto max-w-[1250px]"><div className="mb-5"><Link href="/reception" className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f4d58c]">← Reception Desk</Link></div><section className="relative overflow-hidden rounded-[2.25rem] border border-[#d6a443]/40 bg-[linear-gradient(135deg,rgba(5,18,31,0.96),rgba(12,38,61,0.92))] px-6 py-10 shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:px-10"><div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#082b61] via-[#d6a443] to-[#f4d58c]" /><div className="relative text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-400/10 text-3xl text-emerald-300">✓</div><p className="mt-5 text-[10px] font-black uppercase tracking-[0.24em] text-[#d6a443]">Registration complete</p><h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">Patient record created.</h1><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-300">The patient is now registered in SAMS and ready to move into the next clinical workflow.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><div className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Patient ID</p><p className="mt-1 text-xl font-black text-[#f4d58c]">{registered.patientId}</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Status</p><p className="mt-1 text-sm font-black text-emerald-300">Active</p></div></div></div></section><div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]"><section className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white text-slate-900 shadow-[0_18px_55px_rgba(0,0,0,0.25)]"><div className="border-b border-slate-100 px-6 py-5"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">Patient snapshot</p><h2 className="mt-1 text-xl font-black text-[#082b61]">{displayName}</h2></div><div className="grid gap-px bg-slate-100 sm:grid-cols-2"><ReviewCard label="Patient ID" value={registered.patientId} /><ReviewCard label="Aadhaar" value={masked} /><ReviewCard label="Age / Gender" value={`${age ? `${age} years` : "Age not recorded"} · ${registered.gender || "Not recorded"}`} /><ReviewCard label="Mobile" value={registered.phone || "Not provided"} /><ReviewCard label="Address" value={registered.address || "Not provided"} wide /></div></section><aside className="space-y-4"><section className="rounded-[1.8rem] border border-[#d6a443]/25 bg-[linear-gradient(145deg,#0b2238,#071525)] p-6"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d6a443]">Next clinical step</p><h3 className="mt-2 text-xl font-black text-white">Start today&apos;s visit</h3><p className="mt-2 text-sm leading-6 text-slate-300">Continue directly to the OPD/new visit workflow.</p><button type="button" onClick={onVisit} className="mt-5 flex w-full items-center justify-between rounded-xl bg-[#d6a443] px-5 py-3.5 text-sm font-black text-[#071525] transition hover:bg-[#f4d58c]">Start New Visit <span>→</span></button></section><button type="button" onClick={onProfile} className="w-full rounded-xl border border-white/15 bg-white/[0.05] px-5 py-3.5 text-sm font-black text-white transition hover:border-[#d6a443]/50 hover:bg-white/[0.08]">Open Patient Profile</button></aside></div><div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onNew} className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/[0.08]">+ Register Another Patient</button><button type="button" onClick={() => window.print()} className="rounded-xl border border-[#d6a443]/40 bg-[#d6a443] px-5 py-3 text-sm font-black text-[#071525] transition hover:bg-[#f4d58c]">Print Registration Summary</button></div></div></div></div></main>;
}
