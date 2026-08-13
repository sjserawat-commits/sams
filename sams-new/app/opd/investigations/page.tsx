"use client";

import { useState } from "react";

const investigations = [
  { name: "CBC", price: 300 },
  { name: "HbA1c", price: 450 },
  { name: "LFT", price: 600 },
  { name: "KFT", price: 600 },
  { name: "X-Ray Chest", price: 500 },
  { name: "Ultrasound", price: 800 },
  { name: "CT Scan", price: 2500 },
  { name: "MRI", price: 5000 },
];

export default function InvestigationOrderPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [discountType, setDiscountType] = useState("PERCENT");
  const [discountValue, setDiscountValue] = useState("");

  const selectedItems = investigations.filter((item) =>
    selected.includes(item.name)
  );

  const total = selectedItems.reduce((sum, item) => sum + item.price, 0);

  const discount =
    discountType === "PERCENT"
      ? (total * Number(discountValue || 0)) / 100
      : Number(discountValue || 0);

  const net = Math.max(0, total - discount);

  return (
    <main className="min-h-screen bg-[#f5f8fc] px-5 py-8 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[2rem] bg-gradient-to-br from-[#0b63ce] to-[#082b61] p-7 text-white shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">
            SAMS · CLINICAL
          </p>
          <h1 className="mt-2 text-3xl font-black">
            Investigation Orders
          </h1>
          <p className="mt-2 text-sm text-blue-100">
            Select investigations required for this OPD consultation.
          </p>
        </section>

        <section className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-black text-[#082b61]">
            Available Investigations
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {investigations.map((item) => (
              <label
                key={item.name}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4"
              >
                <span className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(item.name)}
                    onChange={() =>
                      setSelected((current) =>
                        current.includes(item.name)
                          ? current.filter((name) => name !== item.name)
                          : [...current, item.name]
                      )
                    }
                  />
                  <span className="font-bold">{item.name}</span>
                </span>

                <span className="font-black text-[#0b63ce]">
                  ₹{item.price}
                </span>
              </label>
            ))}
          </div>
        </section>

        {selectedItems.length > 0 && (
          <section className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-black text-[#082b61]">
              Doctor Authorized Discount
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              This discount section is intended for the authorized doctor
              workflow.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <option value="PERCENT">Percentage (%)</option>
                <option value="AMOUNT">Fixed Amount (₹)</option>
              </select>

              <input
                type="number"
                min="0"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="Discount"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              />
            </div>

            <div className="mt-6 space-y-2 border-t pt-5 text-sm">
              <div className="flex justify-between">
                <span>Total Investigation Charges</span>
                <strong>₹{total.toFixed(2)}</strong>
              </div>

              <div className="flex justify-between">
                <span>Discount</span>
                <strong>₹{discount.toFixed(2)}</strong>
              </div>

              <div className="flex justify-between pt-3 text-lg font-black text-[#082b61]">
                <span>Net Investigation Bill</span>
                <span>₹{net.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              className="mt-6 w-full rounded-xl bg-[#0b63ce] px-6 py-3 text-sm font-black text-white"
            >
              Save Investigation Orders
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
