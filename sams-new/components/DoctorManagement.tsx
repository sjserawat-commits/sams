"use client";

import { useEffect, useState } from "react";

type Doctor = {
  id: number;
  name: string;
  qualification?: string | null;
  introduction?: string | null;
  active: boolean;
};

const emptyForm = {
  name: "",
  qualification: "",
  introduction: "",
};

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function loadDoctors() {
    const res = await fetch("/api/doctors");
    setDoctors(await res.json());
  }

  useEffect(() => {
    loadDoctors();
  }, []);

  async function saveDoctor() {
    if (!form.name.trim()) {
      setMessage("Doctor name is required.");
      return;
    }

    const res = await fetch("/api/doctors", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        editingId ? { id: editingId, ...form } : form
      ),
    });

    if (!res.ok) {
      setMessage("Unable to save doctor.");
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    setMessage("Doctor profile saved.");
    loadDoctors();
  }

  async function removeDoctor(id: number) {
    if (!confirm("Remove this doctor from the public Experts page?")) return;

    await fetch("/api/doctors", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    loadDoctors();
  }

  function editDoctor(doctor: Doctor) {
    setEditingId(doctor.id);
    setForm({
      name: doctor.name,
      qualification: doctor.qualification || "",
      introduction: doctor.introduction || "",
    });
    setMessage("");
  }

  return (
    <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="border-b border-slate-200 pb-5">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#082b61]">
          Website Management
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-[#082b61]">
          Doctors / Experts Team
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Add, edit or remove doctors shown on the public Experts Team page.
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Doctor name"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />

        <input
          value={form.qualification}
          onChange={(e) =>
            setForm({ ...form, qualification: e.target.value })
          }
          placeholder="Qualifications"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />

        <textarea
          value={form.introduction}
          onChange={(e) =>
            setForm({ ...form, introduction: e.target.value })
          }
          placeholder="Doctor introduction / profile"
          rows={5}
          className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2"
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={saveDoctor}
            className="rounded-lg bg-[#082b61] px-5 py-2 font-semibold text-white"
          >
            {editingId ? "Update Doctor" : "Add Doctor"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="rounded-lg border border-slate-300 px-5 py-2"
            >
              Cancel
            </button>
          )}
        </div>

        {message && (
          <p className="text-sm font-medium text-slate-600">{message}</p>
        )}
      </div>

      <div className="mt-8 space-y-3">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="font-semibold text-[#082b61]">{doctor.name}</p>
              <p className="text-sm text-slate-500">
                {doctor.qualification || "Qualification not added"}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => editDoctor(doctor)}
                className="text-sm font-semibold text-[#082b61]"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => removeDoctor(doctor.id)}
                className="text-sm font-semibold text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
