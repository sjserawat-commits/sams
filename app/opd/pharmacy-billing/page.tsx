"use client";

import { useState } from "react";

export default function PharmacyBillingPage() {
  const [visitId, setVisitId] = useState("");

  return (
    <main className="min-h-screen bg-[#f5f8fc] p-6">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-2xl bg-gradient-to-br from-[#0b63ce] to-[#082b61] p-7 text-white">
          <p className="text-xs font-black uppercase tracking-widest text-blue-200">
            SAMS · PHARMACY
          </p>
          <h1 className="mt-2 text-3xl font-black">
            Pharmacy Billing
          </h1>
          <p className="mt-2 text-sm text-blue-100">
            Pharmacy billing remains separate from investigation billing.
          </p>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <label className="text-sm font-bold text-slate-600">
            OPD Visit ID
          </label>

          <input
            value={visitId}
            onChange={(e) => setVisitId(e.target.value)}
            placeholder="Enter OPD Visit ID"
            className="mt-2 w-full rounded-xl border p-3"
          />

          <p className="mt-4 text-sm text-slate-500">
            Prescriptions will be billed separately from investigations.
          </p>
        </section>
      </div>
    </main>
  );
}
