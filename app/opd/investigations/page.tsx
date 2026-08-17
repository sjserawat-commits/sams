"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Investigation = {
  id: number;
  code: string;
  name: string;
  shortName: string | null;
  category: string;
  department: string | null;
  specimen: string | null;
  unit: string | null;
  referenceRange: string | null;
  aliases: string | null;
  rate: number;
  active: boolean;
};

type Order = {
  id: number;
  investigation: string;
  price: number;
  discountType: string | null;
  discountValue: number;
  netAmount: number;
  paymentStatus: string;
  status: string;
};

function InvestigationOrderPageContent() {
  const searchParams = useSearchParams();
  const opdVisitId = Number(searchParams.get("opdVisitId") || 0);

  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [discountType, setDiscountType] = useState("PERCENT");
  const [discountValue, setDiscountValue] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadMaster() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (category) params.set("category", category);
      const response = await fetch(`/api/investigation-master?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to load investigations.");
      setInvestigations(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load investigations.");
    } finally {
      setLoading(false);
    }
  }

  async function loadOrders() {
    if (!opdVisitId) return;
    try {
      const response = await fetch(`/api/opd/investigation-billing?opdVisitId=${opdVisitId}`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data)) setOrders(data);
    } catch {
      // Existing orders are supplementary; do not block catalogue loading.
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(loadMaster, 200);
    return () => window.clearTimeout(timer);
  }, [query, category]);

  useEffect(() => {
    loadOrders();
  }, [opdVisitId]);

  const categories = useMemo(
    () => Array.from(new Set(investigations.map((item) => item.category))).sort(),
    [investigations]
  );

  const selectedItems = investigations.filter((item) => selected.includes(item.id));
  const total = selectedItems.reduce((sum, item) => sum + Number(item.rate || 0), 0);
  const rawDiscount = Number(discountValue || 0);
  const discount =
    discountType === "PERCENT"
      ? Math.min(total, Math.max(0, (total * rawDiscount) / 100))
      : Math.min(total, Math.max(0, rawDiscount));
  const net = Math.max(0, total - discount);

  function toggleSelection(id: number) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
    setMessage("");
    setError("");
  }

  async function saveOrders() {
    setMessage("");
    setError("");

    if (!opdVisitId) {
      setError("This page must be opened from an OPD Visit. No OPD Visit ID was supplied.");
      return;
    }
    if (selectedItems.length === 0) {
      setError("Select at least one investigation.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/opd/investigation-billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opdVisitId,
          investigations: selectedItems.map((item) => ({ investigationId: item.id })),
          discountType,
          discountValue: rawDiscount,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to save investigation orders.");

      setSelected([]);
      setDiscountValue("");
      setMessage(`${data.createdCount} investigation order${data.createdCount === 1 ? "" : "s"} saved successfully.`);
      await loadOrders();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save investigation orders.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f8fc] px-5 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[2rem] bg-gradient-to-br from-[#0b63ce] to-[#082b61] p-7 text-white shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">SAMS · CLINICAL</p>
          <h1 className="mt-2 text-3xl font-black">Investigation Orders</h1>
          <p className="mt-2 text-sm text-blue-100">
            Select investigations from the central Investigation Master for this OPD Visit.
          </p>
          <div className="mt-5 inline-flex rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold">
            {opdVisitId ? `OPD Visit #${opdVisitId}` : "No OPD Visit selected"}
          </div>
        </section>

        {!opdVisitId && (
          <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-800">
            Open this screen from an OPD Visit so the selected investigations can be saved against that Visit.
          </section>
        )}

        {(error || message) && (
          <section
            className={`mt-6 rounded-2xl border p-4 text-sm font-semibold ${
              error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error || message}
          </section>
        )}

        <section className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search CBC, vitamin D, MRI, ECG, code or alias..."
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#0b63ce]"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold"
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <h2 className="font-black text-[#082b61]">Available Investigations</h2>
            <span className="text-xs font-bold text-slate-400">{investigations.length} catalogue entries</span>
          </div>

          {loading ? (
            <div className="mt-6 text-sm font-semibold text-slate-500">Loading Investigation Master…</div>
          ) : investigations.length === 0 ? (
            <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
              No active investigations found.
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {investigations.map((item) => (
                <label
                  key={item.id}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                    selected.includes(item.id)
                      ? "border-[#0b63ce] bg-blue-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-blue-200"
                  }`}
                >
                  <span className="flex min-w-0 items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={selected.includes(item.id)}
                      onChange={() => toggleSelection(item.id)}
                    />
                    <span className="min-w-0">
                      <span className="block font-black text-[#082b61]">{item.name}</span>
                      <span className="mt-1 block text-[10px] font-semibold text-slate-400">
                        {item.shortName || item.code} · {item.category}
                      </span>
                    </span>
                  </span>
                  <span className="ml-3 shrink-0 font-black text-[#0b63ce]">₹{Number(item.rate || 0).toFixed(2)}</span>
                </label>
              ))}
            </div>
          )}
        </section>

        {selectedItems.length > 0 && (
          <section className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-black text-[#082b61]">Doctor Authorized Discount</h2>
            <p className="mt-1 text-xs text-slate-500">Discount is calculated from the selected master rates and validated again by the server.</p>

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
              <div className="flex justify-between"><span>Total Investigation Charges</span><strong>₹{total.toFixed(2)}</strong></div>
              <div className="flex justify-between"><span>Discount</span><strong>₹{discount.toFixed(2)}</strong></div>
              <div className="flex justify-between pt-3 text-lg font-black text-[#082b61]"><span>Net Investigation Bill</span><span>₹{net.toFixed(2)}</span></div>
            </div>

            <button
              type="button"
              disabled={saving || !opdVisitId}
              onClick={saveOrders}
              className="mt-6 w-full rounded-xl bg-[#0b63ce] px-6 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving Investigation Orders…" : "Save Investigation Orders"}
            </button>
          </section>
        )}

        {orders.length > 0 && (
          <section className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-[#082b61]">Saved Investigation Orders</h2>
              <span className="text-xs font-bold text-slate-400">{orders.length} order{orders.length === 1 ? "" : "s"}</span>
            </div>
            <div className="mt-4 divide-y divide-slate-100">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div><p className="font-bold text-slate-800">{order.investigation}</p><p className="text-[10px] font-semibold text-slate-400">{order.status} · {order.paymentStatus}</p></div>
                  <strong className="text-[#082b61]">₹{Number(order.netAmount).toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default function InvestigationOrderPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f5f8fc] px-5 py-8 text-slate-900">
          <div className="mx-auto max-w-6xl rounded-[2rem] bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Loading Investigation Orders…</p>
          </div>
        </main>
      }
    >
      <InvestigationOrderPageContent />
    </Suspense>
  );
}
