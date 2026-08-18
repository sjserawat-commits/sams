"use client";

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

type RegisteredPatient = RegistrationData & { id: number; patientId: string; aadhaarMasked?: string | null };
type Step = 1 | 2 | 3;

const empty: RegistrationData = {
  firstName: "", lastName: "", dateOfBirth: "", gender: "", phone: "",
  aadhaarNumber: "", address: "", emergencyContactName: "", emergencyMobile: "",
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
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age >= 0 && age < 150 ? String(age) : "";
}

function toApiDate(value: string) {
  const date = parseManualDate(value);
  return date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` : "";
}

const steps = ["Identity", "Contact & Safety", "Review"];

export default function NewPatientPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<RegistrationData>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState<RegisteredPatient | null>(null);
  const age = useMemo(() => calculateAge(data.dateOfBirth), [data.dateOfBirth]);

  const set = (key: keyof RegistrationData, value: string) => {
    const clean = key === "phone" || key === "emergencyMobile" ? value.replace(/\D/g, "").slice(0, 10) : value;
    setData((current) => ({ ...current, [key]: clean }));
  };

  function validateIdentity() {
    if (!data.firstName.trim() || !data.lastName.trim()) return "First name and last name are required.";
    if (data.dateOfBirth && !parseManualDate(data.dateOfBirth)) return "Please enter a valid date of birth in DD/MM/YYYY format.";
    if (data.aadhaarNumber && data.aadhaarNumber.replace(/\D/g, "").length !== 12) return "Aadhaar number must contain exactly 12 digits.";
    return "";
  }

  function validateContact() {
    if (data.phone && data.phone.length !== 10) return "Please enter a valid 10-digit mobile number.";
    if (data.emergencyMobile && data.emergencyMobile.length !== 10) return "Please enter a valid 10-digit emergency mobile number.";
    if (data.emergencyMobile && !data.emergencyContactName.trim()) return "Enter the emergency contact name when an emergency mobile is provided.";
    return "";
  }

  function next(event?: FormEvent) {
    event?.preventDefault();
    setError("");
    const message = step === 1 ? validateIdentity() : validateContact();
    if (message) return setError(message);
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
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, aadhaarNumber, phone, emergencyMobile, emergencyContact, dateOfBirth: toApiDate(data.dateOfBirth) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to register patient.");
      setRegistered({ ...result, ...data, phone, emergencyMobile, aadhaarNumber, aadhaarMasked: result.aadhaarNumber });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register patient.");
    } finally {
      setSaving(false);
    }
  }

  if (registered) {
    return <Completion registered={registered} age={calculateAge(registered.dateOfBirth)} onNew={() => { setRegistered(null); setData(empty); setStep(1); }} onProfile={() => router.push(`/patients/profile/${registered.id}`)} onVisit={() => router.push(`/patients/profile/${registered.id}/opd-slip`)} />;
  }

  const inputClass = "mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#0b63ce] focus:ring-2 focus:ring-blue-100";
  const cardClass = "rounded-xl border border-slate-200 bg-white p-6 sm:p-8";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      <div className="lg:sticky lg:top-0 lg:h-screen lg:w-[270px] lg:shrink-0"><Sidebar variant="reception" /></div>
      <div className="min-w-0 flex-1">
        <Navigation variant="reception" />
        <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Link href="/reception" className="text-xs font-semibold text-[#0b63ce] hover:underline">← Reception Desk</Link>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#082b61]">New Patient Registration</h1>
              <p className="mt-2 text-sm text-slate-500">Enter patient details and create the patient record.</p>
            </div>
            <p className="text-sm font-semibold text-slate-500">Step {step} of 3 · {steps[step - 1]}</p>
          </div>

          <div className="mb-8 grid grid-cols-3 gap-2 sm:gap-4">
            {steps.map((label, index) => {
              const number = index + 1;
              const active = step === number;
              const done = step > number;
              return <button key={label} type="button" disabled={number > step} onClick={() => number < step && setStep(number as Step)} className={`border-b-2 px-2 py-3 text-left text-sm font-semibold ${active ? "border-[#0b63ce] text-[#0b63ce]" : done ? "border-emerald-500 text-emerald-600" : "border-slate-200 text-slate-400"}`}><span className="mr-2">{done ? "✓" : number}</span>{label}</button>;
            })}
          </div>

          {error && <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

          {step === 1 && <form onSubmit={next} className="space-y-6">
            <section className={cardClass}>
              <h2 className="text-lg font-bold text-[#082b61]">Patient identity</h2>
              <p className="mt-1 text-sm text-slate-500">Basic details required to create the patient record.</p>
              <div className="mt-7 grid gap-6 md:grid-cols-2">
                <Field label="First name *"><input autoFocus value={data.firstName} onChange={(e) => set("firstName", e.target.value)} className={inputClass} autoComplete="given-name" /></Field>
                <Field label="Last name *"><input value={data.lastName} onChange={(e) => set("lastName", e.target.value)} className={inputClass} autoComplete="family-name" /></Field>
                <Field label="Date of birth"><input value={data.dateOfBirth} onChange={(e) => set("dateOfBirth", normalizeDob(e.target.value))} inputMode="numeric" maxLength={10} placeholder="DD/MM/YYYY" className={inputClass} />{age && <p className="mt-2 text-xs font-semibold text-[#0b63ce]">Age: {age} years</p>}</Field>
                <Field label="Gender"><select value={data.gender} onChange={(e) => set("gender", e.target.value)} className={inputClass}><option value="">Select gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option><option value="prefer-not-to-say">Prefer not to say</option></select></Field>
                <Field label="Aadhaar number" hint="Optional · 12 digits"><input value={data.aadhaarNumber} onChange={(e) => set("aadhaarNumber", e.target.value.replace(/\D/g, "").slice(0, 12))} inputMode="numeric" maxLength={12} className={inputClass} /></Field>
              </div>
            </section>
            <div className="flex justify-between"><button type="button" onClick={back} className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-600">Back</button><button type="submit" className="rounded-lg bg-[#0b63ce] px-6 py-3 text-sm font-semibold text-white">Continue</button></div>
          </form>}

          {step === 2 && <form onSubmit={next} className="space-y-6">
            <section className={cardClass}>
              <h2 className="text-lg font-bold text-[#082b61]">Contact & Safety</h2>
              <p className="mt-1 text-sm text-slate-500">Contact information is optional but useful for patient communication.</p>
              <div className="mt-7 grid gap-6 md:grid-cols-2">
                <Field label="Mobile number" hint="Optional · 10 digits"><input value={data.phone} onChange={(e) => set("phone", e.target.value)} inputMode="numeric" maxLength={10} pattern="[0-9]{10}" placeholder="10-digit mobile number" className={inputClass} autoComplete="tel" /></Field>
                <Field label="Address" hint="Optional"><input value={data.address} onChange={(e) => set("address", e.target.value)} className={inputClass} autoComplete="street-address" /></Field>
              </div>
            </section>
            <section className={cardClass}>
              <h2 className="text-lg font-bold text-[#082b61]">Emergency contact</h2>
              <p className="mt-1 text-sm text-slate-500">Optional. Add when an emergency contact is available.</p>
              <div className="mt-7 grid gap-6 md:grid-cols-2">
                <Field label="Contact name"><input value={data.emergencyContactName} onChange={(e) => set("emergencyContactName", e.target.value)} className={inputClass} /></Field>
                <Field label="Emergency mobile" hint="10 digits"><input value={data.emergencyMobile} onChange={(e) => set("emergencyMobile", e.target.value)} inputMode="numeric" maxLength={10} pattern="[0-9]{10}" className={inputClass} /></Field>
              </div>
            </section>
            <div className="flex justify-between"><button type="button" onClick={back} className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-600">Back</button><button type="submit" className="rounded-lg bg-[#0b63ce] px-6 py-3 text-sm font-semibold text-white">Review</button></div>
          </form>}

          {step === 3 && <section className="space-y-6">
            <div className={cardClass}>
              <h2 className="text-lg font-bold text-[#082b61]">Review patient details</h2>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <Review label="Patient name" value={`${data.firstName} ${data.lastName}`} />
                <Review label="Date of birth / age" value={data.dateOfBirth ? `${data.dateOfBirth}${age ? ` · ${age} years` : ""}` : "Not provided"} />
                <Review label="Gender" value={data.gender || "Not provided"} />
                <Review label="Aadhaar" value={data.aadhaarNumber ? `XXXX XXXX ${data.aadhaarNumber.slice(-4)}` : "Not provided"} />
                <Review label="Mobile" value={data.phone || "Not provided"} />
                <Review label="Address" value={data.address || "Not provided"} />
                <Review label="Emergency contact" value={data.emergencyContactName ? `${data.emergencyContactName}${data.emergencyMobile ? ` · ${data.emergencyMobile}` : ""}` : "Not provided"} wide />
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><button type="button" onClick={back} className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-600">Edit details</button><button type="button" disabled={saving} onClick={savePatient} className="rounded-lg bg-[#0b63ce] px-7 py-3 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Creating patient…" : "Create Patient Record"}</button></div>
          </section>}
        </div>
      </div>
    </main>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="block"><span className="flex justify-between gap-3 text-xs font-semibold text-slate-600"><span>{label}</span>{hint && <span className="font-normal text-slate-400">{hint}</span>}</span>{children}</label>;
}

function Review({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return <div className={`rounded-lg bg-slate-50 p-4 ${wide ? "sm:col-span-2" : ""}`}><p className="text-xs font-semibold text-slate-400">{label}</p><p className="mt-2 text-sm font-semibold text-slate-800 break-words">{value}</p></div>;
}

function Completion({ registered, age, onNew, onProfile, onVisit }: { registered: RegisteredPatient; age: string; onNew: () => void; onProfile: () => void; onVisit: () => void }) {
  const displayName = `${registered.firstName} ${registered.lastName}`.trim();
  const masked = registered.aadhaarMasked || (registered.aadhaarNumber ? `XXXX XXXX ${registered.aadhaarNumber.slice(-4)}` : "Not provided");
  return <main className="min-h-screen bg-slate-50 text-slate-900 lg:flex"><div className="lg:sticky lg:top-0 lg:h-screen lg:w-[270px] lg:shrink-0"><Sidebar variant="reception" /></div><div className="min-w-0 flex-1"><Navigation variant="reception" /><div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6 lg:px-10"><section className="rounded-xl border border-emerald-200 bg-white p-8 text-center sm:p-12"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">✓</div><h1 className="mt-5 text-3xl font-bold text-[#082b61]">Patient record created</h1><p className="mt-2 text-sm text-slate-500">{displayName} is now registered in SAMS.</p><div className="mt-7 inline-flex flex-wrap justify-center gap-8 rounded-lg bg-slate-50 px-7 py-4"><div><p className="text-xs text-slate-400">Patient ID</p><p className="mt-1 text-lg font-bold text-[#0b63ce]">{registered.patientId}</p></div><div><p className="text-xs text-slate-400">Status</p><p className="mt-1 text-sm font-bold text-emerald-600">Active</p></div></div></section><section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 sm:p-8"><h2 className="text-lg font-bold text-[#082b61]">Patient summary</h2><div className="mt-6 grid gap-4 sm:grid-cols-2"><Review label="Patient ID" value={registered.patientId} /><Review label="Aadhaar" value={masked} /><Review label="Age / Gender" value={`${age ? `${age} years` : "Age not recorded"} · ${registered.gender || "Not recorded"}`} /><Review label="Mobile" value={registered.phone || "Not provided"} /><Review label="Address" value={registered.address || "Not provided"} wide /></div></section><div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onNew} className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-600">Register Another Patient</button><button type="button" onClick={onProfile} className="rounded-lg border border-[#0b63ce] bg-white px-5 py-3 text-sm font-semibold text-[#0b63ce]">Open Patient Profile</button><button type="button" onClick={onVisit} className="rounded-lg bg-[#0b63ce] px-5 py-3 text-sm font-semibold text-white">Start New Visit</button></div></div></div></main>;
}
