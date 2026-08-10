import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patientId = Number(id);

  if (!Number.isInteger(patientId)) notFound();

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      encounters: {
        orderBy: { encounterDate: "desc" },
      },
    },
  });

  if (!patient) notFound();

  return (
    <main className="min-h-screen bg-slate-50">
      <Sidebar />
      <div>
        <Navigation />
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Patient Record</p>
              <h1 className="mt-1 text-3xl font-black text-slate-900">{patient.firstName} {patient.lastName}</h1>
              <p className="mt-1 text-sm text-slate-500">{patient.patientId}</p>
            </div>
            <a
              href={`/patients/profile/${patient.id}/encounter`}
              className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-800"
            >
              + New Encounter
            </a>
          </div>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Patient Information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Info label="Patient ID" value={patient.patientId} />
              <Info label="Gender" value={patient.gender || "-"} />
              <Info label="Date of Birth" value={patient.dateOfBirth?.toLocaleDateString() || "-"} />
              <Info label="Phone" value={patient.phone || "-"} />
              <Info label="Address" value={patient.address || "-"} />
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Clinical Encounters</h2>
                <p className="mt-1 text-sm text-slate-500">Consultation history for this patient.</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{patient.encounters.length}</span>
            </div>

            {patient.encounters.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                No encounters recorded yet. Start the first clinical encounter using the button above.
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {patient.encounters.map((encounter) => (
                  <article key={encounter.id} className="rounded-xl border border-slate-200 p-5">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row">
                      <p className="font-bold text-slate-900">Encounter #{encounter.id}</p>
                      <p className="text-xs font-semibold text-slate-500">{encounter.encounterDate.toLocaleString()}</p>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Info label="Chief Complaint" value={encounter.chiefComplaint || "-"} />
                      <Info label="Diagnosis" value={encounter.diagnosis || "-"} />
                      <Info label="Clinical Notes" value={encounter.clinicalNotes || "-"} />
                      <Info label="Treatment Plan" value={encounter.treatmentPlan || "-"} />
                      <Info label="Follow-up" value={encounter.followUpDate?.toLocaleDateString() || "-"} />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <a href="/patients/list" className="mt-6 inline-block text-sm font-bold text-blue-700 hover:underline">← Back to Patient List</a>
        </div>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
