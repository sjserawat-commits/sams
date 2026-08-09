"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Patient = {
  id: number;
  patientId?: string;
  firstName?: string;
  lastName?: string | null;
  gender?: string;
  status?: string;
};

type Encounter = {
  id: number;
  patientId: number;
  encounterDate?: string;
  chiefComplaint?: string | null;
  diagnosis?: string | null;
};

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: "⌂" },
  { label: "Patients", href: "/patients", icon: "♙" },
  { label: "Encounters", href: "/encounters", icon: "✚" },
  { label: "Clinical", href: "/clinical", icon: "⌁" },
  { label: "PM&R", href: "/pmr", icon: "◈" },
  { label: "Billing", href: "/billing", icon: "₹" },
  { label: "Reports", href: "/reports", icon: "▤" },
  { label: "Patient Portal", href: "/portal", icon: "◉" },
  { label: "Settings", href: "/settings", icon: "⚙" },
];

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const [patientsResponse, encountersResponse] = await Promise.all([
          fetch("/api/patients", { cache: "no-store" }),
          fetch("/api/patients/encounters", { cache: "no-store" }),
        ]);

        const patientsData = patientsResponse.ok ? await patientsResponse.json() : [];
        const encountersData = encountersResponse.ok ? await encountersResponse.json() : [];

        if (active) {
          setPatients(Array.isArray(patientsData) ? patientsData : []);
          setEncounters(Array.isArray(encountersData) ? encountersData : []);
        }
      } catch {
        if (active) {
          setPatients([]);
          setEncounters([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const today = new Date().toDateString();

  const todayEncounters = useMemo(
    () =>
      encounters.filter((encounter) => {
        if (!encounter.encounterDate) return false;
        return new Date(encounter.encounterDate).toDateString() === today;
      }),
    [encounters, today]
  );

  const recentPatients = patients.slice(-5).reverse();
  const recentEncounters = encounters.slice(-5).reverse();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 flex-col bg-[#082b61] text-white lg:flex">
          <div className="border-b border-white/10 px-7 py-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl font-black text-[#0b4ea2] shadow-lg">
                S
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight">SAMS</div>
                <div className="text-xs font-medium text-blue-200">Smart Advanced Medical System</div>
              </div>
            </div>
          </div>

          <div className="px-4 py-6">
            <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300">
              Main Menu
            </p>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const active = item.href === "/dashboard";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-white text-[#0b4ea2] shadow-sm"
                        : "text-blue-100 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-sm">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-5">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <div className="text-xs font-semibold text-blue-200">SYSTEM STATUS</div>
              <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                All core services operational
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
            <div className="flex h-20 items-center justify-between gap-4 px-5 sm:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0b63ce]">Clinical Command Center</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Good day, SAMS team</h1>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex">
                  <span>⌕</span>
                  <span>Search patients...</span>
                  <kbd className="ml-5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px]">⌘ K</kbd>
                </div>
                <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50" aria-label="Notifications">
                  ♢
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                </button>
                <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-[#0b63ce] text-sm font-bold text-white sm:flex">ST</div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] space-y-7 p-5 sm:p-8">
            <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b63ce] via-[#0a56b4] to-[#082b61] p-6 text-white shadow-xl shadow-blue-900/10 sm:p-8">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                <div className="max-w-2xl">
                  <div className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                    Clinical Operations
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Everything important, at a glance.</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                    Manage patients, clinical encounters and hospital workflows from one secure workspace.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/patients" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0b4ea2] shadow-lg hover:bg-blue-50">
                    + New Patient
                  </Link>
                  <Link href="/encounters" className="rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur hover:bg-white/20">
                    + New Encounter
                  </Link>
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Total Patients", value: loading ? "—" : patients.length.toLocaleString(), note: "Registered in SAMS", icon: "♙" },
                { label: "Today's Encounters", value: loading ? "—" : todayEncounters.length.toLocaleString(), note: "Clinical activity today", icon: "✚" },
                { label: "Total Encounters", value: loading ? "—" : encounters.length.toLocaleString(), note: "Recorded clinical visits", icon: "⌁" },
                { label: "System Status", value: "Live", note: "Core services operational", icon: "✓" },
              ].map((card) => (
                <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{card.label}</p>
                      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{card.value}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-[#0b63ce]">{card.icon}</div>
                  </div>
                  <p className="mt-3 text-xs font-medium text-slate-400">{card.note}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                  <div>
                    <h2 className="font-bold text-slate-900">Recent Clinical Activity</h2>
                    <p className="mt-1 text-xs text-slate-400">Latest patient encounters recorded in SAMS</p>
                  </div>
                  <Link href="/encounters" className="text-sm font-semibold text-[#0b63ce] hover:underline">View all</Link>
                </div>
                <div className="divide-y divide-slate-100">
                  {recentEncounters.length === 0 ? (
                    <div className="px-6 py-10 text-center text-sm text-slate-400">No encounters recorded yet.</div>
                  ) : (
                    recentEncounters.map((encounter) => {
                      const patient = patients.find((item) => item.id === encounter.patientId);
                      const name = patient ? `${patient.firstName || "Patient"} ${patient.lastName || ""}`.trim() : `Patient #${encounter.patientId}`;
                      return (
                        <div key={encounter.id} className="flex items-center justify-between gap-4 px-6 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#0b63ce]">{(name[0] || "P").toUpperCase()}</div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-800">{name}</p>
                              <p className="truncate text-xs text-slate-400">{encounter.diagnosis || encounter.chiefComplaint || "Clinical encounter"}</p>
                            </div>
                          </div>
                          <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Recorded</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                  <h2 className="font-bold text-slate-900">Quick Actions</h2>
                  <p className="mt-1 text-xs text-slate-400">Common clinical workflows</p>
                </div>
                <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-1">
                  {[
                    ["Register Patient", "/patients", "♙"],
                    ["New Encounter", "/encounters", "✚"],
                    ["Clinical Modules", "/clinical", "⌁"],
                    ["PM&R Workspace", "/pmr", "◈"],
                    ["Billing & Finance", "/billing", "₹"],
                    ["Reports & Analytics", "/reports", "▤"],
                  ].map(([label, href, icon]) => (
                    <Link key={href} href={href} className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:border-blue-100 hover:bg-blue-50">
                      <span className="flex items-center gap-3 text-sm font-semibold text-slate-700 group-hover:text-[#0b63ce]">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm text-[#0b63ce] shadow-sm">{icon}</span>
                        {label}
                      </span>
                      <span className="text-slate-300 group-hover:text-[#0b63ce]">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h2 className="font-bold text-slate-900">Recent Patients</h2>
                  <p className="mt-1 text-xs text-slate-400">Latest registrations</p>
                </div>
                <Link href="/patients" className="text-sm font-semibold text-[#0b63ce] hover:underline">Patient directory →</Link>
              </div>
              <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-5">
                {recentPatients.length === 0 ? (
                  <div className="py-6 text-sm text-slate-400 md:col-span-2 xl:col-span-5">No patients found.</div>
                ) : (
                  recentPatients.map((patient) => (
                    <Link key={patient.id} href={`/patients/profile/${patient.id}`} className="rounded-xl border border-slate-100 p-4 transition hover:border-blue-100 hover:bg-blue-50/50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b63ce] text-xs font-bold text-white">{(patient.firstName?.[0] || "P").toUpperCase()}</div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800">{`${patient.firstName || "Patient"} ${patient.lastName || ""}`.trim()}</p>
                          <p className="mt-0.5 truncate text-[11px] text-slate-400">{patient.patientId || `ID ${patient.id}`}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

            <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row">
              <span>SAMS • Smart Advanced Medical System</span>
              <span>Clinical operations dashboard</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
