import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

function maskAadhaar(value: string | null) {
  return value ? `XXXX XXXX ${value.slice(-4)}` : "-";
}

function dateText(value: Date | null | undefined) {
  if (!value) return "-";
  return value.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function dateTimeText(value: Date | null | undefined) {
  if (!value) return "-";
  return value.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

export default async function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patientId = Number(id);
  if (!Number.isInteger(patientId)) notFound();

  const patient = await prisma.patient.findFirst({ where: { id: patientId } });
  if (!patient) notFound();

  const [encounters, opdVisits, appointments, billingRecords] = await Promise.all([
    prisma.clinicalEncounter.findMany({ where: { patientId }, orderBy: { encounterDate: "desc" }, take: 20 }),
    prisma.oPDVisit.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { doctor: true, departmentMaster: true, investigationOrders: true },
    }),
    prisma.appointment.findMany({ where: { patientId }, orderBy: [{ appointmentDate: "desc" }, { appointmentTime: "desc" }], take: 10 }),
    prisma.billingRecord.findMany({ where: { patientId }, orderBy: { createdAt: "desc" }, take: 10, include: { lineItems: true } }),
  ]);

  const dob = dateText(patient.dateOfBirth);
  const gender = patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : "-";
  const initials = `${patient.firstName?.[0] || ""}${patient.lastName?.[0] || ""}`.toUpperCase();
  const latestEncounter = encounters[0];
  const latestVisit = opdVisits[0];
  const investigations = opdVisits.flatMap((visit) => visit.investigationOrders).slice(0, 8);
  const outstanding = billingRecords.reduce((sum, bill) => sum + bill.balanceAmount, 0);

  return (
    <main className="min-h-screen bg-[#eef3f5] text-slate-900 lg:flex">
      <div className="lg:sticky lg:top-0 lg:h-screen lg:w-[270px] lg:shrink-0"><Sidebar /></div>
      <div className="min-w-0 flex-1">
        <Navigation />
        <div className="relative min-h-[calc(100vh-76px)] overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.pexels.com/photos/1647962/pexels-photo-1647962.jpeg?auto=compress&cs=tinysrgb&w=2400')" }} />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(238,243,245,0.78),rgba(242,246,247,0.94)_38%,rgba(237,243,245,0.98))]" />

          <div className="relative mx-auto max-w-[1500px] px-4 py-6 sm:px-7 lg:px-10 lg:py-8">
            <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#426a73]">SAMS · Patient Command Centre</p>
                <p className="mt-1 text-sm text-slate-500">Clinical record / longitudinal patient view</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href="/patients" className="rounded-xl border border-white/80 bg-white/85 px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm backdrop-blur">← Patient Registry</a>
                <a href={`/patients/profile/${patient.id}/opd-slip`} className="rounded-xl bg-[#0d4050] px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-[#092f3b]">+ New Visit</a>
              </div>
            </header>

            <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/88 shadow-[0_22px_70px_rgba(32,67,76,0.14)] backdrop-blur-md">
              <div className="relative overflow-hidden bg-[linear-gradient(135deg,#123e4c,#1d5a63_58%,#315f64)] px-6 py-7 text-white sm:px-9 lg:py-8">
                <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-5">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] border border-white/20 bg-white/10 text-2xl font-black shadow-inner">{initials || "PT"}</div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100">Patient profile</p>
                      <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">{patient.firstName} {patient.lastName}</h1>
                      <p className="mt-2 text-sm text-cyan-50">Patient ID · <span className="font-bold text-white">{patient.patientId}</span></p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <Stat label="Visits" value={String(opdVisits.length || encounters.length)} />
                    <Stat label="Investigations" value={String(investigations.length)} />
                    <Stat label="Bills" value={String(billingRecords.length)} />
                  </div>
                </div>
              </div>
              <div className="grid divide-y border-t border-white/20 bg-white/75 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <InfoStrip label="Current status" value={latestVisit?.status || "Registered"} />
                <InfoStrip label="Last visit" value={latestEncounter ? dateText(latestEncounter.encounterDate) : "No visit yet"} />
                <InfoStrip label="Outstanding" value={outstanding > 0 ? `₹${outstanding.toFixed(2)}` : "₹0.00"} />
              </div>
            </section>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
              <section className="rounded-[1.7rem] border border-white/90 bg-white/92 p-6 shadow-[0_16px_50px_rgba(32,67,76,0.09)] backdrop-blur-md sm:p-7">
                <SectionHeading eyebrow="01 · Patient identity" title="Demographics & contact" />
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Detail label="Date of birth" value={dob} />
                  <Detail label="Gender" value={gender} />
                  <Detail label="Mobile" value={patient.phone || "Not provided"} />
                  <Detail label="Aadhaar" value={maskAadhaar(patient.aadhaarNumber)} />
                  <Detail label="Emergency contact" value={patient.emergencyContact || "Not provided"} wide />
                  <Detail label="Address" value={patient.address || "Not provided"} wide />
                </div>
              </section>

              <section className="rounded-[1.7rem] border border-[#d5b36a]/35 bg-[linear-gradient(145deg,#fffaf0,#ffffff)] p-6 shadow-[0_16px_50px_rgba(76,62,30,0.08)] sm:p-7">
                <SectionHeading eyebrow="02 · Quick clinical actions" title="Continue care" />
                <div className="mt-6 space-y-3">
                  <Action href={`/patients/profile/${patient.id}/opd-slip`} title="Start New Visit" text="Create an OPD slip and continue the clinical workflow." primary />
                  <Action href="/billing" title="Open Billing" text="Review billing and payment workspace." />
                  <Action href="/portal" title="Patient Portal" text="Open the patient-facing portal workspace." />
                </div>
              </section>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <section className="rounded-[1.7rem] border border-white/90 bg-white/92 p-6 shadow-[0_16px_50px_rgba(32,67,76,0.09)] backdrop-blur-md sm:p-7">
                <SectionHeading eyebrow="03 · Clinical timeline" title="Visit history" />
                {encounters.length ? <div className="mt-6 space-y-3">{encounters.slice(0, 8).map((encounter) => <a key={encounter.id} href={`/patients/profile/${patient.id}/encounters/${encounter.id}`} className="block rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-[#8bb5ba] hover:bg-[#f1f7f7]"><div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#e3f0f1] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#245762]">Visit #{encounter.id}</span><span className="text-xs font-semibold text-slate-400">{dateTimeText(encounter.encounterDate)}</span></div><h3 className="mt-2 text-sm font-black text-[#123e4c]">{encounter.chiefComplaint || "Clinical Visit"}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{encounter.diagnosis || encounter.clinicalNotes || encounter.treatmentPlan || "Clinical documentation available in Visit Details."}</p></div><span className="text-sm font-black text-[#39717a]">View →</span></div></a>)}</div> : <Empty text="No Visits recorded yet." action="Start first Visit" href={`/patients/profile/${patient.id}/opd-slip`} />}
              </section>

              <section className="rounded-[1.7rem] border border-white/90 bg-white/92 p-6 shadow-[0_16px_50px_rgba(32,67,76,0.09)] backdrop-blur-md sm:p-7">
                <SectionHeading eyebrow="04 · Diagnosis & treatment" title="Latest clinical summary" />
                <div className="mt-6 space-y-3">
                  <Summary label="Chief complaint" value={latestEncounter?.chiefComplaint || "No documented complaint"} />
                  <Summary label="Diagnosis" value={latestEncounter?.diagnosis || "No diagnosis documented"} />
                  <Summary label="Treatment plan" value={latestEncounter?.treatmentPlan || "No treatment plan documented"} />
                  <Summary label="Follow-up" value={latestEncounter?.followUpDate ? dateText(latestEncounter.followUpDate) : "Not scheduled"} />
                </div>
              </section>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              <section className="rounded-[1.7rem] border border-white/90 bg-white/92 p-6 shadow-sm backdrop-blur-md">
                <SectionHeading eyebrow="05 · Diagnostics" title="Investigations" />
                {investigations.length ? <div className="mt-5 space-y-2">{investigations.map((item) => <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3"><div className="flex items-center justify-between gap-3"><p className="text-sm font-black text-[#123e4c]">{item.investigation}</p><span className="text-[9px] font-black uppercase text-slate-400">{item.status}</span></div><p className="mt-1 text-xs text-slate-500">{item.reportText || "Report pending"}</p></div>)}</div> : <p className="mt-5 text-sm text-slate-500">No investigation orders recorded.</p>}
              </section>

              <section className="rounded-[1.7rem] border border-white/90 bg-white/92 p-6 shadow-sm backdrop-blur-md">
                <SectionHeading eyebrow="06 · Appointments" title="Upcoming & recent" />
                {appointments.length ? <div className="mt-5 space-y-2">{appointments.slice(0, 6).map((appointment) => <div key={appointment.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3"><div className="flex items-center justify-between gap-3"><p className="text-sm font-black text-[#123e4c]">{appointment.doctorName}</p><span className="text-[9px] font-black uppercase text-[#39717a]">{appointment.status}</span></div><p className="mt-1 text-xs text-slate-500">{appointment.appointmentDate} · {appointment.appointmentTime}</p><p className="mt-1 text-xs text-slate-400">{appointment.departmentName || "Clinical appointment"}</p></div>)}</div> : <p className="mt-5 text-sm text-slate-500">No appointments recorded.</p>}
              </section>

              <section className="rounded-[1.7rem] border border-white/90 bg-white/92 p-6 shadow-sm backdrop-blur-md">
                <SectionHeading eyebrow="07 · Financial record" title="Billing" />
                {billingRecords.length ? <div className="mt-5 space-y-2">{billingRecords.slice(0, 6).map((bill) => <div key={bill.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3"><div className="flex items-center justify-between gap-3"><p className="text-sm font-black text-[#123e4c]">{bill.billNumber}</p><span className="text-[9px] font-black uppercase text-slate-400">{bill.paymentStatus}</span></div><div className="mt-2 flex justify-between text-xs"><span className="text-slate-500">Net ₹{bill.netAmount.toFixed(2)}</span><span className={bill.balanceAmount > 0 ? "font-black text-amber-700" : "font-bold text-emerald-700"}>Balance ₹{bill.balanceAmount.toFixed(2)}</span></div></div>)}</div> : <p className="mt-5 text-sm text-slate-500">No billing records recorded.</p>}
              </section>
            </div>

            <section className="mt-5 rounded-[1.7rem] border border-dashed border-[#8ca8ad] bg-white/75 p-6 shadow-sm backdrop-blur-md sm:p-7">
              <SectionHeading eyebrow="08 · Documents" title="Patient documents" />
              <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-[#f1f6f6] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-black text-[#123e4c]">Document workspace ready</p><p className="mt-1 text-xs leading-5 text-slate-500">This profile keeps a dedicated space for reports, prescriptions and uploaded clinical documents as the document workflow is enabled.</p></div><span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500">Coming with document workflow</span></div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div><p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#39717a]">{eyebrow}</p><h2 className="mt-1 text-xl font-black tracking-tight text-[#123e4c] sm:text-2xl">{title}</h2></div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-center backdrop-blur"><p className="text-[9px] font-black uppercase tracking-wider text-cyan-100">{label}</p><p className="mt-1 text-lg font-black text-white">{value}</p></div>;
}

function InfoStrip({ label, value }: { label: string; value: string }) {
  return <div className="px-6 py-4"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p><p className="mt-1 text-sm font-black text-[#123e4c]">{value}</p></div>;
}

function Detail({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return <div className={`rounded-2xl border border-slate-100 bg-slate-50/80 p-4 ${wide ? "sm:col-span-2" : ""}`}><p className="text-[9px] font-black uppercase tracking-[0.17em] text-slate-400">{label}</p><p className="mt-2 break-words text-sm font-bold text-[#123e4c]">{value}</p></div>;
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4"><p className="text-[9px] font-black uppercase tracking-[0.17em] text-slate-400">{label}</p><p className="mt-2 text-sm font-bold leading-6 text-[#123e4c]">{value}</p></div>;
}

function Action({ href, title, text, primary }: { href: string; title: string; text: string; primary?: boolean }) {
  return <a href={href} className={`block rounded-2xl border p-4 transition ${primary ? "border-[#39717a]/30 bg-[#eaf3f4] hover:bg-[#deebed]" : "border-slate-100 bg-slate-50/80 hover:bg-white"}`}><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-black text-[#123e4c]">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div><span className="text-lg font-black text-[#39717a]">→</span></div></a>;
}

function Empty({ text, action, href }: { text: string; action: string; href: string }) {
  return <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-10 text-center"><p className="text-sm font-bold text-slate-500">{text}</p><a href={href} className="mt-4 inline-flex rounded-xl bg-[#123e4c] px-4 py-2.5 text-xs font-black text-white">{action} →</a></div>;
}
