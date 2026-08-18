"use client";

import Image from "next/image";
import Link from "next/link";

type NavigationProps = { variant?: "default" | "reception" };

export default function Navigation({ variant = "default" }: NavigationProps) {
  return (
    <nav className="sticky top-0 z-30 flex min-h-[76px] flex-wrap items-center gap-2 border-b border-[#d6a443]/20 bg-[linear-gradient(90deg,#061525_0%,#0a2138_55%,#071525_100%)] px-5 py-3 text-slate-200 shadow-[0_8px_28px_rgba(0,0,0,0.22)] sm:px-6">
      <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-[#082b61] via-[#d6a443] to-[#f2d38b]" />
      <Link href="/" className="mr-3 flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-white/5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#d6a443]/30 bg-white/95 p-1 shadow-lg"><Image src="/serawat-logo.png" alt="Serawat Advanced Musculoskeletal, Joint & Spine Centre" width={52} height={32} className="h-9 w-auto object-contain" priority /></div>
        <span className="hidden text-left sm:block"><span className="block text-lg font-black tracking-tight text-[#f2d38b]">SAMS</span><span className="block max-w-[300px] text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Serawat Advanced Multispeciality Joint &amp; Spine Centre</span></span>
      </Link>
      <div className="ml-auto flex flex-wrap items-center gap-1">
        {variant !== "reception" && <><Link href="/" className="rounded-xl border border-transparent px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-300 transition hover:border-[#d6a443]/25 hover:bg-white/5 hover:text-[#f2d38b]">Home</Link><Link href="/dashboard" className="rounded-xl border border-transparent px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-300 transition hover:border-[#d6a443]/25 hover:bg-white/5 hover:text-[#f2d38b]">Dashboard</Link></>}
        {variant !== "reception" && <><Link href="/patients" className="rounded-xl border border-transparent px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-300 transition hover:border-[#d6a443]/25 hover:bg-white/5 hover:text-[#f2d38b]">Patients</Link><Link href="/clinical" className="rounded-xl border border-transparent px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-300 transition hover:border-[#d6a443]/25 hover:bg-white/5 hover:text-[#f2d38b]">Clinical</Link><Link href="/billing" className="rounded-xl border border-transparent px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-300 transition hover:border-[#d6a443]/25 hover:bg-white/5 hover:text-[#f2d38b]">Billing</Link><Link href="/reports" className="rounded-xl border border-transparent px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-300 transition hover:border-[#d6a443]/25 hover:bg-white/5 hover:text-[#f2d38b]">Reports</Link><Link href="/settings" className="rounded-xl border border-[#d6a443]/25 bg-[#d6a443]/10 px-3 py-2 text-xs font-black uppercase tracking-wide text-[#f2d38b] transition hover:bg-[#d6a443]/20">Admin</Link><Link href="/portal" className="rounded-xl border border-[#d6a443]/25 bg-[#d6a443]/10 px-3 py-2 text-xs font-black uppercase tracking-wide text-[#f2d38b] transition hover:bg-[#d6a443]/20">Patient Portal</Link></>}
      </div>
    </nav>
  );
}
