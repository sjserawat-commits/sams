"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Patient = {
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  age?: number | string;
  gender?: string;
  phone?: string;
  mobile?: string;
};

type Medicine = {
  id: number;
  name: string;
  dose: string;
  frequency: string;
  food: string;
  duration: string;
};

export default function ConsultationPage() {
  const params = useParams();
  const patientId = String(params?.id || "");

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [department, setDepartment] = useState("");
  const [doctor, setDoctor] = useState("");
  const [tokenNo, setTokenNo] = useState("");

  const [chiefComplaint, setChiefComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");

  const [vitals, setVitals] = useState("");
  const [clinicalFindings, setClinicalFindings] = useState("");
  const [investigation, setInvestigation] = useState("");
  const [generalAdvice, setGeneralAdvice] = useState("");

  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: 1,
      name: "",
      dose: "",
      frequency: "",
      food: "",
      duration: "",
    },
  ]);

  const [followUpDate, setFollowUpDate] = useState("");

  useEffect(() => {
    async function loadPatient() {
      if (!patientId) {
        setError("Invalid patient ID.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/patients/" + patientId);

        if (!response.ok) {
          throw new Error("Unable to load patient.");
        }

        const data = await response.json();
        setPatient(data);
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

    loadPatient();
  }, [patientId]);

  function addMedicine() {
    setMedicines((current) => [
      ...current,
      {
        id: Date.now(),
        name: "",
        dose: "",
        frequency: "",
        food: "",
        duration: "",
      },
    ]);
  }

  function updateMedicine(
    id: number,
    field: keyof Medicine,
    value: string
  ) {
    setMedicines((current) =>
      current.map((medicine) =>
        medicine.id === id
          ? { ...medicine, [field]: value }
          : medicine
      )
    );
  }

  function removeMedicine(id: number) {
    setMedicines((current) =>
      current.length === 1
        ? current
        : current.filter((medicine) => medicine.id !== id)
    );
  }

  function printSlip() {
    window.print();
  }

  async function saveConsultation() {
    setSaving(true);
    setError("");

    try {
      console.log("Consultation data", {
        patientId,
        department,
        doctor,
        tokenNo,
        chiefComplaint,
        diagnosis,
        vitals,
        clinicalFindings,
        investigation,
        generalAdvice,
        medicines,
        followUpDate,
      });

      alert("Consultation saved successfully.");
    } catch {
      setError("Unable to save consultation.");
    } finally {
      setSaving(false);
    }
  }


  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="font-semibold text-slate-600">
          Loading consultation workspace...
        </p>
      </main>
    );
  }

  if (error && !patient) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <p className="font-bold text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  const patientName =
    patient?.name ||
    `${patient?.firstName || ""} ${patient?.lastName || ""}`.trim() ||
    "Patient";

  return (
    <main className="min-h-screen bg-slate-200 px-3 py-6 text-slate-900 print:bg-white print:p-0">
      <section className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-xl print:max-w-none print:rounded-none print:border-0 print:shadow-none">

        {/* HOSPITAL HEADER */}
        <header className="border-b-2 border-[#082b61] px-5 py-6 sm:px-8">
          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-[#c9a227] bg-white text-center text-xs font-black text-[#082b61]">
                SAMS
              </div>

              <div>
                <h1 className="text-xl font-black uppercase tracking-wide text-[#082b61] sm:text-2xl">
                  Serawat Advance Musculoskeletal-Joint & Spine Centre
                </h1>

                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[#0b63ce] sm:text-sm">
                  Pain Medicine • Electrodiagnosis • Physical Medicine Rehabilitation
                </p>
              </div>
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Consultation
              </p>
              <p className="mt-1 text-sm font-bold text-[#082b61]">
                OPD Clinical Workspace
              </p>
            </div>

          </div>
        </header>

        {/* PATIENT + VISIT INFORMATION */}
        <section className="grid border-b border-slate-300 md:grid-cols-2">

          <div className="border-b border-slate-200 p-5 md:border-b-0 md:border-r">
            <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-[#0b63ce]">
              Patient Information
            </h2>

            <div className="grid grid-cols-2 gap-x-5 gap-y-3 text-sm">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">
                  Patient Name
                </p>
                <p className="mt-1 font-bold text-[#082b61]">
                  {patientName}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">
                  Patient ID
                </p>
                <p className="mt-1 font-semibold">
                  {patient?.id || patientId}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">
                  Age
                </p>
                <p className="mt-1 font-semibold">
                  {patient?.age || "—"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">
                  Gender
                </p>
                <p className="mt-1 font-semibold">
                  {patient?.gender || "—"}
                </p>
              </div>

              <div className="col-span-2">
                <p className="text-[10px] font-black uppercase text-slate-400">
                  Contact
                </p>
                <p className="mt-1 font-semibold">
                  {patient?.phone || patient?.mobile || "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-[#0b63ce]">
              OPD Visit Information
            </h2>

            <div className="grid grid-cols-2 gap-4">

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">
                  Department
                </label>
                <input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Department"
                  className="mt-1 w-full border-b border-slate-300 bg-transparent px-1 py-2 text-sm font-semibold outline-none focus:border-[#0b63ce]"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">
                  Doctor
                </label>
                <input
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  placeholder="Doctor name"
                  className="mt-1 w-full border-b border-slate-300 bg-transparent px-1 py-2 text-sm font-semibold outline-none focus:border-[#0b63ce]"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">
                  Token No.
                </label>
                <input
                  value={tokenNo}
                  onChange={(e) => setTokenNo(e.target.value)}
                  placeholder="Token number"
                  className="mt-1 w-full border-b border-slate-300 bg-transparent px-1 py-2 text-sm font-bold text-[#0b63ce] outline-none focus:border-[#0b63ce]"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400">
                  Date
                </label>
                <p className="mt-2 text-sm font-bold">
                  {new Date().toLocaleDateString("en-IN")}
                </p>
              </div>

            </div>
          </div>

        </section>

        {/* COMPLAINT + DIAGNOSIS */}
        <section className="grid border-b border-slate-300 md:grid-cols-2">

          <div className="border-b border-slate-200 p-5 md:border-b-0 md:border-r">
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-[#0b63ce]">
              Chief Complaint
            </label>

            <textarea
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              rows={5}
              placeholder="Enter patient's chief complaint..."
              className="w-full resize-none rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm outline-none focus:border-[#0b63ce] focus:bg-white"
            />
          </div>

          <div className="p-5">
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-[#0b63ce]">
              Diagnosis
            </label>

            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              rows={5}
              placeholder="Enter diagnosis..."
              className="w-full resize-none rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm outline-none focus:border-[#0b63ce] focus:bg-white"
            />
          </div>

        </section>


        {/* CLINICAL WORKSPACE */}
        <section className="grid border-b border-slate-300 md:grid-cols-2">

          {/* LEFT SIDEBAR */}
          <div className="border-b border-slate-200 p-5 md:border-b-0 md:border-r">

            <h2 className="mb-5 border-b border-slate-200 pb-3 text-sm font-black uppercase tracking-widest text-[#082b61]">
              Clinical Assessment
            </h2>

            {/* VITALS */}
            <div className="mb-5">
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#0b63ce]">
                Vitals
              </label>

              <textarea
                value={vitals}
                onChange={(e) => setVitals(e.target.value)}
                rows={4}
                placeholder="BP, pulse, temperature, SpO₂, weight, etc."
                className="w-full resize-none rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm outline-none focus:border-[#0b63ce] focus:bg-white"
              />
            </div>

            {/* CLINICAL FINDINGS */}
            <div className="mb-5">
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#0b63ce]">
                Physical / Clinical Findings
              </label>

              <textarea
                value={clinicalFindings}
                onChange={(e) => setClinicalFindings(e.target.value)}
                rows={7}
                placeholder="Enter examination findings..."
                className="w-full resize-none rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm outline-none focus:border-[#0b63ce] focus:bg-white"
              />
            </div>

            {/* INVESTIGATION */}
            <div className="mb-5">
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#0b63ce]">
                Investigation Advice
              </label>

              <textarea
                value={investigation}
                onChange={(e) => setInvestigation(e.target.value)}
                rows={6}
                placeholder="Investigations advised..."
                className="w-full resize-none rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm outline-none focus:border-[#0b63ce] focus:bg-white"
              />
            </div>

            {/* GENERAL ADVICE */}
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#0b63ce]">
                Other General Advice
              </label>

              <textarea
                value={generalAdvice}
                onChange={(e) => setGeneralAdvice(e.target.value)}
                rows={6}
                placeholder="Diet, activity, precautions, lifestyle or other advice..."
                className="w-full resize-none rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm outline-none focus:border-[#0b63ce] focus:bg-white"
              />
            </div>

          </div>

          {/* MEDICINES */}
          <div className="p-5">

            <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-200 pb-3">

              <h2 className="text-sm font-black uppercase tracking-widest text-[#082b61]">
                Medicines / Prescription
              </h2>

              <button
                type="button"
                onClick={addMedicine}
                className="rounded-lg bg-[#082b61] px-4 py-2 text-xs font-black text-white shadow-sm hover:opacity-90 print:hidden"
              >
                + Add Medicine
              </button>

            </div>

            <div className="space-y-4">

              {medicines.map((medicine, index) => (
                <div
                  key={medicine.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >

                  <div className="mb-4 flex items-center justify-between">

                    <p className="text-xs font-black uppercase tracking-wider text-[#0b63ce]">
                      Medicine {index + 1}
                    </p>

                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicine(medicine.id)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 print:hidden"
                      >
                        Remove
                      </button>
                    )}

                  </div>

                  <div className="grid gap-4">

                    {/* MEDICINE NAME */}
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400">
                        Medicine Name
                      </label>

                      <input
                        value={medicine.name}
                        onChange={(e) =>
                          updateMedicine(
                            medicine.id,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Medicine name"
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b63ce]"
                      />
                    </div>

                    {/* DOSE + FREQUENCY */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400">
                          Dose
                        </label>

                        <input
                          value={medicine.dose}
                          onChange={(e) =>
                            updateMedicine(
                              medicine.id,
                              "dose",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 500 mg"
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0b63ce]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400">
                          Frequency
                        </label>

                        <select
                          value={medicine.frequency}
                          onChange={(e) =>
                            updateMedicine(
                              medicine.id,
                              "frequency",
                              e.target.value
                            )
                          }
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0b63ce]"
                        >
                          <option value="">Select</option>
                          <option value="OD">OD</option>
                          <option value="BD">BD</option>
                          <option value="TDS">TDS</option>
                          <option value="QID">QID</option>
                          <option value="HS">HS</option>
                          <option value="SOS">SOS</option>
                          <option value="STAT">STAT</option>
                        </select>
                      </div>

                    </div>

                    {/* FOOD + DURATION */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400">
                          Food Intake
                        </label>

                        <select
                          value={medicine.food}
                          onChange={(e) =>
                            updateMedicine(
                              medicine.id,
                              "food",
                              e.target.value
                            )
                          }
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0b63ce]"
                        >
                          <option value="">Select</option>
                          <option value="Before Food">Before Food</option>
                          <option value="After Food">After Food</option>
                          <option value="With Food">With Food</option>
                          <option value="Any Time">Any Time</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400">
                          Duration
                        </label>

                        <input
                          value={medicine.duration}
                          onChange={(e) =>
                            updateMedicine(
                              medicine.id,
                              "duration",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 5 days"
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0b63ce]"
                        />
                      </div>

                    </div>

                  </div>

                </div>
              ))}

            </div>

          </div>

        </section>


        {/* DOCTOR SIGNATURE */}
        <div className="border-t border-slate-200 px-5 py-6 sm:px-8">
          <div className="flex justify-end">
            <div className="w-64 text-center">
              <div className="mb-10 border-b border-slate-400"></div>

              <p className="text-sm font-black text-[#082b61]">
                Doctor's Signature
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Authorized Medical Officer
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="border-t-2 border-[#0b63ce] bg-slate-50 p-5 sm:p-7">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div className="w-full sm:max-w-xs">
              <label className="mb-2 block text-[11px] font-black uppercase tracking-wider text-slate-500">
                Next Follow-up
              </label>

              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#0b63ce] print:border-0"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row print:hidden">

              <button
                type="button"
                onClick={saveConsultation}
                disabled={saving}
                className="rounded-xl bg-[#0b63ce] px-6 py-3 text-sm font-black text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Consultation"}
              </button>

              <button
                type="button"
                onClick={printSlip}
                className="rounded-xl border-2 border-[#082b61] bg-white px-6 py-3 text-sm font-black text-[#082b61]"
              >
                Print Consultation Slip
              </button>

            </div>

          </div>

        </footer>

      </section>
    </main>
  );
}

