"use client";

import { useEffect, useState } from "react";

type Doctor = {
  id: number;
  name: string;
  qualification?: string | null;
  introduction?: string | null;
  photoUrl?: string | null;
};

type Expertise = {
  number: string;
  icon: string;
  title: string;
  hindi: string;
  detail: string;
};

const drSurajExpertise: Expertise[] = [
  { number: "01", icon: "🦵", title: "Musculoskeletal & Joint", hindi: "मस्क्युलोस्केलेटल एवं जोड़", detail: "Assessment and non-operative management of joint, muscle, tendon and soft-tissue pain, with rehabilitation and function restoration." },
  { number: "02", icon: "🦴", title: "Spine Related", hindi: "रीढ़ से संबंधित", detail: "Evaluation and rehabilitation for neck and back pain, radicular symptoms, posture-related disorders and spine-related functional limitations." },
  { number: "03", icon: "🧠", title: "Brain Related", hindi: "मस्तिष्क से संबंधित", detail: "Rehabilitation-focused care for conditions affecting movement, cognition, communication and independence after neurological illness or injury." },
  { number: "04", icon: "⚡", title: "Peripheral Nerve Related", hindi: "पेरिफेरल नर्व से संबंधित", detail: "Clinical assessment and rehabilitation of peripheral nerve disorders, weakness, sensory symptoms and related functional problems." },
  { number: "05", icon: "👶", title: "Paediatric Rehabilitation", hindi: "बाल पुनर्वास", detail: "Functional assessment and rehabilitation planning for children with developmental, neuromuscular, orthopaedic and movement-related problems." },
  { number: "06", icon: "🧠", title: "Neuro Rehabilitation", hindi: "न्यूरो पुनर्वास", detail: "Goal-oriented rehabilitation to improve mobility, balance, strength, activities of daily living and participation after neurological conditions." },
  { number: "07", icon: "♿", title: "Spinal Cord Rehabilitation", hindi: "स्पाइनल कॉर्ड पुनर्वास", detail: "Specialised rehabilitation addressing mobility, transfers, bladder and bowel function, pressure injury prevention and independence after spinal cord injury." },
  { number: "08", icon: "🎯", title: "Other Specialized Rehabilitation", hindi: "अन्य विशेष पुनर्वास", detail: "Individualised physical medicine and rehabilitation for complex functional problems, disability prevention and restoration of independence." },
];

export default function ExpertsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeExpertise, setActiveExpertise] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/doctors")
      .then((r) => r.json())
      .then((data) => setDoctors(Array.isArray(data) ? data : []))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  const suraj = doctors.find((doctor) => doctor.name.toLowerCase().includes("suraj serawat"));
  const otherDoctors = doctors.filter((doctor) => !doctor.name.toLowerCase().includes("suraj serawat"));

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-900">
      {/* Professional, compact page header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#b4872c]">SAMS · Serawat Advanced Multispecialty Joint & Spine Centre</p>
            <h1 className="mt-1 font-serif text-2xl font-semibold text-[#082b61] sm:text-3xl">Meet Our Experts</h1>
          </div>
          <div className="hidden rounded-full border border-[#d6a443]/50 bg-[#fcf8ee] px-4 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#082b61] sm:block">
            Clinical Excellence · Personalised Care
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">Loading expert profiles...</div>
        ) : (
          <>
            {suraj && (
              <section>
                {/* Doctor profile: conventional professional medical website layout */}
                <article className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(7,31,70,0.08)]">
                  <div className="grid items-center lg:grid-cols-[250px_1fr]">
                    <div className="flex justify-center bg-[#f4f7fb] px-6 py-8 lg:min-h-[245px] lg:items-center lg:border-r lg:border-slate-200">
                      <div className="relative">
                        <div className="h-40 w-40 overflow-hidden rounded-full border-[5px] border-white bg-[#082b61] shadow-[0_8px_25px_rgba(7,31,70,0.18)] ring-1 ring-slate-200 sm:h-44 sm:w-44">
                          {suraj.photoUrl ? (
                            <img src={suraj.photoUrl} alt="Dr. Suraj Serawat" className="h-full w-full object-cover object-top" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-4xl font-serif text-white">SS</div>
                          )}
                        </div>
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#082b61] px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-white shadow-md">
                          Director
                        </span>
                      </div>
                    </div>

                    <div className="px-7 py-8 sm:px-10 sm:py-9">
                      <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#0b63ce]">Director · Physical Medicine & Rehabilitation</p>
                      <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-[#082b61] sm:text-4xl">Dr. Suraj Serawat</h2>
                      <p className="mt-2 text-sm font-semibold text-slate-600">MD (Physical Medicine & Rehabilitation)</p>
                      <div className="mt-4 h-px w-16 bg-[#d6a443]" />
                      <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600">
                        {suraj.introduction || "A rehabilitation-focused physician dedicated to comprehensive assessment, pain management, functional restoration and personalised care across musculoskeletal, joint, spine and neurological conditions."}
                      </p>
                      <div className="mt-6 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#f1f5fa] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#082b61]">Pain Medicine</span>
                        <span className="rounded-full bg-[#f1f5fa] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#082b61]">Musculoskeletal & Joint</span>
                        <span className="rounded-full bg-[#f1f5fa] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#082b61]">Spine & Rehabilitation</span>
                      </div>
                    </div>
                  </div>
                </article>

                {/* Expertise */}
                <section className="mt-8">
                  <div className="mb-5">
                    <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#0b63ce]">Areas of Expertise</p>
                    <h3 className="mt-1 font-serif text-2xl font-semibold text-[#082b61] sm:text-3xl">Clinical & Rehabilitation Expertise</h3>
                    <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">Select an area to view a brief description of Dr. Suraj's clinical focus.</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {drSurajExpertise.map((item) => {
                      const active = activeExpertise === item.number;
                      return (
                        <button
                          key={item.number}
                          type="button"
                          onClick={() => setActiveExpertise(active ? null : item.number)}
                          aria-expanded={active}
                          className={`rounded-2xl border p-5 text-left transition duration-200 ${active ? "border-[#0b63ce] bg-white shadow-lg" : "border-slate-200 bg-white hover:-translate-y-1 hover:border-[#b8c7da] hover:shadow-md"}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-serif text-xl text-[#0b63ce]">{item.number}</span>
                            <span className="text-lg" aria-hidden="true">{item.icon}</span>
                          </div>
                          <h4 className="mt-4 font-serif text-[17px] font-medium leading-tight text-[#082b61]">{item.title}</h4>
                          <p className="mt-1.5 text-xs text-slate-500">{item.hindi}</p>
                          <span className="mt-4 inline-flex text-[9px] font-black uppercase tracking-[0.16em] text-[#0b63ce]">{active ? "Hide detail" : "View detail"}</span>
                          {active && <p className="mt-3 border-t border-slate-200 pt-3 text-xs leading-5 text-slate-600">{item.detail}</p>}
                        </button>
                      );
                    })}
                  </div>
                </section>
              </section>
            )}

            {otherDoctors.length > 0 && (
              <section className="mt-12 border-t border-slate-200 pt-10">
                <div className="mb-5">
                  <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#0b63ce]">Specialist Team</p>
                  <h2 className="mt-1 font-serif text-2xl font-semibold text-[#082b61] sm:text-3xl">Our Specialist Team</h2>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  {otherDoctors.map((doctor) => (
                    <article key={doctor.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex items-center gap-5">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[#082b61] text-xl font-bold text-white">
                          {doctor.photoUrl ? <img src={doctor.photoUrl} alt={`${doctor.name} profile`} className="h-full w-full object-cover object-top" /> : <div className="flex h-full w-full items-center justify-center">{doctor.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}</div>}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-[#082b61]">{doctor.name}</h3>
                          {doctor.qualification && <p className="mt-1 text-sm text-slate-500">{doctor.qualification}</p>}
                        </div>
                      </div>
                      {doctor.introduction && <p className="mt-5 whitespace-pre-line text-sm leading-6 text-slate-600">{doctor.introduction}</p>}
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
