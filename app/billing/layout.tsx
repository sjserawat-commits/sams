"use client";

import { ReactNode, Suspense } from "react";
import { useRouter } from "next/navigation";

export default function BillingLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <div className="billing-shell min-h-screen bg-[#f3f7fc] text-slate-900">
      <style jsx global>{`
        .billing-shell { --billing-navy:#082b61; --billing-blue:#0b63ce; }
        .billing-topbar { box-shadow: 0 10px 30px rgba(8,43,97,.08); }
        .billing-topbar button { transition: transform .18s ease, box-shadow .18s ease, background .18s ease; }
        .billing-topbar button:hover { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(8,43,97,.16); }
        .billing-shell main > div > header { position:relative; border:1px solid rgba(255,255,255,.14); box-shadow:0 22px 50px rgba(8,43,97,.18); }
        .billing-shell main > div > section { box-shadow:0 8px 24px rgba(15,23,42,.055); }
        .billing-shell main > div > section, .billing-shell main > div > nav { border-color:#e2e8f0; }
        @media print { .billing-topbar { display:none !important; } .billing-shell { background:white !important; } }
      `}</style>

      <div className="billing-topbar no-print sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1450px] items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[.25em] text-[#0b63ce]">SAMS · Hospital Finance</p>
            <p className="truncate text-sm font-black text-[#082b61] sm:text-base">Billing Dashboard</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => router.push("/investigations/orders")} className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-black text-[#0b63ce] shadow-sm" aria-label="Open investigations">
              <span className="text-base leading-none">＋</span><span>Investigations</span>
            </button>
            <button type="button" onClick={() => router.back()} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-[#082b61] shadow-sm" aria-label="Go back">
              <span className="text-base leading-none">←</span><span>Back</span>
            </button>
          </div>
        </div>
      </div>

      <div className="billing-dashboard-strip no-print mx-auto max-w-[1450px] px-4 pt-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {["Patient Charges", "Procedure / Surgery", "Invoices", "Payments"].map((item, index) => (
            <div key={item} className="rounded-2xl border border-white bg-white/80 px-3 py-2.5 shadow-sm backdrop-blur">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-xs font-black text-[#0b63ce]">0{index + 1}</span>
                <span className="text-[10px] font-black uppercase tracking-wide text-slate-600 sm:text-xs">{item}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Suspense fallback={<div className="min-h-screen bg-[#f3f7fc]" />}>
        {children}
      </Suspense>
    </div>
  );
}
