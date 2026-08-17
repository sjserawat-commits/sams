export default function PMRPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl bg-blue-700 p-8 text-white shadow-lg">
          <p className="text-sm font-medium uppercase tracking-wider text-blue-100">
            Specialty Module
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Physical Medicine & Rehabilitation
          </h1>

          <p className="mt-3 max-w-3xl text-blue-100">
            Central workspace for rehabilitation assessment, therapy,
            functional evaluation and PM&R clinical workflows.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <PMRCard
            title="PM&R Assessment"
            description="Functional and rehabilitation assessment."
          />

          <PMRCard
            title="Physiotherapy"
            description="Physiotherapy evaluation and treatment planning."
          />

          <PMRCard
            title="Occupational Therapy"
            description="Occupational therapy assessment and interventions."
          />

          <PMRCard
            title="Speech & Language"
            description="Speech, language and communication rehabilitation."
          />

          <PMRCard
            title="Prosthetics & Orthotics"
            description="Prosthetic and orthotic evaluation and management."
          />

          <PMRCard
            title="Rehabilitation Plan"
            description="Goals, interventions, progress and follow-up."
          />
        </div>
      </div>
    </main>
  );
}

function PMRCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}
