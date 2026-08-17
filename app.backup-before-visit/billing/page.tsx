export default function BillingPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl bg-white border p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wider text-blue-600">
            Hospital Finance
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Billing & Payments
          </h1>

          <p className="mt-3 max-w-3xl text-slate-600">
            Central workspace for patient charges, invoices, payments,
            billing records and financial reporting.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <BillingCard
            title="Patient Charges"
            description="Record and manage billable services."
          />

          <BillingCard
            title="Invoices"
            description="Create and manage patient invoices."
          />

          <BillingCard
            title="Payments"
            description="Record payments and outstanding balances."
          />

          <BillingCard
            title="Billing Reports"
            description="Review billing and payment information."
          />
        </div>
      </div>
    </main>
  );
}

function BillingCard({
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
