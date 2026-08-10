import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import EncounterForm from "./EncounterForm";

export default async function NewEncounterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patientId = Number(id);

  if (!Number.isInteger(patientId)) notFound();

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (!patient) notFound();

  return (
    <main className="min-h-screen bg-slate-50">
      <Sidebar />
      <div>
        <Navigation />
        <div className="mx-auto max-w-4xl px-6 py-8">
          <a href={`/patients/profile/${patient.id}`} className="text-sm font-bold text-blue-700 hover:underline">← Back to Patient Profile</a>
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Clinical Encounter</p>
            <h1 className="mt-1 text-3xl font-black text-slate-900">New Encounter</h1>
            <p className="mt-2 text-sm text-slate-500">
              {patient.firstName} {patient.lastName} · {patient.patientId}
            </p>
          </div>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <EncounterForm patientId={patient.id} patientName={`${patient.firstName} ${patient.lastName}`} />
          </div>
        </div>
      </div>
    </main>
  );
}
