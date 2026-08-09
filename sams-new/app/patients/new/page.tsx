"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPatientPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const data = {
      firstName: String(formData.get("firstName") || ""),
      lastName: String(formData.get("lastName") || ""),
      dateOfBirth: String(formData.get("dateOfBirth") || ""),
      gender: String(formData.get("gender") || ""),
      phone: String(formData.get("phone") || ""),
      address: String(formData.get("address") || ""),
    };

    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to register patient.");
      router.push("/patients/list");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register patient.");
      setSaving(false);
    }
  }

  const inputClass = "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50";
  const labelClass = "text-xs font-black uppercase tracking-[0.14em] text-slate-500";

  return (
    <main className="min-h-screen bg-[#f5f8fc] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-5 sm:px-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">SAMS · Patient Management</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-[#082b61]">Register New Patient</h1>
            <p className="mt-1 text-sm text-slate-500">Create a secure patient record for clinical care.</p>
          </div>
          <button type="button" onClick={() => router.push("/patients")} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-blue-200 hover:text-[#0b63ce]">Back to Patients</button>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-5 py-7 sm:px-8 sm:py-10">
        <section className="mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0b63ce] via-[#0a56b4] to-[#082b61] p-7 text-white shadow-xl shadow-blue-900/15 sm:p-9">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">New clinical record</span>
              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Start with the essentials.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">Enter accurate demographic and contact information. You can continue with clinical documentation after registration.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-right backdrop-blur-sm"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">Step</p><p className="mt-1 text-xl font-black">01 / Registration</p></div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(8,43,97,0.06)] sm:p-8">
            <div className="mb-6"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">01 · Identity</p><h2 className="mt-1 text-2xl font-black tracking-tight text-[#082b61]">Patient identity</h2><p className="mt-1 text-sm text-slate-500">Basic information used to identify the patient.</p></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className={labelClass}>First name<input className={inputClass} id="firstName" name="firstName" type="text" required /></label>
              <label className={labelClass}>Last name<input className={inputClass} id="lastName" name="lastName" type="text" required /></label>
              <label className={labelClass}>Date of birth<input className={inputClass} id="dateOfBirth" name="dateOfBirth" type="date" /></label>
              <label className={labelClass}>Gender<select className={inputClass} id="gender" name="gender"><option value="">Select gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(8,43,97,0.06)] sm:p-8">
            <div className="mb-6"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">02 · Contact</p><h2 className="mt-1 text-2xl font-black tracking-tight text-[#082b61]">Contact information</h2><p className="mt-1 text-sm text-slate-500">Information that helps your team reach the patient.</p></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className={labelClass}>Phone<input className={inputClass} id="phone" name="phone" type="tel" /></label>
              <label className={`${labelClass} sm:col-span-2`}>Address<textarea className={inputClass} id="address" name="address" rows={4} /></label>
            </div>
          </section>

          {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</div>}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => router.push("/patients")} className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition hover:border-slate-300">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-xl bg-[#0b63ce] px-7 py-3 text-sm font-black text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-[#0958b5] disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Registering…" : "Register Patient →"}</button>
          </div>
        </form>
      </div>
    </main>
  );
}
