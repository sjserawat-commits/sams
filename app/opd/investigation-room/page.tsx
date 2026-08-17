"use client";

import { useEffect, useState } from "react";

type Order = {
  id: number;
  investigation: string;
  price: number;
  paymentStatus: string;
  status: string;
  opdVisit: {
    tokenNumber: number;
    patient: {
      firstName: string;
      lastName: string;
      patientId: string;
    };
  };
};

export default function InvestigationRoomPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [reportText, setReportText] = useState("");

  useEffect(() => {
    fetch("/api/opd/investigation-room")
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  async function saveReport(id: number) {
    if (!reportText.trim()) return;

    await fetch("/api/opd/investigation-room/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, reportText }),
    });

    setOrders((current) => current.filter((item) => item.id !== id));
    setOpenId(null);
    setReportText("");
  }

  return (
    <main className="min-h-screen bg-[#f5f8fc] px-5 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[2rem] bg-gradient-to-br from-[#0b63ce] to-[#082b61] p-7 text-white shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">
            SAMS · INVESTIGATION
          </p>
          <h1 className="mt-2 text-3xl font-black">
            Investigation Room
          </h1>
          <p className="mt-2 text-sm text-blue-100">
            Investigation orders waiting to be performed.
          </p>
        </section>

        <section className="mt-6 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-6 text-sm font-semibold text-slate-500">
              Loading orders…
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-sm font-semibold text-slate-500">
              No investigation orders waiting.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-black text-[#082b61]">
                      Token {order.opdVisit.tokenNumber} ·{" "}
                      {order.investigation}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {order.opdVisit.patient.firstName}{" "}
                      {order.opdVisit.patient.lastName} ·{" "}
                      {order.opdVisit.patient.patientId}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black">
                      {order.paymentStatus}
                    </span>
                    <button
                      onClick={() => {
                        setOpenId(order.id);
                        setReportText("");
                      }}
                      className="rounded-xl bg-[#0b63ce] px-5 py-3 text-sm font-black text-white"
                    >
                      Open
                    </button>

                    {openId === order.id && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">
                        <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
                          <h2 className="text-xl font-black text-[#082b61]">
                            Investigation Report
                          </h2>

                          <textarea
                            value={reportText}
                            onChange={(e) => setReportText(e.target.value)}
                            placeholder="Enter investigation report"
                            className="mt-4 min-h-40 w-full rounded-xl border border-slate-200 p-4"
                          />

                          <div className="mt-4 flex gap-3">
                            <button
                              onClick={() => saveReport(order.id)}
                              className="rounded-xl bg-[#0b63ce] px-5 py-3 text-sm font-black text-white"
                            >
                              Save Report
                            </button>

                            <button
                              onClick={() => setOpenId(null)}
                              className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-black"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
