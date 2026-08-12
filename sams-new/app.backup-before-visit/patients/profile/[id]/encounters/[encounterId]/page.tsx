import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";

export default async function EncounterDetailPage({ params }: { params: Promise<{ id: string; encounterId: string }> }) {
  const { id, encounterId } = await params;
  const patientId = Number(id);
  const encounterIdNumber = Number(encounterId);

  if (!Number.isInteger(patientId) || !Number.isInteger(encounterIdNumber)) {
    return <EncounterMissing />;
  }

  const encounter = await prisma.clinicalEncounter.findUnique({
    where: { id: encounterIdNumber },
    include: { patient: true },
  });

  if (!encounter) return <EncounterMissing patientId={patientId} />;

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
          {[["Chief complaint", encounter.chiefComplaint || "Not recorded"], ["Diagnosis", encounter.diagnosis || "Not recorded"], ["Clinical notes", encounter.clinicalNotes || "Not recorded"], ["Treatment plan", encounter.treatmentPlan || "Not recorded"], ["Follow-up", followUp]].map(([label, value]) => <section key={label} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(8,43,97,0.06)] sm:p-7"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0b63ce]">{label}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{value}</p></section>)}
        </div>
      </div>
    </main>
  );
}

function EncounterMissing({ patientId }: { patientId?: number }) {
  return (
    <main className="min-h-screen bg-[#f5f8fc] text-slate-900"><Sidebar /><Navigation /><div className="mx-auto max-w-3xl px-5 py-16 sm:px-8"><section className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(8,43,97,0.08)]"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-[#0b63ce]">!</div><p className="mt-6 text-[10px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">SAMS · Clinical Workspace</p><h1 className="mt-2 text-3xl font-black tracking-tight text-[#082b61]">Encounter not found</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">This encounter record is not available in the current database. Your patient record is safe and unchanged.</p><a href={patientId ? `/patients/profile/${patientId}` : "/patients"} className="mt-7 inline-flex rounded-xl bg-[#0b63ce] px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-900/15">← Back to Patient</a></section></div></main>
  );
}
