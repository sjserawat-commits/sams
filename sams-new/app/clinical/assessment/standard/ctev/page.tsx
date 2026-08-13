"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Score = 0 | 0.5 | 1;

const piraniItems = [
  ["Midfoot", "Curved lateral border"],
  ["Midfoot", "Medial crease"],
  ["Midfoot", "Lateral head of talus"],
  ["Hindfoot", "Posterior crease"],
  ["Hindfoot", "Empty heel"],
  ["Hindfoot", "Equinus"],
] as const;

const deformities = ["Cavus", "Adductus", "Varus", "Equinus"];

const romFields = [
  "Dorsiflexion",
  "Plantarflexion",
  "Inversion",
  "Eversion",
];

const treatmentFields = [
  "Serial casting",
  "Achilles tenotomy",
  "Foot-abduction brace",
  "Brace compliance",
];

export default function CTEVAssessmentPage() {
  const [side, setSide] = useState<"Right" | "Left">("Right");
  const [footData, setFootData] = useState({
    Right: {} as Record<string, Score>,
    Left: {} as Record<string, Score>,
  });
  const [active, setActive] = useState("Pirani Score");

  const scores = footData[side];

  const total = useMemo(
    () => Object.values(scores).reduce<number>((sum, value) => sum + value, 0),
    [scores]
  );

  const completed = Object.keys(scores).length;

  const severity =
    total <= 1.5 ? "Low" : total <= 3 ? "Moderate" : "Higher";

  function changeSide(value: "Right" | "Left") {
    setSide(value);
  }

  function setPiraniScore(name: string, value: Score) {
    setFootData((current) => ({
      ...current,
      [side]: {
        ...current[side],
        [name]: value,
      },
    }));
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5 sm:p-7">
      <div className="mx-auto max-w-7xl">

        <section className="rounded-3xl bg-[#082b61] p-7 text-white shadow-lg sm:p-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-100">
                CTEV / Clubfoot
              </span>

              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                CTEV Assessment
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
                Complete structured assessment for clubfoot, treatment,
                bracing and longitudinal follow-up.
              </p>
            </div>

            <Link
              href="/clinical/assessment/standard"
              className="w-fit rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/20"
            >
              ← Standard Assessments
            </Link>
          </div>
        </section>

        <div className="mt-7 grid gap-6 lg:grid-cols-[250px_1fr_280px]">

          <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              CTEV Workflow
            </p>

            {[
              "Pirani Score",
              "Deformity",
              "ROM",
              "Ponseti Treatment",
              "Bracing",
              "Recurrence",
              "Follow-up",
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setActive(item)}
                className={`mt-1 w-full rounded-xl px-3 py-3 text-left text-sm font-semibold ${
                  active === item
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item}
              </button>
            ))}
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:px-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  {side} Foot
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {active}
                </h2>
              </div>

              <div className="flex rounded-xl bg-slate-100 p-1">
                {(["Right", "Left"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => changeSide(value)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                      side === value
                        ? "bg-white text-[#082b61] shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 sm:p-8">

              {active === "Pirani Score" && (
                <div className="space-y-5">
                  {["Midfoot", "Hindfoot"].map((group) => (
                    <div key={group}>
                      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
                        {group}
                      </h3>

                      <div className="space-y-3">
                        {piraniItems
                          .filter(([itemGroup]) => itemGroup === group)
                          .map(([, name]) => (
                            <div
                              key={name}
                              className="rounded-xl border border-slate-200 p-4"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="font-semibold text-slate-800">
                                  {name}
                                </p>

                                <div className="flex gap-2">
                                  {([0, 0.5, 1] as Score[]).map((value) => (
                                    <button
                                      key={value}
                                      type="button"
                                      onClick={() =>
                                        setPiraniScore(name, value)
                                      }
                                      className={`rounded-lg px-3 py-2 text-xs font-bold ${
                                        scores[name] === value
                                          ? "bg-blue-600 text-white"
                                          : "border border-slate-200 text-slate-600"
                                      }`}
                                    >
                                      {value}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {active === "Deformity" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {deformities.map((item) => (
                    <Field
                      key={item}
                      label={item}
                      placeholder={`Document ${item.toLowerCase()} findings...`}
                    />
                  ))}
                </div>
              )}

              {active === "ROM" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {romFields.map((item) => (
                    <Field
                      key={item}
                      label={`${item} (degrees)`}
                      placeholder="Enter measured ROM..."
                    />
                  ))}
                </div>
              )}

              {active === "Ponseti Treatment" && (
                <div className="space-y-4">
                  <Field label="Casting History" placeholder="Number of casts, dates and response..." />
                  <Field label="Tenotomy" placeholder="Status, date and relevant details..." />
                  <Field label="Treatment Response" placeholder="Clinical response to Ponseti treatment..." />
                </div>
              )}

              {active === "Bracing" && (
                <div className="space-y-4">
                  {treatmentFields.slice(2).map((item) => (
                    <Field
                      key={item}
                      label={item}
                      placeholder={`Document ${item.toLowerCase()}...`}
                    />
                  ))}

                  <Field
                    label="Brace Protocol"
                    placeholder="Hours/day, duration and prescribed protocol..."
                  />
                </div>
              )}

              {active === "Recurrence" && (
                <div className="space-y-4">
                  <Field label="Recurrence / Relapse" placeholder="No recurrence / recurrent deformity..." />
                  <Field label="Components of Recurrence" placeholder="Document recurrent cavus, adductus, varus or equinus..." />
                  <Field label="Management of Recurrence" placeholder="Management plan..." />
                </div>
              )}

              {active === "Follow-up" && (
                <div className="space-y-4">
                  <Field label="Clinical Progress" placeholder="Describe interval change..." />
                  <Field label="Current Plan" placeholder="Next treatment or follow-up plan..." />
                  <Field label="Next Review" placeholder="Enter planned review interval/date..." />
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600"
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  className="rounded-xl bg-[#082b61] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Save CTEV Assessment
                </button>
              </div>

            </div>
          </section>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              {side} Foot
            </p>

            <p className="mt-3 text-sm text-slate-500">
              Pirani Score
            </p>

            <div className="mt-1 flex items-end gap-2">
              <span className="text-5xl font-black text-[#082b61]">
                {total}
              </span>
              <span className="pb-1 text-lg font-semibold text-slate-400">
                / 6
              </span>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${(total / 6) * 100}%` }}
              />
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Current score band
              </p>
              <p className="mt-1 text-lg font-bold text-slate-800">
                {severity}
              </p>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Pirani items</span>
                <span className="font-bold text-slate-800">
                  {completed}/6
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs leading-5 text-slate-600">
                Right and left feet are assessed independently. Follow-up
                scores can later be compared longitudinally.
              </p>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
      </span>

      <textarea
        rows={3}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}
