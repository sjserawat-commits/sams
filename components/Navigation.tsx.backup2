"use client";

import Image from "next/image";
import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-5 py-3 shadow-sm sm:px-6">
      <Link href="/" className="mr-3 flex items-center gap-3">
        <Image src="/serawat-logo.png" alt="Serawat Advanced Musculoskeletal, Joint & Spine Centre" width={52} height={32} className="h-9 w-auto object-contain" priority />
        <span className="hidden text-left sm:block"><span className="block text-lg font-black tracking-tight text-[#082b61]">SAMS</span><span className="block max-w-[270px] text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Serawat Advanced Musculoskeletal, Joint & Spine Centre</span></span>
      </Link>
      <Link href="/" className="rounded px-3 py-2 hover:bg-blue-50">Home</Link>
      <Link href="/patients" className="rounded px-3 py-2 hover:bg-blue-50">Patients</Link>
      <Link href="/clinical" className="rounded px-3 py-2 hover:bg-blue-50">Clinical</Link>
      <Link href="/pmr" className="rounded px-3 py-2 hover:bg-blue-50">PM&R</Link>
      <Link href="/billing" className="rounded px-3 py-2 hover:bg-blue-50">Billing</Link>
      <Link href="/reports" className="rounded px-3 py-2 hover:bg-blue-50">Reports</Link>
      <Link href="/portal" className="rounded px-3 py-2 hover:bg-blue-50">Patient Portal</Link>
    </nav>
  );
}
