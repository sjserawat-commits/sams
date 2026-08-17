import { prisma } from "@/lib/prisma";
import PrintOnLoad from "@/components/PrintOnLoad";

function age(dob: Date | null) {
  if (!dob) return "—";
  const now = new Date();
  let value = now.getFullYear() - dob.getFullYear();
  if (now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) value--;
  return String(value);
}

function dt(value: Date) {
  return `${value.toLocaleDateString("en-IN")} · ${value.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
}

function noteSection(notes: string | null, label: string) {
  if (!notes) return "";
  const match = notes.match(new RegExp(`${label}:\\n([\\s\\S]*?)(?:\\n\\n|$)`, "i"));
  return match?.[1]?.trim() || "";
}

export default async function PostConsultationPrint({ params }: { params: Promise<{ id: string; encounterId: string }> }) {
  const { id, encounterId } = await params;
  const encounter = await prisma.clinicalEncounter.findFirst({
    where: { id: Number(encounterId), patientId: Number(id) },
    include: {
      patient: true,
      opdVisit: { include: { departmentMaster: true, doctor: true, prescriptions: true } },
    },
  });

  if (!encounter) return <div className="missing">Consultation record not found.</div>;

  const patient = encounter.patient;
  const visit = encounter.opdVisit;
  const notes = encounter.clinicalNotes || "";
  const vitals = noteSection(notes, "Vitals");
  const physical = noteSection(notes, "Physical / Clinical Findings");
  const investigations = noteSection(notes, "Investigations");
  const advice = noteSection(notes, "General Advice");
  const medicines = visit?.prescriptions || [];
  const doctor = visit?.doctor?.name || "—";
  const department = visit?.departmentMaster?.name || encounter.speciality || "—";

  return (
    <>
      <PrintOnLoad />
      <main className="sheet">
        <header className="header">
          <div className="brand"><img src="/serawat-logo.png" alt="S" /><div className="hospital">SAMS SERAWAT ADVANCED MULTISPECIALTY JOINT &amp; SPINE CENTER</div></div>
          <div className="opd"><b>OPD · #{visit?.tokenNumber ?? encounter.id}</b><span>Visit Registration</span><strong>{dt(visit?.createdAt || encounter.createdAt)}</strong></div>
        </header>
        <section className="patient">
          <div><span>Patient</span><b>{patient.firstName} {patient.lastName}</b></div><div><span>Patient ID</span><b>{patient.patientId}</b></div><div><span>Age / Sex</span><b>{age(patient.dateOfBirth)} / {patient.gender || "—"}</b></div><div><span>Mobile</span><b>{patient.phone || "—"}</b></div>
          <div><span>DOB</span><b>{patient.dateOfBirth?.toLocaleDateString("en-IN") || "—"}</b></div><div><span>Visit No.</span><b>{encounter.id}</b></div><div><span>Department</span><b>{department}</b></div><div><span>Consultant</span><b>{doctor}</b></div>
          <div><span>Consultation Start</span><b>{dt(encounter.encounterDate)}</b></div>
        </section>
        <section className="complaints"><div><h3>Chief Complaint</h3><p>{encounter.chiefComplaint || "—"}</p></div><div><h3>Clinical Diagnosis</h3><p>{encounter.diagnosis || "—"}</p></div></section>
        <section className="body">
          <aside>{vitals && <Tool title="Vitals" value={vitals} />}{physical && <Tool title="Physical / Clinical" value={physical} />}{investigations && <Tool title="Investigations" value={investigations} />}{advice && <Tool title="General Advice" value={advice} />}</aside>
          <div className="main">
            <h3>Medicines / Prescription</h3>
            {medicines.length ? <table><thead><tr><th>Medicine</th><th>Dose</th><th>Frequency</th><th>Food</th><th>Duration</th></tr></thead><tbody>{medicines.map(m => <tr key={m.id}><td>{m.medicineName}</td><td>{m.dose || "—"}</td><td>{m.frequency || "—"}</td><td>{m.instructions || "—"}</td><td>{m.duration || "—"}</td></tr>)}</tbody></table> : <p className="empty">Prescription / clinical management details</p>}
            <div className="footer"><div><span>Follow-up Date</span><b>{encounter.followUpDate?.toLocaleDateString("en-IN") || "—"}</b></div><div className="signature"><span>Consultant</span><b>{doctor}</b><i>Signature</i></div></div>
          </div>
        </section>
      </main>
      <style>{`@page{size:A4 portrait;margin:0}html,body{margin:0!important;padding:0!important;background:#fff!important}.sheet{box-sizing:border-box;width:210mm;height:297mm;max-height:297mm;overflow:hidden;padding:8mm 9mm 7mm;color:#172033;background:#fff;font-family:Arial,Helvetica,sans-serif}.header{height:25mm;border-bottom:1px solid #183d70;display:flex;align-items:center;justify-content:space-between}.brand{display:flex;align-items:center;gap:4mm}.brand img{width:14mm;height:14mm;object-fit:contain}.hospital{font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:700;letter-spacing:.045em;color:#082b61;line-height:1.15}.opd{display:flex;flex-direction:column;align-items:flex-end;gap:1mm;font-size:9px;color:#082b61;border:1px solid #d7c08a;padding:2mm 3mm;border-radius:2mm}.opd span{font-size:7px;color:#64748b}.opd strong{font-size:8px}.patient{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm 5mm;padding:4mm 0;border-bottom:1px solid #cbd5e1}.patient span,.footer span,aside span{display:block;font-size:7px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#64748b}.patient b{display:block;font-size:9px;margin-top:1mm}.complaints{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #cbd5e1}.complaints>div{min-height:25mm;padding:3.5mm 4mm}.complaints>div+div{border-left:1px solid #cbd5e1}.complaints h3,.main>h3{margin:0 0 2mm;font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:#082b61}.complaints p{margin:0;font-size:8.5px;line-height:1.35;white-space:pre-wrap}.body{display:grid;grid-template-columns:39mm 1fr;height:166mm;border-bottom:1px solid #cbd5e1}.body aside{border-right:1px solid #cbd5e1;padding:3mm}.body aside>div{padding:3mm 0;border-bottom:1px solid #e2e8f0}.body aside>div:last-child{border-bottom:0}.body aside b{display:block;font-size:8px;color:#082b61;margin-bottom:1mm}.body aside p{margin:0;font-size:7.5px;line-height:1.35;white-space:pre-wrap;overflow-wrap:anywhere}.main{padding:4mm 4.5mm;display:flex;flex-direction:column;min-width:0}.main table{width:100%;border-collapse:collapse;table-layout:fixed}.main th,.main td{border-bottom:1px solid #e2e8f0;padding:1.5mm;font-size:7.5px;text-align:left;vertical-align:top;overflow-wrap:anywhere}.main th{font-size:7px;color:#64748b;text-transform:uppercase}.empty{font-size:8px;color:#94a3b8}.footer{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;padding-top:4mm}.footer b{display:block;font-size:9px;margin-top:1mm;color:#082b61}.signature{text-align:center;min-width:45mm}.signature i{display:block;font-style:normal;font-size:7px;color:#64748b;margin-top:7mm;border-top:1px solid #64748b;padding-top:1mm}.missing{padding:40px;font-family:Arial}@media print{html,body{width:210mm!important;height:297mm!important;overflow:hidden!important}.sheet{width:210mm!important;height:297mm!important;max-height:297mm!important;overflow:hidden!important;page-break-after:avoid!important}}`}</style>
    </>
  );
}

function Tool({ title, value }: { title: string; value: string }) {
  return <div><b>{title}</b><p>{value}</p></div>;
}
