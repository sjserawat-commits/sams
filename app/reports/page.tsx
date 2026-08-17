export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl bg-white border p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wider text-blue-600">
            Hospital Intelligence
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Reports & Analytics
          </h1>

          <p className="mt-3 max-w-3xl text-slate-600">
            Central workspace for clinical, operational, patient and
            financial reporting.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ReportCard
            title="Clinical Reports"
            description="Clinical activity, encounters and outcomes."
          />

          <ReportCard
            title="Patient Reports"
            description="Patient registrations, visits and demographics."
          />

          <ReportCard
            title="PM&R Reports"
            description="Rehabilitation activity and functional outcomes."
          />

          <ReportCard
            title="Financial Reports"
            description="Billing, payments and outstanding balances."
          />

          <ReportCard
            title="Operational Reports"
            description="Hospital activity and service utilization."
          />

          <ReportCard
            title="Analytics Dashboard"
            description="Future centralized SAMS analytics dashboard."
          />
        </div>
      </div>
    </main>
  );
}

function ReportCard({
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
