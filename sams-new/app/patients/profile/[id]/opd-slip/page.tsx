"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Patient = {
id: number;
patientId?: string;
firstName: string;
lastName?: string;
gender?: string;
};

type Department = {
id: number;
name: string;
code?: string;
};

type Doctor = {
id: number;
name?: string;
firstName?: string;
lastName?: string;
};

type OPDVisit = {
id: number;
tokenNumber: number;
visitType: string;
department?: string | null;
status?: string;
doctorId?: number | null;
};

export default function OPDSlipPage() {
const params = useParams();
const router = useRouter();

const patientId = String(params.id);

const [patient, setPatient] = useState<Patient | null>(null);
const [departments, setDepartments] = useState<Department[]>([]);
const [doctors, setDoctors] = useState<Doctor[]>([]);

const [department, setDepartment] = useState("");
const [doctor, setDoctor] = useState("");
const [visitType, setVisitType] = useState("New");

const [createdVisit, setCreatedVisit] = useState<OPDVisit | null>(null);

const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");

useEffect(() => {
async function loadData() {
try {
const patientResponse = await fetch("/api/patients/" + patientId);

if (!patientResponse.ok) {  
      throw new Error("Unable to load patient.");  
    }  

    const patientData = await patientResponse.json();  
    setPatient(patientData);  

    const departmentResponse = await fetch(  
      "/api/departments"  
    );  

    if (!departmentResponse.ok) {  
      throw new Error("Unable to load departments.");  
    }  

    const departmentData = await departmentResponse.json();  

    setDepartments(  
      Array.isArray(departmentData) ? departmentData : []  
    );  
  } catch (err) {  
    setError(  
      err instanceof Error  
        ? err.message  
        : "Unable to load patient details."  
    );  
  } finally {  
    setLoading(false);  
  }  
}  

if (patientId) {  
  loadData();  
} else {  
  setError("Invalid patient ID.");  
  setLoading(false);  
}

}, [patientId]);

useEffect(() => {
async function loadDoctors() {
if (!department) {
setDoctors([]);
setDoctor("");
return;
}

try {  
    const response = await fetch(  
      `/api/doctors?departmentId=${department}`  
    );  

    if (!response.ok) {  
      throw new Error("Unable to load doctors.");  
    }  

    const data = await response.json();  

    setDoctors(Array.isArray(data) ? data : []);  
  } catch (err) {  
    setDoctors([]);  
    setDoctor("");  

    setError(  
      err instanceof Error  
        ? err.message  
        : "Unable to load doctors."  
    );  
  }  
}  

loadDoctors();

}, [department]);

async function createOPDSlip() {
if (!department) {
setError("Please select a department.");
return;
}

setSaving(true);  
setError("");  

try {  
  const response = await fetch("/api/opd", {  
    method: "POST",  
    headers: {  
      "Content-Type": "application/json",  
    },  
    body: JSON.stringify({  
      patientId: Number(patientId),  
      department: department,  
      doctorId: doctor ? Number(doctor) : null,  
      visitType: visitType,  
    }),  
  });  

  const data = await response.json();  

  if (!response.ok) {  
    throw new Error(  
      data?.error || "Unable to create OPD visit."  
    );  
  }  

  setCreatedVisit(data);  
} catch (err) {  
  setError(  
    err instanceof Error  
      ? err.message  
      : "Unable to create OPD visit."  
  );  
} finally {  
  setSaving(false);  
}

}

function getDoctorName() {
const selectedDoctor = doctors.find(
(item) => item.id === Number(doctor)
);

if (!selectedDoctor) {  
  return "—";  
}  

if (selectedDoctor.name) {  
  return selectedDoctor.name;  
}  

return `${selectedDoctor.firstName || ""} ${  
  selectedDoctor.lastName || ""  
}`.trim() || "—";

}

function getDepartmentName() {
const selectedDepartment = departments.find(
(item) => String(item.id) === department
);

return selectedDepartment?.name || "—";

}

function startConsultation() {
if (!createdVisit) {
return;
}

router.push(  
  `/patients/profile/${patientId}/consultation?opdVisitId=${createdVisit.id}`  
);

}

if (loading) {
return (
<main className="flex min-h-screen items-center justify-center bg-[#f5f8fc]">
<p className="text-sm font-semibold text-slate-500">
Loading patient...
</p>
</main>
);
}

if (!patient) {
return (
<main className="min-h-screen bg-[#f5f8fc] px-5 py-8">
<div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
<p className="font-semibold text-red-600">
{error || "Patient not found."}
</p>
</div>
</main>
);
}

return (
<main className="min-h-screen bg-[#f5f8fc] px-5 py-8 text-slate-900 sm:px-8">
<div className="mx-auto max-w-5xl">

<button  
      type="button"  
      onClick={() =>  
        router.push(`/patients/profile/${patientId}`)  
      }  
      className="mb-5 text-sm font-bold text-[#0b63ce]"  
    >  
      ← Back to Patient Profile  
    </button>  

    <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm">  

      <header className="bg-gradient-to-br from-[#0b63ce] to-[#082b61] px-7 py-8 text-white sm:px-9">  
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">  
          SAMS · OPD  
        </p>  

        <h1 className="mt-2 text-3xl font-black">  
          Create OPD Slip  
        </h1>  

        <p className="mt-2 text-sm text-blue-100">  
          Register today&apos;s outpatient visit before starting the  
          clinical consultation.  
        </p>  
      </header>  

      <section className="border-b border-slate-100 p-6 sm:p-8">  
        <p className="mb-5 text-[11px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">  
          Patient Details  
        </p>  

        <div className="grid gap-5 sm:grid-cols-3">  

          <div>  
            <p className="text-xs font-semibold text-slate-400">  
              Patient  
            </p>  

            <p className="mt-1 text-lg font-black text-[#082b61]">  
              {patient.firstName} {patient.lastName || ""}  
            </p>  
          </div>  

          <div>  
            <p className="text-xs font-semibold text-slate-400">  
              Patient ID  
            </p>  

            <p className="mt-1 font-bold text-slate-700">  
              {patient.patientId || patient.id}  
            </p>  
          </div>  

          <div>  
            <p className="text-xs font-semibold text-slate-400">  
              Gender  
            </p>  

            <p className="mt-1 font-bold text-slate-700">  
              {patient.gender || "—"}  
            </p>  
          </div>  

        </div>  
      </section>  

      {!createdVisit && (  
        <section className="p-6 sm:p-8">  

          <p className="mb-5 text-[11px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">  
            Visit Details  
          </p>  

          <div className="grid gap-5 sm:grid-cols-3">  

            <div>  
              <label className="mb-2 block text-xs font-black text-slate-500">  
                Department  
              </label>  

              <select  
                value={department}  
                onChange={(event) =>  
                  setDepartment(event.target.value)  
                }  
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none"  
              >  
                <option value="">  
                  Select Department  
                </option>  

                {departments.map((item) => (  
                  <option key={item.id} value={item.id}>  
                    {item.name}  
                  </option>  
                ))}  
              </select>  
            </div>  

            <div>  
              <label className="mb-2 block text-xs font-black text-slate-500">  
                Consultant  
              </label>  

              <select  
                value={doctor}  
                onChange={(event) =>  
                  setDoctor(event.target.value)  
                }  
                disabled={!department}  
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none disabled:bg-slate-100"  
              >  
                <option value="">  
                  Select Consultant  
                </option>  

                {doctors.map((item) => (  
                  <option key={item.id} value={item.id}>  
                    {item.name ||  
                      `${item.firstName || ""} ${  
                        item.lastName || ""  
                      }`.trim()}  
                  </option>  
                ))}  
              </select>  
            </div>  

            <div>  
              <label className="mb-2 block text-xs font-black text-slate-500">  
                Visit Type  
              </label>  

              <select  
                value={visitType}  
                onChange={(event) =>  
                  setVisitType(event.target.value)  
                }  
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none"  
              >  
                <option value="New">  
                  New  
                </option>  

                <option value="FOLLOW_UP">  
                  Follow-up  
                </option>  
              </select>  
            </div>  

          </div>  

          {error && (  
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">  
              {error}  
            </div>  
          )}  

          <div className="mt-7 flex justify-end">  

            <button  
              type="button"  
              onClick={createOPDSlip}  
              disabled={saving}  
              className="rounded-xl bg-[#0b63ce] px-7 py-3 text-sm font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"  
            >  
              {saving  
                ? "Creating..."  
                : "Create OPD Slip →"}  
            </button>  

          </div>  

        </section>  
      )}  

      {createdVisit && (  
        <section className="p-6 sm:p-8">  

          <div className="rounded-2xl bg-blue-50 p-7 text-center">  

            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">  
              OPD Slip Created  
            </p>  

            <p className="mt-2 text-sm font-semibold text-slate-500">  
              Token / Queue Number  
            </p>  

            <p className="mt-1 text-6xl font-black text-[#082b61]">  
              {createdVisit.tokenNumber}  
            </p>  

          </div>  

          <div className="mt-6 grid gap-5 sm:grid-cols-3">  

            <div>  
              <p className="text-xs font-bold text-slate-400">  
                Patient  
              </p>  

              <p className="mt-1 font-black text-[#082b61]">  
                {patient.firstName} {patient.lastName || ""}  
              </p>  
            </div>  

            <div>  
              <p className="text-xs font-bold text-slate-400">  
                Department  
              </p>  

              <p className="mt-1 font-bold text-slate-700">  
                {createdVisit.department ||  
                  getDepartmentName()}  
              </p>  
            </div>  

            <div>  
              <p className="text-xs font-bold text-slate-400">  
                Visit Type  
              </p>  

              <p className="mt-1 font-bold text-slate-700">  
                {createdVisit.visitType === "FOLLOW_UP"  
                  ? "Follow-up"  
                  : "New"}  
              </p>  
            </div>  

            <div>  
              <p className="text-xs font-bold text-slate-400">  
                Consultant  
              </p>  

              <p className="mt-1 font-bold text-slate-700">  
                {getDoctorName()}  
              </p>  
            </div>  

            <div>  
              <p className="text-xs font-bold text-slate-400">  
                Status  
              </p>  

              <p className="mt-1 font-bold text-amber-600">  
                Waiting  
              </p>  
            </div>  

            <div>  
              <p className="text-xs font-bold text-slate-400">  
                OPD Visit ID  
              </p>  

              <p className="mt-1 font-bold text-slate-700">  
                {createdVisit.id}  
              </p>  
            </div>  

          </div>  

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">  

            <button  
              type="button"  
              onClick={() =>  
                router.push(`/patients/profile/${patientId}`)  
              }  
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600"  
            >  
              Back to Patient Profile  
            </button>  

            <button  
              type="button"  
              onClick={() => window.print()}  
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600"  
            >  
              Print OPD Slip  
            </button>  

            <button  
              type="button"  
              onClick={startConsultation}  
              className="rounded-xl bg-[#0b63ce] px-7 py-3 text-sm font-black text-white shadow-lg"  
            >  
              Start Consultation →  
            </button>  

          </div>  

        </section>  
      )}  

    </section>  
  </div>  
</main>

);
}
