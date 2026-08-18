"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Patient = {
  id: number;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: string | null;
  phone: string | null;
  encounters: Encounter[];
  opdVisits: Visit[];
  billingRecords: Billing[];
};

type Encounter = {
  id: number;
  encounterDate: string;
  speciality: string | null;
  chiefComplaint: string | null;
  diagnosis: string | null;
  clinicalNotes: string | null;
  treatmentPlan: string | null;
  followUpDate: string | null;
};

type Visit = {
  id: number;
  tokenNumber: number;
  visitType: string;
  status: string;
  createdAt: string;
  departmentMaster: { name: string } | null;
  doctor: { name: string } | null;
  investigationOrders: Investigation[];
};

type Investigation = {
  id: number;
  investigation: string;
  price: number;
  netAmount: number;
  paymentStatus: string;
  status: string;
  reportText: string | null;
  reportedAt: string | null;
  createdAt: string;
};

type Billing = {
  id: number;
  billNumber: string;
  receiptNumber: string | null;
  subtotal: number;
  discount: number;
  netAmount: number;
  paymentStatus: string;
  paymentMethod: string | null;
  paidAmount: number;
  balanceAmount: number;
  paidAt: string | null;
  createdAt: string;
  lineItems: { id: number; serviceType: string; description: string; quantity: number; unitPrice: number; amount: number }[];
};

type Doctor = { id: number; name: string; qualification: string | null; departmentId: number | null; department: { id: number; name: string; code: string } | null };
type Department = { id: number; name: string; code: string };
type Appointment = { id: number; appointmentNo: string; appointmentDate: string; appointmentTime: string; doctorName: string; departmentName: string | null; status: string; reason: string | null; tokenNumber: number | null };

const money = (value: number) => `₹${Number(value || 0).toFixed(2)}`;
const dateText = (value: string | null) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function PatientPortalPage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [patientId, setPatientId] = useState("");
  const [phone, setPhone] = useState("");
  const [active, setActive] = useState("appointments");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [doctorId, setDoctorId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [reason, setReason] = useState("");
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetch("/api/doctors").then((r) => r.json()).then((data) => setDoctors(Array.isArray(data) ? data : [])).catch(() => undefined);
    fetch("/api/departments").then((r) => r.json()).then((data) => setDepartments(Array.isArray(data) ? data : [])).catch(() => undefined);
  }, []);

  const selectedDoctor = useMemo(() => doctors.find((doctor) => String(doctor.id) === doctorId) || null, [doctors, doctorId]);
  const filteredDoctors = useMemo(() => departmentId ? doctors.filter((doctor) => String(doctor.departmentId) === departmentId) : doctors, [doctors, departmentId]);

  async function loadPortal(e?: FormEvent) {
    e?.preventDefault();
    setLoading(true); setError(""); setMessage("");
    try {
      const numericId = patientId.trim();
      if (!numericId || !phone.trim()) throw new Error("Patient ID and registered mobile number are required.");
      const response = await fetch(`/api/patients/${encodeURIComponent(numericId)}`.replace(/\/patients\/[^/]+$/, `/patients/${encodeURIComponent(numericId)}`) + `?phone=${encodeURIComponent(phone)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to verify patient.");
      setPatient(data);
      const appointmentsResponse = await fetch(`/api/appointments?patientId=${data.id}&phone=${encodeURIComponent(phone)}`);
      const appointmentData = await appointmentsResponse.json();
      setAppointments(Array.isArray(appointmentData) ? appointmentData : []);
      setActive("appointments");
    } catch (err) {
      setPatient(null); setAppointments([]); setError(err instanceof Error ? err.message : "Unable to open patient portal.");
    } finally { setLoading(false); }
  }

  function signOut() {
    setPatient(null); setAppointments([]); setPatientId(""); setPhone(""); setMessage(""); setError("");
  }

  async function bookAppointment(e: FormEvent) {
    e.preventDefault();
    if (!patient || !selectedDoctor || !appointmentDate || !appointmentTime) return;
    setBooking(true); setError(""); setMessage("");
    try {
      const department = selectedDoctor.department || departments.find((item) => item.id === selectedDoctor.departmentId) || null;
      const response = await fetch("/api/appointments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id, patientType: "existing", patientName: `${patient.firstName} ${patient.lastName}`, mobile: patient.phone, doctorId: selectedDoctor.id, doctorName: selectedDoctor.name, departmentId: department?.id || null, departmentName: department?.name || null, appointmentDate, appointmentTime, reason, source: "ONLINE" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to book appointment.");
      setAppointments((current) => [...current, data]);
      setShowBooking(false); setReason(""); setAppointmentDate(""); setAppointmentTime(""); setDoctorId(""); setMessage(`Appointment ${data.appointmentNo} booked successfully.`); setActive("appointments");
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to book appointment."); }
    finally { setBooking(false); }
  }

  if (!patient) {
    return <main className="min-h-screen bg-[#f4f7fb] px-5 py-10 text-slate-900"><div className="mx-auto max-w-xl"><div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_25px_80px_rgba(8,43,97,.12)]"><div className="bg-gradient-to-br from-[#082b61] to-[#0b63ce] p-8 text-white"><p className="text-[10px] font-black uppercase tracking-[.25em] text-blue-200">SAMS · Patient Services</p><h1 className="mt-3 text-3xl font-black">Patient Portal</h1><p className="mt-2 text-sm leading-6 text-blue-100">Access your appointments, clinical records, investigation reports and billing information.</p></div><form onSubmit={loadPortal} className="space-y-4 p-8"><div><label className="text-xs font-black uppercase tracking-wider text-slate-500">Patient ID</label><input value={patientId} onChange={(e) => setPatientId(e.target.value)} placeholder="e.g. SAMS-0001" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#0b63ce]" /></div><div><label className="text-xs font-black uppercase tracking-wider text-slate-500">Registered Mobile Number</label><input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="Registered mobile number" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#0b63ce]" /></div>{error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}<button disabled={loading} className="w-full rounded-xl bg-[#082b61] px-5 py-3 font-black text-white shadow-lg disabled:opacity-50">{loading ? "Verifying…" : "Open My Portal"}</button><p className="text-center text-[11px] leading-5 text-slate-400">Use the mobile number already registered with SAMS. Do not share your portal details with others.</p></form></div></div></main>;
  }

  const allInvestigations = patient.opdVisits.flatMap((visit) => visit.investigationOrders.map((item) => ({ ...item, doctor: visit.doctor?.name || "", date: visit.createdAt })));
  const totalOutstanding = patient.billingRecords.reduce((sum, bill) => sum + Number(bill.balanceAmount || 0), 0);

  return <main className="min-h-screen bg-[#f4f7fb] text-slate-900"><div className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8"><div><p className="text-[9px] font-black uppercase tracking-[.25em] text-[#0b63ce]">SAMS · Patient Portal</p><h1 className="mt-1 text-lg font-black text-[#082b61]">Welcome, {patient.firstName}</h1></div><button onClick={signOut} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600">Sign out</button></div></div><div className="mx-auto max-w-7xl px-5 py-7 sm:px-8"><section className="rounded-[2rem] bg-gradient-to-br from-[#082b61] via-[#075dcc] to-[#0b63ce] p-7 text-white shadow-[0_20px_60px_rgba(8,43,97,.18)]"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-[10px] font-black uppercase tracking-[.22em] text-blue-200">Patient ID · {patient.patientId}</p><h2 className="mt-2 text-3xl font-black">{patient.firstName} {patient.lastName}</h2><p className="mt-2 text-sm text-blue-100">{patient.gender || "—"} · DOB {dateText(patient.dateOfBirth)} · Mobile •••• {String(patient.phone || "").slice(-4)}</p></div><div className="grid grid-cols-2 gap-3"><Stat label="Visits" value={String(patient.opdVisits.length)} /><Stat label="Outstanding" value={money(totalOutstanding)} /></div></div></section>

<div className="mt-6 flex flex-wrap gap-2">{[["appointments","Appointments"],["records","Medical Records"],["reports","Reports"],["billing","Billing & Payments"]].map(([key,label]) => <button key={key} onClick={() => setActive(key)} className={`rounded-xl px-4 py-2.5 text-xs font-black ${active===key?"bg-[#082b61] text-white":"border border-slate-200 bg-white text-slate-600"}`}>{label}</button>)}<button onClick={() => setShowBooking(true)} className="rounded-xl bg-[#0b63ce] px-4 py-2.5 text-xs font-black text-white">+ Book Appointment</button></div>

{message && <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p>}{error && <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

{active === "appointments" && <Panel title="My Appointments" subtitle="Appointments linked to your SAMS patient record."><div className="space-y-3">{appointments.length ? appointments.map((appointment) => <div key={appointment.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 md:flex-row md:items-center md:justify-between"><div><p className="font-black text-[#082b61]">{appointment.doctorName}</p><p className="mt-1 text-sm text-slate-500">{appointment.departmentName || "Consultation"} · {appointment.reason || "General consultation"}</p><p className="mt-2 text-xs font-bold text-slate-400">{appointment.appointmentNo} · {appointment.appointmentDate} at {appointment.appointmentTime}</p></div><span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#0b63ce]">{appointment.status}</span></div>) : <Empty text="No appointments found." />}</div></Panel>}

{active === "records" && <Panel title="Medical Records" subtitle="Clinical notes and visit history available in your SAMS record."><div className="space-y-4">{patient.encounters.length ? patient.encounters.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-black text-[#082b61]">{item.speciality || "Clinical Visit"}</h3><span className="text-xs font-bold text-slate-400">{dateText(item.encounterDate)}</span></div>{item.chiefComplaint && <p className="mt-3 text-sm"><b>Chief complaint:</b> {item.chiefComplaint}</p>}{item.diagnosis && <p className="mt-2 text-sm"><b>Diagnosis:</b> {item.diagnosis}</p>}{item.clinicalNotes && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.clinicalNotes}</p>}{item.treatmentPlan && <p className="mt-2 text-sm"><b>Plan:</b> {item.treatmentPlan}</p>}{item.followUpDate && <p className="mt-3 text-xs font-bold text-[#0b63ce]">Follow-up: {dateText(item.followUpDate)}</p>}</article>) : <Empty text="No clinical records are available yet." />}</div></Panel>}

{active === "reports" && <Panel title="Investigation Reports" subtitle="Results entered by the investigation workflow are shown here."><div className="space-y-3">{allInvestigations.length ? allInvestigations.map((item) => <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black text-[#082b61]">{item.investigation}</p><p className="mt-1 text-xs text-slate-400">{dateText(item.date)} · {item.doctor || "SAMS"}</p></div><span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase ${item.reportText ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{item.reportText ? "Report available" : item.status}</span></div>{item.reportText && <div className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{item.reportText}</div>}</div>) : <Empty text="No investigation reports are available yet." />}</div></Panel>}

{active === "billing" && <Panel title="Billing & Payments" subtitle="Bills, payments and outstanding balances linked to your visits."><div className="space-y-4">{patient.billingRecords.length ? patient.billingRecords.map((bill) => <article key={bill.id} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-black text-[#082b61]">{bill.billNumber}</p><p className="mt-1 text-xs text-slate-400">{dateText(bill.createdAt)} {bill.receiptNumber ? `· Receipt ${bill.receiptNumber}` : ""}</p></div><span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase text-[#0b63ce]">{bill.paymentStatus}</span></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><Amount label="Net amount" value={bill.netAmount} /><Amount label="Paid" value={bill.paidAmount} /><Amount label="Balance" value={bill.balanceAmount} /></div>{bill.lineItems.length > 0 && <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-100">{bill.lineItems.map((line) => <div key={line.id} className="flex justify-between gap-4 px-4 py-3 text-sm"><span>{line.description}</span><b>{money(line.amount)}</b></div>)}</div>}</article>) : <Empty text="No billing records are available yet." />}</div></Panel>}

{showBooking && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-5"><form onSubmit={bookAppointment} className="w-full max-w-lg rounded-[2rem] bg-white p-7 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-[#0b63ce]">Patient Services</p><h2 className="mt-1 text-2xl font-black text-[#082b61]">Book Appointment</h2></div><button type="button" onClick={() => setShowBooking(false)} className="text-xl text-slate-400">×</button></div><div className="mt-6 space-y-4"><select value={departmentId} onChange={(e) => { setDepartmentId(e.target.value); setDoctorId(""); }} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"><option value="">All departments</option>{departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select required value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"><option value="">Select consultant</option>{filteredDoctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}{doctor.qualification ? ` · ${doctor.qualification}` : ""}</option>)}</select><div className="grid grid-cols-2 gap-3"><input required type="date" min={new Date().toISOString().slice(0,10)} value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm"/><input required type="time" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm"/></div><textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Reason for visit (optional)" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"/><button disabled={booking || !selectedDoctor} className="w-full rounded-xl bg-[#082b61] px-5 py-3 font-black text-white disabled:opacity-50">{booking ? "Booking…" : "Confirm Appointment"}</button></div></form></div>}
</div></main>;
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <section className="mt-5 rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_15px_40px_rgba(8,43,97,.05)]"><div className="mb-5"><h2 className="text-xl font-black text-[#082b61]">{title}</h2><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>{children}</section>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center text-sm font-semibold text-slate-400">{text}</div>; }
function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3"><p className="text-[9px] font-black uppercase tracking-wider text-blue-200">{label}</p><p className="mt-1 text-sm font-black text-white">{value}</p></div>; }
function Amount({ label, value }: { label: string; value: number }) { return <div className="rounded-xl bg-slate-50 p-3"><p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 font-black text-[#082b61]">{money(value)}</p></div>; }
