"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const KEY = "sams-lab-room-settings-requester";

function getRequesterKey() {
  const existing = window.sessionStorage.getItem(KEY);
  if (existing) return existing;
  const key = `${crypto.randomUUID()}-${Date.now()}`;
  window.sessionStorage.setItem(KEY, key);
  return key;
}

export default function LabRoomSettingsPage() {
  const [requesterKey, setRequesterKey] = useState("");
  const [requestId, setRequestId] = useState<number | null>(null);
  const [status, setStatus] = useState("IDLE");
  const [error, setError] = useState("");

  useEffect(() => {
    const key = getRequesterKey();
    setRequesterKey(key);
    const saved = window.sessionStorage.getItem("sams-lab-room-settings-request-id");
    if (saved) setRequestId(Number(saved));
  }, []);

  const canCheck = useMemo(() => Boolean(requestId && requesterKey), [requestId, requesterKey]);

  async function requestAccess() {
    if (!requesterKey) return;
    setError("");
    const response = await fetch("/api/investigation-master/access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requesterKey }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Unable to send request."); return; }
    setRequestId(data.requestId);
    setStatus(data.status || "PENDING");
    window.sessionStorage.setItem("sams-lab-room-settings-request-id", String(data.requestId));
  }

  async function checkStatus() {
    if (!canCheck) return;
    setError("");
    const response = await fetch(`/api/investigation-master/access?requestId=${requestId}&requesterKey=${encodeURIComponent(requesterKey)}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Unable to check request status."); return; }
    setStatus(data.status);
    if (data.status === "APPROVED") {
      window.location.href = `/investigation-master?accessRequest=${requestId}&requesterKey=${encodeURIComponent(requesterKey)}`;
    }
  }

  useEffect(() => {
    if (!canCheck || status === "APPROVED" || status === "REJECTED") return;
    const timer = window.setInterval(checkStatus, 5000);
    return () => window.clearInterval(timer);
  }, [canCheck, status, requestId, requesterKey]);

  return <main className="min-h-screen bg-[#FDC823] px-5 py-7 text-[#061a38] sm:px-8"><div className="mx-auto max-w-3xl"><header className="rounded-[1.8rem] bg-[#031a38] p-6 text-white shadow-2xl"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-[.28em] text-[#f4d87b]">SAMS · Laboratory</p><h1 className="mt-2 text-2xl font-black">Investigation Master Settings</h1><p className="mt-2 text-sm text-blue-100">Restricted from the Lab Room. Administrator approval is required before the Investigation Master opens.</p></div><Link href="/investigation-room" className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-black text-white">← Lab Room</Link></div></header><section className="mt-6 rounded-[1.8rem] border border-[#d8b43e] bg-[#fff8df] p-7 shadow-xl"><div className="rounded-2xl border border-[#d8b43e]/60 bg-white p-5"><p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Requested scope</p><h2 className="mt-2 text-xl font-black text-[#082b61]">Investigation Master data only</h2><p className="mt-2 text-sm leading-6 text-slate-600">This request does not open Hospital Settings, User Management, Security or other system configuration. After approval, only the Investigation Master page becomes available.</p></div><div className="mt-5 flex flex-wrap items-center gap-3"><button onClick={requestAccess} disabled={!requesterKey || status === "PENDING"} className="rounded-xl bg-[#082b61] px-5 py-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50">{status === "PENDING" ? "Approval Pending…" : "Request Admin Approval"}</button><button onClick={checkStatus} disabled={!canCheck} className="rounded-xl border border-[#082b61]/20 bg-white px-5 py-3 text-xs font-black text-[#082b61] disabled:opacity-50">↻ Check Approval</button><span className={`rounded-full px-3 py-2 text-[9px] font-black uppercase tracking-wider ${status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : status === "REJECTED" ? "bg-red-100 text-red-700" : status === "PENDING" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500"}`}>{status === "IDLE" ? "Not requested" : status}</span></div>{requestId && <p className="mt-4 text-[10px] font-semibold text-slate-500">Request #{requestId} · Lab Room access session</p>}{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}</section></div></main>;
}
