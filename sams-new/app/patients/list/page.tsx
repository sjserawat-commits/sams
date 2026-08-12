import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";

function maskAadhaar(value: string | null) {
  return value ? `XXXX XXXX ${value.slice(-4)}` : "-";
}

export default async function PatientListPage() {
  const patients = await prisma.patient.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <main className="min-h-screen bg-[#f5f8fc] text-slate-900">
      <Sidebar />
      <div><Navigation /><div className="mx-auto max-w-[1400px] px-5 py-7 sm:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-[1.75rem] bg-gradient-to-br from-[#0b63ce] to-[#082b61] p-7 text-white shadow-xl sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-200">SAMS · Patient Management</p><h1 className="mt-2 text-3xl font-black tracking-tight">Patient Directory</h1><p className="mt-1 text-sm text-blue-100">Registered patients and secure demographic records.</p></div>
          <a href="/patients/new" className="rounded-xl bg-white px-5 py-3 text-sm font-black text-[#0b63ce]">+ Register New Patient</a>
        </header>
        <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5"><h2 className="text-xl font-black text-[#082b61]">Registered Patients</h2><p className="mt-1 text-sm text-slate-500">Aadhaar numbers are masked for privacy.</p></div>
          {patients.length === 0 ? <p className="p-8 text-center text-slate-500">No patients registered yet.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-4">Patient ID</th><th className="px-5 py-4">Name</th><th className="px-5 py-4">Aadhaar</th><th className="px-5 py-4">Gender</th><th className="px-5 py-4">Phone</th><th className="px-5 py-4">Registration Date</th></tr></thead><tbody className="divide-y divide-slate-100">{patients.map((patient)=><tr key={patient.id} className="hover:bg-blue-50/40"><td className="px-5 py-4 text-sm font-black text-[#082b61]">{patient.patientId}</td><td className="px-5 py-4"><a className="text-sm font-black text-[#0b63ce] hover:underline" href={`/patients/profile/${patient.id}`}>{patient.firstName} {patient.lastName}</a></td><td className="px-5 py-4 text-sm font-semibold text-slate-600">{maskAadhaar(patient.aadhaarNumber)}</td><td className="px-5 py-4 text-sm text-slate-600">{patient.gender || "-"}</td><td className="px-5 py-4 text-sm text-slate-600">{patient.phone || "-"}</td><td className="px-5 py-4 text-sm text-slate-500">{patient.createdAt.toLocaleDateString("en-IN")}</td></tr>)}</tbody></table></div>}
        </section>
      </div></div>
    </main>
  );
}
