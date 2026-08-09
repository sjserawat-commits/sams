import Navigation from "@/components/Navigation";

const actions = [
  ["+", "Register Patient", "/patients"],
  ["✚", "New Encounter", "/clinical"],
  ["♿", "PM&R Workspace", "/pmr"],
  ["₹", "Billing", "/billing"],
];

const modules = [
  ["Patients", "Patient registration & records", "/patients", "P"],
  ["Clinical", "Encounters & documentation", "/clinical", "C"],
  ["PM&R", "Rehabilitation services", "/pmr", "R"],
  ["Billing", "Invoices & payments", "/billing", "B"],
  ["Reports", "Hospital analytics", "/reports", "A"],
  ["Patient Portal", "Patient-facing services", "/portal", "PP"],
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <Navigation />

      <div className="mx-auto max-w-[1500px] p-4 md:p-6">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                Clinical Operations
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                Good morning, SAMS
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Welcome to your hospital command center.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-right md:block">
                <p className="text-xs text-slate-400">System status</p>
                <p className="text-sm font-semibold text-emerald-600">
                  ● Operational
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
                SA
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {actions.map(([icon, title, href]) => (
              <a
                key={href}
                href={href}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-300 hover:bg-blue-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700 text-lg font-semibold text-white">
                  {icon}
                </span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-slate-500">Open workspace</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat title="Total Patients" value="—" note="Live database" />
          <Stat title="Today's Encounters" value="—" note="Clinical activity" />
          <Stat title="Appointments" value="—" note="Today's schedule" />
          <Stat title="Pending Billing" value="—" note="Financial workflow" />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="font-semibold">Today's Clinical Overview</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Current hospital activity
                </p>
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                Live
              </span>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-3">
              <Overview label="New Patients" value="—" />
              <Overview label="Active Encounters" value="—" />
              <Overview label="Completed Visits" value="—" />
            </div>

            <div className="mx-5 mb-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="text-sm font-medium text-slate-600">
                Clinical activity will appear here
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Connect live patient and encounter data to populate this panel.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold">Clinical Alerts</h2>
              <p className="mt-1 text-xs text-slate-500">
                Items requiring attention
              </p>
            </div>

            <div className="space-y-3 p-5">
              <Alert
                title="No active alerts"
                text="Clinical alerts will appear when available."
              />
              <Alert
                title="Documentation"
                text="Pending clinical tasks will be shown here."
              />
              <Alert
                title="PM&R"
                text="Therapy and rehabilitation tasks will appear here."
              />
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold">SAMS Workspaces</h2>
            <p className="mt-1 text-xs text-slate-500">
              Hospital departments and digital services
            </p>
          </div>

          <div className="grid gap-px bg-slate-200 md:grid-cols-2 xl:grid-cols-3">
            {modules.map(([title, description, href, icon]) => (
              <a
                key={href}
                href={href}
                className="group bg-white p-5 transition hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                    {icon}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold group-hover:text-blue-700">
                      {title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {description}
                    </p>
                  </div>

                  <span className="text-slate-300 group-hover:text-blue-600">
                    →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <footer className="px-2 py-6 text-xs text-slate-400">
          SAMS · Smart Advanced Medical System · PM&R Hospital
        </footer>
      </div>
    </main>
  );
}

function Stat({
  title,
  value,
  note,
}: {
  title: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{note}</p>
    </div>
  );
}

function Overview({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Alert({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
        </div>
      </div>
    </div>
  );
}
