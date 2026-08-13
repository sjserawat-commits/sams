"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Visit = {
  id: number;
  tokenNumber: number;
  visitType: string;
  status: string;
  department?: string | null;
  patient: {
    id: number;
    patientId: string;
    firstName: string;
    lastName: string;
  };
};

export default function OPDQueuePage() {
  const router = useRouter();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/opd/queue")
      .then((res) => res.json())
      .then((data) => setVisits(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#f5f8fc] px-5 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] bg-gradient-to-br from-[#0b63ce] to-[#082b61] p-7 text-white shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">
            SAMS · OPD
          </p>
          <h1 className="mt-2 text-3xl font-black">OPD Queue</h1>
          <p className="mt-2 text-sm text-blue-100">
            Doctor can select any waiting patient.
          </p>
        </div>

        <section className="mt-6 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="font-black text-[#082b61]">Today's Patients</h2>
          </div>

          {loading ? (
            <div className="p-6 text-sm font-semibold text-slate-500">
              Loading queue…
            </div>
          ) : visits.length === 0 ? (
            <div className="p-8 text-center text-sm font-semibold text-slate-500">
              No patients are currently waiting.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {visits.map((visit) => (
                <div
                  key={visit.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-lg font-black text-[#0b63ce]">
                      {visit.tokenNumber}
                    </div>

                    <div>
                      <p className="font-black text-[#082b61]">
                        {visit.patient.firstName} {visit.patient.lastName}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {visit.patient.patientId} · {visit.visitType}
                        {visit.department ? ` · ${visit.department}` : ""}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      router.push(
                        `/patients/profile/${visit.patient.id}/encounters/new?opdVisitId=${visit.id}`
                      )
                    }
                    className="rounded-xl bg-[#0b63ce] px-5 py-3 text-sm font-black text-white"
                  >
                    Open Patient
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
