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
  {
    number: "01",
    icon: "🦵",
    title: "Musculoskeletal & Joint",
    hindi: "मस्क्युलोस्केलेटल एवं जोड़",
    detail: "Assessment and non-operative management of joint, muscle, tendon and soft-tissue pain, including focused rehabilitation and function restoration.",
  },
  {
    number: "02",
    icon: "🦴",
    title: "Spine Related",
    hindi: "रीढ़ से संबंधित",
    detail: "Comprehensive evaluation and rehabilitation for neck and back pain, radicular symptoms, posture-related disorders and spine-related functional limitations.",
  },
  {
    number: "03",
    icon: "🧠",
    title: "Brain Related",
    hindi: "मस्तिष्क से संबंधित",
    detail: "Rehabilitation-focused care for conditions affecting movement, cognition, communication and independence after neurological illness or injury.",
  },
  {
    number: "04",
    icon: "⚡",
    title: "Peripheral Nerve Related",
    hindi: "पेरिफेरल नर्व से संबंधित",
    detail: "Clinical assessment and rehabilitation of peripheral nerve disorders, weakness, sensory symptoms and related functional problems.",
  },
  {
    number: "05",
    icon: "👶",
    title: "Paediatric Rehabilitation",
    hindi: "बाल पुनर्वास",
    detail: "Functional assessment and rehabilitation planning for children with developmental, neuromuscular, orthopaedic and movement-related problems.",
  },
  {
    number: "06",
    icon: "🧠",
    title: "Neuro Rehabilitation",
    hindi: "न्यूरो पुनर्वास",
    detail: "Goal-oriented rehabilitation to improve mobility, balance, strength, activities of daily living and participation after neurological conditions.",
  },
  {
    number: "07",
    icon: "♿",
    title: "Spinal Cord Rehabilitation",
    hindi: "स्पाइनल कॉर्ड पुनर्वास",
    detail: "Specialised rehabilitation addressing mobility, transfers, bladder and bowel function, pressure injury prevention and independence after spinal cord injury.",
  },
  {
    number: "08",
    icon: "🎯",
    title: "Other Specialized Rehabilitation",
    hindi: "अन्य विशेष पुनर्वास",
    detail: "Individualised physical medicine and rehabilitation for complex functional problems, disability prevention and restoration of independence.",
  },
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

  const suraj = doctors.find((doctor) =>
    doctor.name.toLowerCase().includes("suraj serawat")
  );
  const otherDoctors = doctors.filter(
    (doctor) => !doctor.name.toLowerCase().includes("suraj serawat")
  );

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-900">
      <section className="relative overflow-hidden bg-[#071f46] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(214,164,67,0.22),transparent_34%),radial-gradient(circle_at_10%_90%,rgba(11,99,206,0.24),transparent_38%)]" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <div className="max-w-4xl">
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#d6a443]">
              SAMS · Serawat Advanced Multispecialty Joint & Spine Centre
            </p>
            <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Meet Our Experts
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/75 sm:text-lg">
              A focused team bringing together clinical expertise, precision assessment and rehabilitation-led care for pain, musculoskeletal, joint, spine and neurological conditions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wider">
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">Multispecialty Care</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">Joint & Spine</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">Physical Medicine & Rehabilitation</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            Loading expert profiles...
          </div>
        ) : (
          <>
            <section className="overflow-hidden rounded-[2rem] border border-[#e5dfd2] bg-white shadow-[0_20px_70px_rgba(7,31,70,0.10)]">
              <div className="grid lg:grid-cols-[360px_1fr]">
                <div className="relative flex min-h-[330px] items-center justify-center overflow-hidden bg-[#082b61] p-8">
                  <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border border-[#d6a443]/30" />
                  <div className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full border border-white/10" />
                  <div className="relative">
                    <div className="h-52 w-52 overflow-hidden rounded-full border-4 border-[#d6a443]/80 bg-white/10 shadow-2xl">
                      {suraj?.photoUrl ? (
                        <img src={suraj.photoUrl} alt="Dr. Suraj Serawat" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-5xl font-serif text-white">SS</div>
                      )}
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#d6a443] px-5 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#071f46]">
                      Director · PM&R
                    </div>
                  </div>
                </div>

                <div className="p-7 sm:p-10 lg:p-12">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#0b63ce]">Director Profile</p>
                  <h2 className="mt-3 font-serif text-4xl font-semibold text-[#082b61]">Dr. Suraj Serawat</h2>
                  <p className="mt-2 text-sm font-semibold text-slate-500">MD (Physical Medicine & Rehabilitation)</p>
                  <p className="mt-6 max-w-3xl text-sm leading-7 text-slate-600">
                    A rehabilitation-focused physician dedicated to comprehensive assessment, pain management, functional restoration and personalised care across musculoskeletal, joint, spine and neurological conditions.
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-[#f7f8fb] p-4"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Focus</p><p className="mt-2 text-sm font-semibold text-[#082b61]">Pain & Function</p></div>
                    <div className="rounded-2xl bg-[#f7f8fb] p-4"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Specialty</p><p className="mt-2 text-sm font-semibold text-[#082b61]">PM&R</p></div>
                    <div className="rounded-2xl bg-[#f7f8fb] p-4"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Approach</p><p className="mt-2 text-sm font-semibold text-[#082b61]">Restore Function</p></div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 bg-[#fcfbf7] p-7 sm:p-10">
                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#0b63ce]">Areas of Expertise</p>
                <h3 className="mt-2 font-serif text-3xl font-medium text-[#082b61]">Clinical & Rehabilitation Expertise</h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Tap any area to see a concise overview of the care focus.</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {drSurajExpertise.map((item) => {
                    const active = activeExpertise === item.number;
                    return (
                      <button
                        key={item.number}
                        type="button"
                        onClick={() => setActiveExpertise(active ? null : item.number)}
                        aria-expanded={active}
                        className={`text-left rounded-2xl border p-5 transition duration-200 ${active ? "border-[#0b63ce] bg-white shadow-lg -translate-y-1" : "border-[#ded5c5] bg-[#fbf8f1] hover:-translate-y-1 hover:border-[#0b63ce] hover:bg-white hover:shadow-md"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-serif text-2xl text-[#0b63ce]/70">{item.number}</span>
                          <span className="text-xl" aria-hidden="true">{item.icon}</span>
                        </div>
                        <h4 className="mt-4 font-serif text-lg font-medium leading-tight text-[#082b61]">{item.title}</h4>
                        <p className="mt-2 text-xs text-slate-500">{item.hindi}</p>
                        <span className="mt-4 block text-[10px] font-black uppercase tracking-widest text-[#0b63ce]">{active ? "Hide detail" : "View detail"}</span>
                        {active && <p className="mt-4 border-t border-slate-200 pt-4 text-xs leading-6 text-slate-600">{item.detail}</p>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {otherDoctors.length > 0 && (
              <section className="mt-12">
                <div className="mb-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#0b63ce]">Specialist Team</p>
                  <h2 className="mt-2 font-serif text-3xl text-[#082b61]">Our Specialist Team</h2>
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
