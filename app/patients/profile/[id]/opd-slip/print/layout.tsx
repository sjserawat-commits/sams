"use client";

import { useParams, useRouter } from "next/navigation";

export default function OPDSlipPrintLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const patientId = String(params.id);

  return (
    <>
      <div className="opd-print-toolbar no-print">
        <div className="opd-print-toolbar-inner">
          <div className="opd-print-toolbar-title">SAMS · OPD Slip</div>
          <div className="opd-print-toolbar-actions">
            <button type="button" onClick={() => window.print()}>Print OPD Slip</button>
            <button type="button" onClick={() => router.push("/opd")}>Open OPD Queue</button>
            <button type="button" onClick={() => router.push(`/patients/profile/${patientId}`)}>Back to Patient Profile</button>
          </div>
        </div>
      </div>
      {children}
      <style jsx global>{`
        .opd-print-toolbar{position:fixed;left:0;right:0;top:0;z-index:99999;padding:10px 14px;background:rgba(7,31,66,.96);border-bottom:1px solid rgba(214,164,67,.45);box-shadow:0 8px 24px rgba(0,0,0,.18);font-family:Arial,Helvetica,sans-serif}
        .opd-print-toolbar-inner{max-width:1180px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:12px}
        .opd-print-toolbar-title{font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#f4d58c}
        .opd-print-toolbar-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:7px}
        .opd-print-toolbar button{border:1px solid rgba(255,255,255,.16);border-radius:9px;padding:8px 11px;background:rgba(255,255,255,.08);color:#fff;font-size:10px;font-weight:900;cursor:pointer}
        .opd-print-toolbar button:first-child{background:#d6a443;color:#071525;border-color:#d6a443}
        .opd-print-toolbar button:hover{filter:brightness(1.08)}
        @media screen{.opd-print-toolbar + .a4{margin-top:64px!important}}
        @media print{.no-print{display:none!important}.opd-print-toolbar + .a4{margin-top:0!important}}
      `}</style>
    </>
  );
}
