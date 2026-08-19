"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Phase2WorkflowNav(){
  const pathname=usePathname();
  const search=useSearchParams();
  const router=useRouter();
  const visitId=search.get("opdVisitId")||search.get("visitId");
  const consultation=pathname?.includes("/patients/profile/")&&pathname?.endsWith("/consultation");
  const investigation=pathname==="/investigations/orders";
  if(!consultation&&!investigation)return null;
  const nextHref=visitId?`/billing?visitId=${encodeURIComponent(visitId)}`:"";
  return <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(15,23,42,.10)] backdrop-blur no-print">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
      <button type="button" onClick={()=>router.back()} className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-black text-slate-700">← Back</button>
      <div className="hidden text-center sm:block"><p className="text-[9px] font-black uppercase tracking-[.18em] text-slate-400">SAMS · Phase 2 Workflow</p><p className="text-xs font-bold text-slate-700">{consultation?"Consultation → Billing":"Investigation Order → Billing"}</p></div>
      {nextHref?<button type="button" onClick={()=>router.push(nextHref)} className="rounded-xl bg-[#082b61] px-5 py-3 text-xs font-black text-white">Next: Billing →</button>:<span className="rounded-xl bg-slate-100 px-5 py-3 text-xs font-black text-slate-400">Complete Visit first</span>}
    </div>
  </div>;
}
