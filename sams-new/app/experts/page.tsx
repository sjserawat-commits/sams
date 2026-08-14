"use client";

import { useEffect, useState } from "react";

type Doctor = {
  id: number;
  name: string;
  qualification?: string | null;
  introduction?: string | null;
};

export default function ExpertsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/doctors")
      .then((r) => r.json())
      .then(setDoctors)
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
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <article
                key={doctor.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#082b61] text-xl font-bold text-white">
                  {doctor.name
                    .split(" ")
                    .map((x) => x[0])
                    .slice(0, 2)
                    .join("")}
                </div>

                <h2 className="mt-5 text-xl font-semibold text-[#082b61]">
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
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
