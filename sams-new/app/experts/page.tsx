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
      {/* Compact page header */}
      <section className="border-b border-[#dce3ec] bg-[#082b61] text-white">
        <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-11 lg:px-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d6a443]">SAMS · Serawat Advanced Multispecialty Joint & Spine Centre</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight sm:text-4xl">Meet Our Experts</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
            Specialist expertise for pain, musculoskeletal, joint, spine and rehabilitation care.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">Loading expert profiles...</div>
        ) : (
          <>
            {/* Director profile first: name + qualifications + photo */}
            {suraj && (
              <section className="overflow-hidden rounded-[1.75rem] border border-[#e5dfd2] bg-white shadow-[0_14px_45px_rgba(7,31,70,0.08)]">
                <div className="flex flex-col items-center gap-6 p-7 text-center sm:flex-row sm:text-left sm:p-9">
                  <div className="relative shrink-0">
                    <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-[#d6a443] bg-[#082b61] shadow-lg sm:h-36 sm:w-36">
                      {suraj.photoUrl ? (
                        <img src={suraj.photoUrl} alt="Dr. Suraj Serawat" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-3xl font-serif text-white">SS</div>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#0b63ce]">Director</p>
                    <h2 className="mt-1 font-serif text-3xl font-semibold text-[#082b61] sm:text-4xl">Dr. Suraj Serawat</h2>
                    <p className="mt-2 text-sm font-semibold text-slate-500">MD (Physical Medicine & Rehabilitation)</p>
                    {suraj.introduction && (
                      <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">{suraj.introduction}</p>
                    )}
                  </div>
                </div>

                {/* Expertise comes directly after profile */}
                <div className="border-t border-slate-200 bg-[#fcfbf7] p-7 sm:p-9">
                  <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#0b63ce]">Areas of Expertise</p>
                  <h3 className="mt-2 font-serif text-2xl font-medium text-[#082b61] sm:text-3xl">Clinical & Rehabilitation Expertise</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Tap any area to see a concise overview.</p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {drSurajExpertise.map((item) => {
                      const active = activeExpertise === item.number;
                      return (
                        <button
                          key={item.number}
                          type="button"
                          onClick={() => setActiveExpertise(active ? null : item.number)}
                          aria-expanded={active}
                          className={`rounded-2xl border p-4 text-left transition duration-200 ${active ? "-translate-y-1 border-[#0b63ce] bg-white shadow-lg" : "border-[#ded5c5] bg-[#fbf8f1] hover:-translate-y-1 hover:border-[#0b63ce] hover:bg-white hover:shadow-md"}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="font-serif text-2xl text-[#0b63ce]/70">{item.number}</span>
                            <span className="text-xl" aria-hidden="true">{item.icon}</span>
                          </div>
                          <h4 className="mt-3 font-serif text-lg font-medium leading-tight text-[#082b61]">{item.title}</h4>
                          <p className="mt-1.5 text-xs text-slate-500">{item.hindi}</p>
                          <span className="mt-3 block text-[10px] font-black uppercase tracking-widest text-[#0b63ce]">{active ? "Hide detail" : "View detail"}</span>
                          {active && <p className="mt-3 border-t border-slate-200 pt-3 text-xs leading-5 text-slate-600">{item.detail}</p>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {otherDoctors.length > 0 && (
              <section className="mt-10">
                <div className="mb-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#0b63ce]">Specialist Team</p>
                  <h2 className="mt-1 font-serif text-3xl text-[#082b61]">Our Specialist Team</h2>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  {otherDoctors.map((doctor) => (
                    <article key={doctor.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex items-center gap-5">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[#082b61] text-xl font-bold text-white">
                          {doctor.photoUrl ? <img src={doctor.photoUrl} alt={`${doctor.name} profile`} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center">{doctor.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}</div>}
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
