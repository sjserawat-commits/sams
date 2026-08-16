"use client";

import { useEffect, useState } from "react";

type Doctor = {
  id: number;
  name: string;
  qualification?: string | null;
  introduction?: string | null;
  photoUrl?: string | null;
};

const drSurajExpertise = [
  ["01", "🦵", "Musculoskeletal & Joint", "मस्क्युलोस्केलेटल एवं जोड़"],
  ["02", "🦴", "Spine Related", "रीढ़ से संबंधित"],
  ["03", "🧠", "Brain Related", "मस्तिष्क से संबंधित"],
  ["04", "⚡", "Peripheral Nerve Related", "पेरिफेरल नर्व से संबंधित"],
  ["05", "👶", "Paediatric Rehabilitation", "बाल पुनर्वास"],
  ["06", "🧠", "Neuro Rehabilitation", "न्यूरो पुनर्वास"],
  ["07", "♿", "Spinal Cord Rehabilitation", "स्पाइनल कॉर्ड पुनर्वास"],
  ["08", "🎯", "Other Specialized Rehabilitation", "अन्य विशेष पुनर्वास"],
];

export default function ExpertsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/doctors")
      .then((r) => r.json())
      .then((data) => setDoctors(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#082b61]">
          SAMS
        </p>

        <h1 className="mt-2 text-4xl font-serif font-semibold text-[#082b61]">
          Meet Our Experts Team
        </h1>

        <p className="mt-4 max-w-2xl text-slate-600">
          Meet the doctors and specialists who contribute to personalised
          musculoskeletal, pain medicine and rehabilitation care at SAMS.
        </p>

        {loading ? (
          <p className="mt-10 text-slate-500">Loading experts...</p>
        ) : doctors.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="text-xl font-semibold text-[#082b61]">
              Our expert team
            </h2>
            <p className="mt-2 text-slate-500">
              Doctor profiles will appear here once added from Settings.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-8">
            {doctors.map((doctor) => {
              const isDrSuraj = doctor.name.toLowerCase().includes("suraj serawat");

              return (
                <article
                  key={doctor.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
                >
                  <div className="flex flex-col gap-7 md:flex-row">
                    <div className="shrink-0">
                      <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[#082b61] text-2xl font-bold text-white ring-4 ring-white shadow-md">
                        {doctor.photoUrl ? (
                          <img
                            src={doctor.photoUrl}
                            alt={`${doctor.name} profile`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          doctor.name
                            .split(" ")
                            .map((x) => x[0])
                            .slice(0, 2)
                            .join("")
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="text-2xl font-semibold text-[#082b61]">
                        {doctor.name}
                      </h2>

                      {doctor.qualification && (
                        <p className="mt-1 text-sm font-medium text-slate-500">
                          {doctor.qualification}
                        </p>
                      )}

                      {doctor.introduction && (
                        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
                          {doctor.introduction}
                        </p>
                      )}

                      {isDrSuraj && (
                        <section className="mt-8 border-t border-slate-200 pt-7">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0b63ce]">
                              Areas of Expertise
                            </p>
                            <h3 className="mt-2 font-serif text-2xl font-medium text-[#082b61]">
                              Clinical & Rehabilitation Expertise
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              Specialised assessment, treatment and rehabilitation across the spectrum of physical medicine and rehabilitation.
                            </p>
                          </div>

                          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {drSurajExpertise.map(([number, icon, title, hindi]) => (
                              <div
                                key={number}
                                className="rounded-2xl border border-[#ded5c5] bg-[#fbf8f1] p-4 transition hover:border-[#0b63ce] hover:shadow-sm"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <span className="font-serif text-2xl text-[#0b63ce]/70">
                                    {number}
                                  </span>
                                  <span className="text-xl" aria-hidden="true">
                                    {icon}
                                  </span>
                                </div>
                                <h4 className="mt-4 font-serif text-lg font-medium leading-tight text-[#082b61]">
                                  {title}
                                </h4>
                                <p className="mt-2 text-xs text-slate-500">
                                  {hindi}
                                </p>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
