"use client";

import { useState } from "react";

export default function DoctorReportsPage() {
  const [visitId, setVisitId] = useState("");
  const [reports, setReports] = useState<any[]>([]);

  async function loadReports() {
    if (!visitId) return;

    const res = await fetch(
      `/api/opd/reports?opdVisitId=${encodeURIComponent(visitId)}`
    );

    const data = await res.json();
    setReports(Array.isArray(data) ? data : []);
  }

  return (
    <main className="min-h-screen bg-[#f5f8fc] p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-black text-[#082b61]">
          Investigation Reports
        </h1>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <input
            value={visitId}
            onChange={(e) => setVisitId(e.target.value)}
            placeholder="OPD Visit ID"
            className="rounded-xl border p-3"
          />

          <button
            onClick={loadReports}
            className="ml-3 rounded-xl bg-[#0b63ce] px-5 py-3 font-black text-white"
          >
            View Reports
          </button>

          <div className="mt-6 space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="rounded-xl border p-4">
                <div className="font-black text-[#082b61]">
                  {report.investigation}
                </div>
                <div className="mt-2 whitespace-pre-wrap text-sm">
                  {report.reportText}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
