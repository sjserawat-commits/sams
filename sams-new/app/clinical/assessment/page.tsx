"use client";

import Link from "next/link";
import { useState } from "react";

const sections = [
  "History",
  "Physical Examination",
  "Functional Assessment",
  "PM&R Assessment",
  "Clinical Impression",
  "Management & Rehabilitation",
];

export default function AssessmentPage() {
  const [activeSection, setActiveSection] = useState("History");

  return (
    <main className="min-h-screen bg-slate-50 p-5 sm:p-7">
      <div className="mx-auto max-w-7xl">

        <section className="overflow-hidden rounded-3xl bg-[#082b61] shadow-lg">
          <div className="px-6 py-8 text-white sm:px-9 sm:py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-100">
                  Clinical Workspace
                </span>

                <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                  Assessment & PM&R
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                  Structured assessment for clinical findings, function,
                  rehabilitation needs and management planning.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/clinical/assessment/standard"
                  className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#082b61] shadow-sm hover:bg-blue-50"
                >
                  Standard Assessments
                </Link>

                <Link
                  href="/clinical"
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/20"
                >
                  ← Clinical
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-7 grid gap-6 lg:grid-cols-[250px_1fr]">

          <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Assessment Workflow
            </p>

            <div className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`w-full rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                    activeSection === section
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Current Section
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {activeSection}
              </h2>
            </div>

            <div className="space-y-6 p-6 sm:p-8">

              {activeSection === "History" && (
                <>
                  <Field
                    label="Chief Complaint"
                    placeholder="Primary reason for consultation..."
                  />
                  <Field
                    label="History of Present Illness"
                    placeholder="Describe onset, duration, progression and relevant symptoms..."
                    large
                  />
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Past Medical History" placeholder="Relevant medical history..." />
                    <Field label="Past Surgical History" placeholder="Relevant surgical history..." />
                  </div>
                </>
              )}

              {activeSection === "Physical Examination" && (
                <>
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="General Examination" placeholder="General findings..." />
                    <Field label="Musculoskeletal Examination" placeholder="Musculoskeletal findings..." />
                    <Field label="Neurological Examination" placeholder="Neurological findings..." />
                    <Field label="Pain Assessment" placeholder="Location, severity, character..." />
                  </div>
                  <Field
                    label="Detailed Examination Findings"
                    placeholder="Document relevant examination findings..."
                    large
                  />
                </>
              )}

              {activeSection === "Functional Assessment" && (
                <>
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Mobility" placeholder="Bed mobility, transfers, gait..." />
                    <Field label="Activities of Daily Living" placeholder="ADL status..." />
                    <Field label="Upper Limb Function" placeholder="Functional status..." />
                    <Field label="Lower Limb Function" placeholder="Functional status..." />
                  </div>
                  <Field
                    label="Functional Limitations"
                    placeholder="Describe activity limitations and participation restrictions..."
                    large
                  />
                </>
              )}

              {activeSection === "PM&R Assessment" && (
                <>
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Impairments" placeholder="Identify relevant impairments..." />
                    <Field label="Activity Limitations" placeholder="Identify activity limitations..." />
                    <Field label="Participation Restrictions" placeholder="Identify participation restrictions..." />
                    <Field label="Rehabilitation Potential" placeholder="Good / Fair / Limited — with rationale..." />
                  </div>
                  <Field
                    label="PM&R Assessment Summary"
                    placeholder="Summarize the rehabilitation-focused assessment..."
                    large
                  />
                </>
              )}

              {activeSection === "Clinical Impression" && (
                <>
                  <Field
                    label="Primary Diagnosis / Impression"
                    placeholder="Primary clinical diagnosis or impression..."
                  />
                  <Field
                    label="Differential Diagnosis"
                    placeholder="Relevant differential diagnoses..."
                    large
                  />
                  <Field
                    label="Clinical Reasoning"
                    placeholder="Summarize the clinical reasoning supporting the assessment..."
                    large
                  />
                </>
              )}

              {activeSection === "Management & Rehabilitation" && (
                <>
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Treatment Plan" placeholder="Medical / procedural treatment plan..." />
                    <Field label="Rehabilitation Plan" placeholder="Therapy and rehabilitation plan..." />
                    <Field label="Assistive Devices" placeholder="Devices, aids or equipment..." />
                    <Field label="Prosthetics & Orthotics" placeholder="P&O requirements, if applicable..." />
                  </div>
                  <Field
                    label="Goals & Follow-up"
                    placeholder="Short-term goals, long-term goals and follow-up plan..."
                    large
                  />
                </>
              )}

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  className="rounded-xl bg-[#082b61] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0b397e]"
                >
                  Save Assessment
                </button>
              </div>

            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  placeholder,
  large = false,
}: {
  label: string;
  placeholder: string;
  large?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
      </span>

      <textarea
        rows={large ? 5 : 3}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}
