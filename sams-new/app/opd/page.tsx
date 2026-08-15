"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Department = {
  id: number;
  name: string;
  code?: string;
};

type Visit = {
  id: number;
  tokenNumber: number;
  visitType: string;
  status: string;
  department?: string | null;
  patient: {
    id: number;
    patientId: string;
    firstName: string;
    lastName: string;
  };
};

const DESK_STORAGE_KEY = "sams-opd-desk-department-id";

export default function OPDQueuePage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [error, setError] = useState("");

  async function loadDepartments() {
    setLoadingDepartments(true);
    try {
      const response = await fetch("/api/departments");
      if (!response.ok) throw new Error("Unable to load departments.");
      const data: Department[] = await response.json();
      setDepartments(Array.isArray(data) ? data : []);

      const stored = window.localStorage.getItem(DESK_STORAGE_KEY);
      const storedId = stored ? Number(stored) : null;
      if (storedId && data.some((item) => item.id === storedId)) {
        setDepartmentId(storedId);
      } else {
        setDepartmentId(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load departments.");
    } finally {
      setLoadingDepartments(false);
    }
  }

  async function loadQueue(id: number) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/opd/queue?departmentId=${id}`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to load OPD queue.");
      setDepartment(data.department || null);
      setVisits(Array.isArray(data.visits) ? data.visits : []);
    } catch (e) {
      setVisits([]);
      setError(e instanceof Error ? e.message : "Unable to load OPD queue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (departmentId) {
      window.localStorage.setItem(DESK_STORAGE_KEY, String(departmentId));
      loadQueue(departmentId);
    } else if (!loadingDepartments) {
      setLoading(false);
    }
  }, [departmentId, loadingDepartments]);

  function setDesk(id: number) {
    setDepartmentId(id);
    setError("");
  }

  function changeDesk() {
    window.localStorage.removeItem(DESK_STORAGE_KEY);
    setDepartmentId(null);
    setDepartment(null);
    setVisits([]);
  }

  return (
    <main className="min-h-screen bg-[#f5f8fc] px-5 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] bg-gradient-to-br from-[#0b63ce] to-[#082b61] p-7 text-white shadow-xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">
                SAMS · Department OPD Desk
              </p>
              <h1 className="mt-2 text-3xl font-black">
                {department ? `${department.name} OPD` : "OPD Desk"}
              </h1>
              <p className="mt-2 text-sm text-blue-100">
                This desk shows only patients registered for its selected department.
              </p>
            </div>
            {department && (
              <button
                type="button"
                onClick={changeDesk}
                className="rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-xs font-black text-white hover:bg-white/15"
              >
                Change Desk Department
              </button>
            )}
          </div>
        </div>

        {!departmentId ? (
          <section className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">
              Desk configuration
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#082b61]">
              Select this computer's OPD department
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Select the department that operates from this computer. The selection is
              saved on this browser, so this desk will continue to show only that
              department's active OPD queue.
            </p>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {loadingDepartments ? (
              <div className="mt-6 text-sm font-semibold text-slate-500">Loading departments…</div>
            ) : departments.length === 0 ? (
              <div className="mt-6 text-sm font-semibold text-slate-500">No active departments found.</div>
            ) : (
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {departments.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDesk(item.id)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 text-left transition hover:border-[#0b63ce] hover:bg-blue-50 hover:shadow-md"
                  >
                    <p className="text-base font-black text-[#082b61]">{item.name}</p>
                    {item.code && (
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                        {item.code}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="mt-6 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="font-black text-[#082b61]">Today's {department?.name || "Department"} Patients</h2>
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  Only this department's WAITING and IN_CONSULTATION patients are shown.
                </p>
              </div>
              {department && (
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#0b63ce]">
                  {department.code || department.name}
                </span>
              )}
            </div>

            {error && (
              <div className="m-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="p-6 text-sm font-semibold text-slate-500">Loading queue…</div>
            ) : visits.length === 0 ? (
              <div className="p-8 text-center text-sm font-semibold text-slate-500">
                No patients are currently waiting in this department.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {visits.map((visit) => (
                  <div
                    key={visit.id}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-lg font-black text-[#0b63ce]">
                        {visit.tokenNumber}
                      </div>

                      <div>
                        <p className="font-black text-[#082b61]">
                          {visit.patient.firstName} {visit.patient.lastName}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {visit.patient.patientId} · {visit.visitType}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/patients/profile/${visit.patient.id}/encounters/new?opdVisitId=${visit.id}`
                        )
                      }
                      className="rounded-xl bg-[#0b63ce] px-5 py-3 text-sm font-black text-white"
                    >
                      Open Patient
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
