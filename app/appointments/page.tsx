"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

const doctors = [
  {
    name: "Dr. Suraj Serawat",
    qualification: "MD PM&R",
    specialty: "Pain Medicine • Electrodiagnosis • Musculoskeletal & Joint • Spine • Rehabilitation",
    department: "Physical Medicine & Rehabilitation",
  },
];

function makeTimeSlots(startHour: number, endHour: number) {
  const slots: string[] = [];
  for (let minutes = startHour * 60; minutes <= endHour * 60; minutes += 5) {
    const hour24 = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const suffix = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;
    slots.push(`${hour12}:${String(minute).padStart(2, "0")} ${suffix}`);
  }
  return slots;
}

const times = makeTimeSlots(10, 12);

export default function AppointmentsPage() {
  const [patientType, setPatientType] = useState<"new" | "existing">("new");
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  const selectedDoctor = useMemo(() => doctors.find((item) => item.name === doctor), [doctor]);

  function confirmAppointment() {
    if (!doctor || !date || !time || !name.trim() || !mobile.trim() || !dob.trim()) {
      setError("Please select your doctor, date, time and complete all required patient details.");
      return;
    }
    setError("");
    setConfirmed(true);
  }

  if (confirmed) {
    return (
      <main className="min-h-screen bg-[#e8d6b3] text-[#10233f]">
        <header className="border-b border-[#ded5c5] bg-[#fbf8f1]/95 shadow-sm backdrop-blur-xl">
          <div className="mx-auto flex min-h-[92px] max-w-[1200px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <Link href="/home-v2" className="flex items-center gap-3">
              <Image src="/serawat-logo.png" alt="SAMS" width={82} height={52} className="h-12 w-auto object-contain" priority />
              <div><p className="font-serif text-2xl font-bold leading-none text-[#082b61]">SAMS</p><p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#082b61]">Serawat Advanced Multispecialty Joint &amp; Spine Center</p></div>
            </Link>
          </div>
        </header>
        <section className="px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-[#d6b46a]/70 bg-[#fbf8f1] p-8 text-center shadow-[0_24px_70px_rgba(70,48,16,0.14)] sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#071f46] text-3xl text-[#e8d6a8]">✓</div>
            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.28em] text-[#9a7434]">SAMS Appointment</p>
            <h1 className="mt-3 font-serif text-4xl font-medium text-[#082b61]">Appointment Confirmed</h1>
            <p className="mt-3 text-sm leading-6 text-[#52627a]">Your appointment request has been recorded with the details below.</p>
            <div className="mt-8 rounded-2xl border border-[#ded5c5] bg-white p-5 text-left text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><p className="text-[10px] font-black uppercase tracking-wider text-[#9a7434]">Patient</p><p className="mt-1 font-semibold text-[#082b61]">{name}</p></div>
                <div><p className="text-[10px] font-black uppercase tracking-wider text-[#9a7434]">Doctor</p><p className="mt-1 font-semibold text-[#082b61]">{doctor}</p></div>
                <div><p className="text-[10px] font-black uppercase tracking-wider text-[#9a7434]">Date</p><p className="mt-1 font-semibold text-[#082b61]">{date}</p></div>
                <div><p className="text-[10px] font-black uppercase tracking-wider text-[#9a7434]">Time</p><p className="mt-1 font-semibold text-[#082b61]">{time}</p></div>
              </div>
            </div>
            <Link href="/home-v2" className="mt-7 inline-flex rounded-2xl border border-[#d6b46a] bg-[#071f46] px-7 py-3.5 text-sm font-bold text-[#f5e6bf] shadow-lg transition hover:-translate-y-0.5">← Back to Home</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#e8d6b3] text-[#10233f]">
      <header className="border-b border-[#ded5c5] bg-[#fbf8f1]/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex min-h-[92px] max-w-[1200px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/home-v2" className="flex items-center gap-3">
            <Image src="/serawat-logo.png" alt="SAMS" width={82} height={52} className="h-12 w-auto object-contain" priority />
            <div><p className="font-serif text-2xl font-bold leading-none text-[#082b61]">SAMS</p><p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#082b61]">Serawat Advanced Multispecialty Joint &amp; Spine Center</p></div>
          </Link>
          <Link href="/home-v2" className="rounded-xl border border-[#d6dce7] bg-white px-4 py-2 text-xs font-black text-[#082b61]">← Home</Link>
        </div>
      </header>

      <section className="px-5 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-[1050px]">
          <div className="mb-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#9a7434]">SAMS Patient Services</p>
            <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-[#082b61] sm:text-5xl">Book Your Appointment</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#52627a]">Choose your doctor, preferred date and time. Your appointment journey starts here.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.35fr_.65fr] lg:items-start">
            <div className="space-y-6">
              <section className="rounded-3xl border border-[#d6bd84]/70 bg-[#fbf8f1] p-6 shadow-[0_18px_45px_rgba(70,48,16,0.10)] sm:p-8">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#9a7434]">01 · Patient Type</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button onClick={() => setPatientType("new")} className={`rounded-2xl border p-5 text-left transition ${patientType === "new" ? "border-[#d6b46a] bg-[#f7ecd2] shadow-sm" : "border-[#e2ddd3] bg-white hover:border-[#d6b46a]"}`}><span className="text-2xl">👤</span><p className="mt-2 font-serif text-xl font-semibold text-[#082b61]">New Patient</p><p className="mt-1 text-xs text-[#667085]">First visit to SAMS</p></button>
                  <button onClick={() => setPatientType("existing")} className={`rounded-2xl border p-5 text-left transition ${patientType === "existing" ? "border-[#d6b46a] bg-[#f7ecd2] shadow-sm" : "border-[#e2ddd3] bg-white hover:border-[#d6b46a]"}`}><span className="text-2xl">↩️</span><p className="mt-2 font-serif text-xl font-semibold text-[#082b61]">Existing Patient</p><p className="mt-1 text-xs text-[#667085]">Already registered or visited</p></button>
                </div>
              </section>

              <section className="rounded-3xl border border-[#d6bd84]/70 bg-[#fbf8f1] p-6 shadow-[0_18px_45px_rgba(70,48,16,0.10)] sm:p-8">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#9a7434]">02 · Select Doctor</p>
                <div className="mt-4">
                  <label htmlFor="doctor" className="text-xs font-bold text-[#52627a]">Doctor</label>
                  <select id="doctor" value={doctor} onChange={(event) => setDoctor(event.target.value)} className="mt-2 w-full rounded-2xl border border-[#ded5c5] bg-white px-4 py-4 text-sm font-semibold text-[#082b61] outline-none transition focus:border-[#d6b46a] focus:ring-2 focus:ring-[#d6b46a]/20">
                    <option value="">Select doctor</option>
                    {doctors.map((item) => <option key={item.name} value={item.name}>{item.name} — {item.specialty} — {item.department}</option>)}
                  </select>
                  {selectedDoctor && <div className="mt-3 rounded-2xl border border-[#d6b46a]/60 bg-[#f7ecd2] p-4"><p className="font-serif text-lg font-semibold text-[#082b61]">{selectedDoctor.name}</p><p className="mt-1 text-xs font-bold text-[#9a7434]">{selectedDoctor.qualification} · {selectedDoctor.department}</p><p className="mt-2 text-xs leading-5 text-[#667085]">{selectedDoctor.specialty}</p></div>}
                </div>
              </section>

              <section className="rounded-3xl border border-[#d6bd84]/70 bg-[#fbf8f1] p-6 shadow-[0_18px_45px_rgba(70,48,16,0.10)] sm:p-8">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#9a7434]">03 · Date &amp; Time</p>
                <div className="mt-4">
                  <label htmlFor="date" className="text-xs font-bold text-[#52627a]">Preferred Date</label>
                  <input id="date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 w-full rounded-xl border border-[#ded5c5] bg-white px-4 py-3 text-sm outline-none focus:border-[#d6b46a]" />
                  <label className="mt-5 block text-xs font-bold text-[#52627a]">Available Time · 5-minute slots</label>
                  <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">{times.map((slot) => <button key={slot} type="button" onClick={() => setTime(slot)} className={`rounded-xl border px-2 py-2.5 text-xs font-bold transition ${time === slot ? "border-[#d6b46a] bg-[#082b61] text-[#f3dfad]" : "border-[#ded5c5] bg-white text-[#52627a] hover:border-[#d6b46a]"}`}>{slot}</button>)}</div>
                </div>
              </section>

              <section className="rounded-3xl border border-[#d6bd84]/70 bg-[#fbf8f1] p-6 shadow-[0_18px_45px_rgba(70,48,16,0.10)] sm:p-8">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#9a7434]">04 · Patient Details</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full Name *" className="rounded-xl border border-[#ded5c5] bg-white px-4 py-3 text-sm outline-none focus:border-[#d6b46a]" />
                  <input value={mobile} onChange={(event) => setMobile(event.target.value)} placeholder="Mobile Number *" inputMode="tel" className="rounded-xl border border-[#ded5c5] bg-white px-4 py-3 text-sm outline-none focus:border-[#d6b46a]" />
                  <input value={dob} onChange={(event) => setDob(event.target.value)} placeholder="Age / Date of Birth *" className="rounded-xl border border-[#ded5c5] bg-white px-4 py-3 text-sm outline-none focus:border-[#d6b46a]" />
                  <select value={gender} onChange={(event) => setGender(event.target.value)} className="rounded-xl border border-[#ded5c5] bg-white px-4 py-3 text-sm text-[#52627a] outline-none focus:border-[#d6b46a]"><option value="">Gender</option><option>Male</option><option>Female</option><option>Other</option></select>
                  <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email (optional)" type="email" className="rounded-xl border border-[#ded5c5] bg-white px-4 py-3 text-sm outline-none focus:border-[#d6b46a] sm:col-span-2" />
                  <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Brief reason for visit (optional)" rows={3} className="rounded-xl border border-[#ded5c5] bg-white px-4 py-3 text-sm outline-none focus:border-[#d6b46a] sm:col-span-2" />
                </div>
              </section>
            </div>

            <aside className="lg:sticky lg:top-6">
              <div className="rounded-3xl border border-[#d6b46a]/70 bg-[#071f46] p-6 text-white shadow-[0_24px_60px_rgba(7,31,70,0.25)] sm:p-7">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d6b46a]">05 · Booking Summary</p>
                <h2 className="mt-3 font-serif text-2xl font-medium text-[#f5e6bf]">Your Appointment</h2>
                <div className="mt-6 space-y-4 border-y border-white/10 py-5 text-sm"><div><p className="text-[10px] uppercase tracking-wider text-blue-200/70">Patient</p><p className="mt-1 font-semibold">{patientType === "new" ? "New Patient" : "Existing Patient"}</p></div><div><p className="text-[10px] uppercase tracking-wider text-blue-200/70">Doctor</p><p className="mt-1 font-semibold">{doctor || "Select your doctor"}</p></div><div><p className="text-[10px] uppercase tracking-wider text-blue-200/70">Date</p><p className="mt-1 font-semibold">{date || "Select a date"}</p></div><div><p className="text-[10px] uppercase tracking-wider text-blue-200/70">Time</p><p className="mt-1 font-semibold">{time || "Select a time slot"}</p></div></div>
                {error && <p className="mt-4 rounded-xl border border-red-300/30 bg-red-400/10 px-3 py-2 text-xs leading-5 text-red-100">{error}</p>}
                <p className="mt-5 text-xs leading-5 text-blue-100/70">Review your details before confirming your appointment.</p>
                <button type="button" onClick={confirmAppointment} className="mt-6 w-full rounded-2xl border border-[#f0d28a] bg-gradient-to-r from-[#c79b4b] via-[#e8d6a8] to-[#c79b4b] px-5 py-4 font-serif text-base font-bold text-[#08213f] shadow-[0_10px_30px_rgba(214,180,106,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(214,180,106,0.38)]">✦ Confirm Appointment</button>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
