"use client";

import Link from "next/link";
import { useState } from "react";

const groups = [
  {
    title: "Spinal Cord Injury",
    items: ["ASIA / ISNCSCI"],
  },
  {
    title: "Cerebral Palsy",
    items: [
      "GMFCS",
      "GMFM-66 / GMFM-88",
      "MACS",
      "CFCS",
      "EDACS",
    ],
  },
  {
    title: "CTEV / Clubfoot",
    items: [
      "Pirani Score",
      "Dimeglio Classification",
      "CTEV Deformity & ROM",
    ],
  },
  {
    title: "Cognition",
    items: ["MMSE", "MoCA"],
  },
  {
    title: "Function & Mobility",
    items: [
      "Barthel Index",
      "FIM",
      "Berg Balance Scale",
      "Timed Up & Go",
      "6-Minute Walk Test",
    ],
  },
  {
    title: "Tone, Strength & Motor",
    items: [
      "Modified Ashworth Scale",
      "Tardieu",
      "MRC Muscle Strength",
      "ROM Assessment",
    ],
  },
  {
    title: "Skin & Pressure Injury",
    items: [
      "Pressure Injury Assessment",
      "Braden Scale",
    ],
  },
  {
    title: "Pain",
    items: ["NRS", "VAS"],
  },
];

export default function StandardAssessmentsPage() {
  const [selected, setSelected] = useState("ASIA / ISNCSCI");

  return (
    <main className="min-h-screen bg-slate-50 p-5 sm:p-7">
      <div className="mx-auto max-w-7xl">

        <section className="rounded-3xl bg-[#082b61] p-7 text-white shadow-lg sm:p-9">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-100">
                Clinical Assessment Engine
              </span>

              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Standard Assessments
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                Standardized instruments for neurological, functional,
                rehabilitation and condition-specific assessment.
              </p>
            </div>

            <Link
              href="/clinical/assessment"
              className="w-fit rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/20"
            >
              ← Assessment
            </Link>
          </div>
        </section>

        <div className="mt-7 grid gap-6 lg:grid-cols-[300px_1fr]">

          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="px-2 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Assessment Categories
            </p>

            <div className="mt-2 space-y-2">
              {groups.map((group) => (
                <div
                  key={group.title}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <p className="text-sm font-bold text-slate-800">
                    {group.title}
                  </p>

                  <div className="mt-2 space-y-1">
                    {group.items.map((item) => (
                      <button
                        key={item}
                        onClick={() => setSelected(item)}
                        className={`w-full rounded-lg px-2.5 py-2 text-left text-xs font-medium transition ${
                          selected === item
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:bg-white"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Selected Instrument
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {selected}
              </h2>
            </div>

            <div className="p-6 sm:p-8">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                <h3 className="text-lg font-bold text-[#082b61]">
                  Ready for structured assessment
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  This workspace will contain the standardized assessment
                  fields, scoring logic, interpretation and longitudinal
                  comparison for the selected instrument.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Step 1
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      Complete
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Step 2
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      Score
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Step 3
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      Track Progress
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-6 rounded-xl bg-[#082b61] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0b397e]"
                >
                  Start {selected}
                </button>
              </div>

              <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-6">
                <p className="text-sm font-semibold text-slate-700">
                  Longitudinal comparison
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Previous and current scores will be shown together once
                  patient-specific assessment storage is connected.
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
