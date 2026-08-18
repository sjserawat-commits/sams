"use client";

import Image from "next/image";
import Link from "next/link";

type NavigationProps = { variant?: "default" | "reception" | "registry" };

export default function Navigation({ variant = "default" }: NavigationProps) {
  const isPatientRegistry = variant === "registry";

  return (
    <nav className="sticky top-0 z-30 flex min-h-[76px] flex-wrap items-center gap-2 border-b border-[#d6a443]/20 bg-[linear-gradient(90deg,#061525_0%,#0a2138_55%,#071525_100%)] px-5 py-3 text-slate-200 shadow-[0_8px_28px_rgba(0,0,0,0.22)] sm:px-6">
      <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-[#082b61] via-[#d6a443] to-[#f2d38b]" />
      <Link href="/" className="mr-3 flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-white/5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#d6a443]/30 bg-white/95 p-1 shadow-lg"><Image src="/serawat-logo.png" alt="Serawat Advanced Musculoskeletal, Joint & Spine Centre" width={52} height={32} className="h-9 w-auto object-contain" priority /></div>
        <span className="hidden text-left sm:block"><span className="block text-lg font-black tracking-tight text-[#f2d38b]">SAMS</span><span className="block max-w-[300px] text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Serawat Advanced Multispeciality Joint &amp; Spine Centre</span></span>
      </Link>
      <div className="ml-auto flex flex-wrap items-center gap-1">
        {isPatientRegistry && <>
          <Link href="/dashboard" className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-black text-slate-300 transition hover:border-[#d6a443]/40 hover:bg-white/[0.08] hover:text-[#f2d38b] sm:px-4">← Dashboard</Link>
          <Link href="/reception" className="rounded-xl border border-[#d6a443]/35 bg-[#d6a443]/10 px-3 py-2 text-xs font-black text-[#f2d38b] transition hover:bg-[#d6a443]/20 sm:px-4">Reception</Link>
          <Link href="/patients/new" className="rounded-xl border border-[#d6a443]/70 bg-[#d6a443] px-3 py-2 text-xs font-black text-[#071525] transition hover:bg-[#f2d58b] sm:px-4">+ Patient Registration</Link>
        </>}
        {variant !== "reception" && !isPatientRegistry && <>
          <Link href="/billing" className="rounded-xl border border-transparent px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-300 transition hover:border-[#d6a443]/25 hover:bg-white/5 hover:text-[#f2d38b]">Billing</Link>
          <Link href="/reports" className="rounded-xl border border-transparent px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-300 transition hover:border-[#d6a443]/25 hover:bg-white/5 hover:text-[#f2d38b]">Reports</Link>
        </>}
      </div>
    </nav>
  );
}
