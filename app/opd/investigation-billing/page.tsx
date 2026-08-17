"use client";

import { useEffect, useState } from "react";

type Order = {
  id: number;
  investigation: string;
  price: number;
  discountType?: string | null;
  discountValue: number;
  netAmount: number;
  paymentStatus: string;
  status: string;
};

export default function InvestigationBillingPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/opd/investigation-billing")
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const total = orders.reduce((sum, item) => sum + item.price, 0);
  const discount = orders.reduce((sum, item) => {
    if (item.discountType === "PERCENT") {
      return sum + (item.price * item.discountValue) / 100;
    }
    return sum + item.discountValue;
  }, 0);

  const net = orders.reduce((sum, item) => sum + item.netAmount, 0);

  return (
    <main className="min-h-screen bg-[#f5f8fc] px-5 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[2rem] bg-gradient-to-br from-[#0b63ce] to-[#082b61] p-7 text-white shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">
            SAMS · BILLING
          </p>
          <h1 className="mt-2 text-3xl font-black">
            Investigation Billing
          </h1>
          <p className="mt-2 text-sm text-blue-100">
            Review investigation charges and authorized discounts.
          </p>
        </section>

        <section className="mt-6 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-6 text-sm font-semibold text-slate-500">
              Loading billing…
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-sm font-semibold text-slate-500">
              No investigation orders found.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Investigation</th>
                      <th className="px-5 py-4">Price</th>
                      <th className="px-5 py-4">Discount</th>
                      <th className="px-5 py-4">Net Amount</th>
                      <th className="px-5 py-4">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-5 py-4 font-bold text-[#082b61]">
                          {order.investigation}
                        </td>
                        <td className="px-5 py-4">₹{order.price.toFixed(2)}</td>
                        <td className="px-5 py-4">
                          {order.discountValue > 0
                            ? `${order.discountValue}${order.discountType === "PERCENT" ? "%" : " ₹"}`
                            : "—"}
                        </td>
                        <td className="px-5 py-4 font-black">
                          ₹{order.netAmount.toFixed(2)}
                        </td>
                        <td className="px-5 py-4 font-bold">
                          {order.paymentStatus}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-200 bg-slate-50 p-6">
                <div className="ml-auto max-w-sm space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>₹{discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3 text-lg font-black text-[#082b61]">
                    <span>Net Payable</span>
                    <span>₹{net.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
