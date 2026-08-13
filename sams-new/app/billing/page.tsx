"use client";

import { useMemo, useState } from "react";

type Investigation = { id: number; name: string; amount: number; paymentStatus: string };
type Prescription = { id: number; name: string; quantity: number; unitPrice: number; amount: number; billingStatus: string };
type Bill = {
  id: number;
  billNumber: string;
  receiptNumber: string | null;
  patientId: number;
  opdVisitId: number | null;
  subtotal: number;
  discount: number;
  netAmount: number;
  paymentStatus: string;
  paymentMethod: string | null;
  paidAmount: number;
  balanceAmount: number;
  paidAt: string | null;
};
type BillingData = {
  visit: { id: number; tokenNumber: number; visitType: string; status: string; department: string | null; createdAt: string };
  patient: { id: number; patientId: string; name: string; phone: string | null };
  encounter: { id: number; treatmentPlan: string | null; followUpDate: string | null } | null;
  investigations: Investigation[];
  prescriptions: Prescription[];
  totals: { investigationTotal: number; pharmacyTotal: number; subtotal: number };
  bill: Bill | null;
};
type Tab = "charges" | "invoices" | "payments" | "reports";

const money = (value: number) => `₹${value.toFixed(2)}`;

export default function BillingPage() {
  const [visitId, setVisitId] = useState("");
  const [data, setData] = useState<BillingData | null>(null);
  const [tab, setTab] = useState<Tab>("charges");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadVisit() {
    setLoading(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/billing?visitId=${encodeURIComponent(visitId)}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load billing information.");
      setData(result as BillingData);
      setTab("charges");
    } catch (err) { setData(null); setError(err instanceof Error ? err.message : "Unable to load billing information."); }
    finally { setLoading(false); }
  }

  async function generateBill() {
    if (!data) return;
    setLoading(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/billing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visitId: data.visit.id }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to generate bill.");
      setData({ ...data, bill: result.bill as Bill });
      setMessage(result.existing ? "Existing invoice loaded." : "Invoice generated successfully.");
      setTab("invoices");
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to generate bill."); }
    finally { setLoading(false); }
  }

  async function recordPayment() {
    if (!data?.bill) return;
    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) { setError("Enter a valid payment amount."); return; }
    if (amount > data.bill.balanceAmount) { setError("Payment cannot exceed the outstanding balance."); return; }
    setLoading(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/billing", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ billId: data.bill.id, paidAmount: amount, paymentMethod }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to record payment.");
      setData({ ...data, bill: result.bill as Bill });
      setPaymentAmount(""); setMessage("Payment recorded successfully."); setTab("payments");
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to record payment."); }
    finally { setLoading(false); }
  }

  const outstanding = useMemo(() => data?.bill?.balanceAmount ?? 0, [data]);

  return (
    <main className="min-h-screen bg-[#f5f8fc] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-5 py-6 sm:px-8">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">SAMS · Hospital Finance</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-[#082b61]">Billing & Payments</h1>
          <p className="mt-1 text-sm text-slate-500">Charges, invoices, payments and billing reports for an OPD visit.</p>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] space-y-6 px-5 py-7 sm:px-8">
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input value={visitId} onChange={(e) => setVisitId(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void loadVisit(); }} inputMode="numeric" placeholder="Enter OPD Visit ID" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            <button onClick={() => void loadVisit()} disabled={loading || !visitId.trim()} className="rounded-xl bg-[#0b63ce] px-6 py-3 text-sm font-bold text-white disabled:opacity-50">{loading ? "Loading..." : "Load Patient"}</button>
          </div>
          {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
          {message && <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</p>}
        </section>

        {data && (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <Summary title="Patient" value={data.patient.name} />
              <Summary title="Patient ID" value={data.patient.patientId} />
              <Summary title="OPD Token" value={String(data.visit.tokenNumber)} />
              <Summary title="Outstanding" value={money(outstanding)} />
            </section>

            <nav className="grid gap-2 rounded-2xl border bg-white p-2 shadow-sm sm:grid-cols-4">
              {([ ["charges", "Patient Charges"], ["invoices", "Invoices"], ["payments", "Payments"], ["reports", "Billing Reports"] ] as [Tab, string][]).map(([key, label]) => (
                <button key={key} onClick={() => setTab(key)} className={`rounded-xl px-4 py-3 text-sm font-bold ${tab === key ? "bg-[#0b63ce] text-white" : "text-slate-600 hover:bg-slate-50"}`}>{label}</button>
              ))}
            </nav>

            {tab === "charges" && (
              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-[#082b61]">Patient Charges</h2>
                <div className="mt-5 space-y-3">
                  {data.investigations.map((item) => <Charge key={`i-${item.id}`} name={item.name} detail={`Investigation · ${item.paymentStatus}`} amount={item.amount} />)}
                  {data.prescriptions.map((item) => <Charge key={`p-${item.id}`} name={item.name} detail={`Medicine · ${item.quantity} × ${money(item.unitPrice)}`} amount={item.amount} />)}
                  {data.investigations.length === 0 && data.prescriptions.length === 0 && <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No billable charges found for this OPD visit.</p>}
                </div>
                <div className="mt-6 flex items-center justify-between border-t pt-5"><span className="font-bold text-slate-600">Total</span><span className="text-2xl font-black">{money(data.totals.subtotal)}</span></div>
                <button onClick={() => void generateBill()} disabled={loading || !!data.bill} className="mt-5 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white disabled:opacity-50">{data.bill ? "Invoice Already Generated" : "Generate Invoice"}</button>
              </section>
            )}

            {tab === "invoices" && <InvoiceView bill={data.bill} onGenerate={() => void generateBill()} loading={loading} />}

            {tab === "payments" && (
              <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-[#082b61]">Payments</h2>
                {!data.bill ? <p className="mt-4 text-sm text-slate-500">Generate an invoice before recording a payment.</p> : outstanding <= 0 ? <p className="mt-4 rounded-xl bg-emerald-50 p-4 font-bold text-emerald-700">This invoice is fully paid. Receipt: {data.bill.receiptNumber ?? "—"}</p> : <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                  <input type="number" min="0.01" max={outstanding} step="0.01" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder={`Amount (max ${money(outstanding)})`} className="rounded-xl border px-4 py-3" />
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="rounded-xl border px-4 py-3"><option value="CASH">Cash</option><option value="UPI">UPI</option><option value="CARD">Card</option><option value="BANK_TRANSFER">Bank Transfer</option></select>
                  <button onClick={() => void recordPayment()} disabled={loading} className="rounded-xl bg-[#0b63ce] px-6 py-3 text-sm font-bold text-white disabled:opacity-50">Record Payment</button>
                </div>}
                {data.bill && <div className="mt-6 grid gap-4 sm:grid-cols-3"><Summary title="Net Amount" value={money(data.bill.netAmount)} /><Summary title="Paid" value={money(data.bill.paidAmount)} /><Summary title="Balance" value={money(data.bill.balanceAmount)} /></div>}
              </section>
            )}

            {tab === "reports" && <Reports data={data} />}
          </>
        )}
      </div>
    </main>
  );
}

function Summary({ title, value }: { title: string; value: string }) { return <div className="rounded-xl border bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p><p className="mt-2 truncate font-black text-[#082b61]">{value}</p></div>; }
function Charge({ name, detail, amount }: { name: string; detail: string; amount: number }) { return <div className="flex items-center justify-between border-b border-slate-100 py-3"><div><p className="font-bold text-slate-800">{name}</p><p className="text-xs text-slate-500">{detail}</p></div><p className="font-black">{money(amount)}</p></div>; }
function InvoiceView({ bill, onGenerate, loading }: { bill: Bill | null; onGenerate: () => void; loading: boolean }) { if (!bill) return <section className="rounded-2xl border bg-white p-8 text-center shadow-sm"><h2 className="text-xl font-black text-[#082b61]">No invoice yet</h2><p className="mt-2 text-sm text-slate-500">Generate the invoice from Patient Charges.</p><button onClick={onGenerate} disabled={loading} className="mt-5 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white">Generate Invoice</button></section>; return <section className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Invoice</p><h2 className="mt-1 text-2xl font-black text-[#082b61]">{bill.billNumber}</h2></div><button onClick={() => window.print()} className="rounded-xl border px-5 py-3 text-sm font-bold">Print Invoice / Receipt</button></div><div className="mt-6 grid gap-4 sm:grid-cols-4"><Summary title="Net" value={money(bill.netAmount)} /><Summary title="Paid" value={money(bill.paidAmount)} /><Summary title="Balance" value={money(bill.balanceAmount)} /><Summary title="Status" value={bill.paymentStatus} /></div>{bill.receiptNumber && <div className="mt-6 rounded-xl bg-emerald-50 p-4"><p className="font-black text-emerald-800">Receipt {bill.receiptNumber}</p><p className="mt-1 text-xs text-emerald-700">Payment method: {bill.paymentMethod ?? "—"}</p></div>}</section>; }
function Reports({ data }: { data: BillingData }) { const bill = data.bill; return <section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-[#082b61]">Billing Reports</h2><div className="mt-5 grid gap-4 sm:grid-cols-3"><Summary title="Charge Total" value={money(data.totals.subtotal)} /><Summary title="Invoice Status" value={bill?.paymentStatus ?? "NOT GENERATED"} /><Summary title="Outstanding" value={money(bill?.balanceAmount ?? data.totals.subtotal)} /></div><div className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-600"><p><strong>Patient:</strong> {data.patient.name}</p><p className="mt-1"><strong>OPD Visit:</strong> #{data.visit.id}</p><p className="mt-1"><strong>Invoice:</strong> {bill?.billNumber ?? "Not generated"}</p><p className="mt-1"><strong>Receipt:</strong> {bill?.receiptNumber ?? "Not paid"}</p></div></section>; }
