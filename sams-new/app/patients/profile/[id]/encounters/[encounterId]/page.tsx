import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EncounterDetailPage({ params }: { params: Promise<{ id: string; encounterId: string }> }) {
  const { id, encounterId } = await params;
  const patientId = Number(id);
  const encounterIdNumber = Number(encounterId);
  if (!Number.isInteger(patientId) || !Number.isInteger(encounterIdNumber)) notFound();

  const encounter = await prisma.clinicalEncounter.findFirst({ where: { id: encounterIdNumber, patientId }, include: { patient: true } });
  if (!encounter) notFound();

  const date = encounter.encounterDate.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
  const followUp = encounter.followUpDate ? encounter.followUpDate.toLocaleDateString("en-GB") : "Not scheduled";
  const patient = encounter.patient;

  return (
    <main className="min-h-screen bg-[#f5f8fc] text-slate-900">
      <Sidebar />
      <Navigation />
      <div className="mx-auto max-w-[1200px] px-5 py-7 sm:px-8 sm:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">SAMS · Clinical Encounter</p><p className="mt-1 text-sm text-slate-500">{patient.firstName} {patient.lastName} · {patient.patientId}</p></div>
          <a href={`/patients/profile/${patient.id}`} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm hover:border-blue-200 hover:text-[#0b63ce]">← Back to Patient</a>
        </div>
        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0b63ce] via-[#0959b8] to-[#082b61] p-7 text-white shadow-[0_24px_70px_rgba(8,43,97,0.18)] sm:p-9">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">Encounter #{encounter.id}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Clinical encounter</h1>
          <p className="mt-3 text-sm text-blue-100">{date}</p>
        </section>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {[ ["Chief complaint", encounter.chiefComplaint || "Not recorded"], ["Diagnosis", encounter.diagnosis || "Not recorded"], ["Clinical notes", encounter.clinicalNotes || "Not recorded"], ["Treatment plan", encounter.treatmentPlan || "Not recorded"], ["Follow-up", followUp] ].map(([label, value]) => <section key={label} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(8,43,97,0.06)] sm:p-7"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0b63ce]">{label}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{value}</p></section>)}
        </div>
      </div>
    </main>
  );
}
