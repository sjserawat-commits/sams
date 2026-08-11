import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";

export default async function EncountersPage() {
  const patients = await prisma.patient.findMany({ orderBy: { id: "desc" }, take: 50 });

  return (
    <main className="min-h-screen bg-slate-50">
      <Sidebar />
      <div>
        <Navigation />
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Clinical</p>
              <h1 className="mt-1 text-3xl font-black text-slate-900">Encounters</h1>
              <p className="mt-2 text-sm text-slate-500">Select a patient to start a new clinical encounter.</p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="font-bold text-slate-900">Patients</h2>
            </div>
            {patients.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-slate-400">No patients found. Register a patient first.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {patients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between gap-4 px-6 py-4">
                    <div>
                      <p className="font-bold text-slate-800">{patient.firstName} {patient.lastName}</p>
                      <p className="mt-1 text-xs text-slate-400">{patient.patientId}</p>
                    </div>
                    <a href={`/encounters/${patient.id}`} className="rounded-xl bg-[#082b61] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0b63ce]">New Encounter →</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
