export default function PatientPortalPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl bg-blue-700 p-8 text-white shadow-lg">
          <p className="text-sm font-medium uppercase tracking-wider text-blue-100">
            Patient Services
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Patient Portal
          </h1>

          <p className="mt-3 max-w-3xl text-blue-100">
            A secure patient-facing workspace for appointments, medical
            information, rehabilitation progress and communication.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <PortalCard
            title="My Appointments"
            description="View and manage upcoming appointments."
          />

          <PortalCard
            title="My Medical Records"
            description="Access available clinical information."
          />

          <PortalCard
            title="My Reports"
            description="View available investigation and clinical reports."
          />

          <PortalCard
            title="My Rehabilitation"
            description="Track rehabilitation plans and progress."
          />

          <PortalCard
            title="Billing & Payments"
            description="View bills, payments and outstanding balances."
          />

          <PortalCard
            title="Communication"
            description="Future secure communication with the care team."
          />
        </div>
      </div>
    </main>
  );
}

function PortalCard({
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
