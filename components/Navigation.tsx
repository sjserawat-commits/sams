"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
type NavigationProps={variant?:"default"|"reception"|"registry"};
type CurrentUser={id:number;username:string;displayName:string;role:string;departmentId?:string|null;doctorId?:string|null};
export default function Navigation({variant="default"}:NavigationProps){
  const isPatientRegistry=variant==="registry";
  const [user,setUser]=useState<CurrentUser|null>(null);
  const [menuOpen,setMenuOpen]=useState(false);
  const [loggingOut,setLoggingOut]=useState(false);
  useEffect(()=>{fetch("/api/auth/me",{cache:"no-store"}).then(async r=>{if(r.ok){const d=await r.json();setUser(d.user)}}).catch(()=>{});},[]);
  async function logout(){setLoggingOut(true);try{await fetch("/api/auth/logout",{method:"POST"})}finally{window.location.href="/login"}}
  const initials=(user?.displayName||user?.username||"U").split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();
  return <nav className="sticky top-0 z-30 flex min-h-[76px] flex-wrap items-center gap-2 border-b border-[#d6a443]/20 bg-[linear-gradient(90deg,#061525_0%,#0a2138_55%,#071525_100%)] px-5 py-3 text-slate-200 shadow-[0_8px_28px_rgba(0,0,0,0.22)] sm:px-6">
    <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-[#082b61] via-[#d6a443] to-[#f2d38b]"/>
    <Link href="/" className="mr-3 flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-white/5"><div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#d6a443]/30 bg-white/95 p-1 shadow-lg"><Image src="/serawat-logo.png" alt="Serawat Advanced Musculoskeletal, Joint & Spine Centre" width={52} height={32} className="h-9 w-auto object-contain" priority/></div><span className="hidden text-left sm:block"><span className="block text-lg font-black tracking-tight text-[#f2d38b]">SAMS</span><span className="block max-w-[300px] text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Serawat Advanced Multispeciality Joint &amp; Spine Centre</span></span></Link>
    <div className="ml-auto flex flex-wrap items-center gap-1">
      <Link href="/" className="rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-300">Home</Link>
      <Link href="/dashboard" className="rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-300">Dashboard</Link>
      {isPatientRegistry&&<><Link href="/reception" className="rounded-xl border border-[#d6a443]/35 bg-[#d6a443]/10 px-3 py-2 text-xs font-black text-[#f2d38b]">Reception</Link><Link href="/patients/new" className="rounded-xl border border-[#d6a443]/70 bg-[#d6a443] px-3 py-2 text-xs font-black text-[#071525]">+ Patient Registration</Link></>}
      {variant!=="reception"&&!isPatientRegistry&&<><Link href="/billing" className="rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-300">Billing</Link><Link href="/reports" className="rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-300">Reports</Link>{user&&(user.role==="ADMIN"||user.role==="SUPER_ADMIN")&&<Link href="/admin" className="rounded-xl border border-[#d6a443]/30 bg-[#d6a443]/10 px-3 py-2 text-xs font-black uppercase tracking-wide text-[#f2d38b]">Admin</Link>}</>}
      {user&&<div className="relative ml-2"><button type="button" onClick={()=>setMenuOpen(v=>!v)} aria-expanded={menuOpen} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.06] px-2.5 py-1.5 transition hover:bg-white/[.1]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c9a85c] text-[10px] font-black text-[#10151d]">{initials}</span><span className="hidden text-left sm:block"><span className="block max-w-[130px] truncate text-[10px] font-black text-white">{user.displayName||user.username}</span><span className="block text-[8px] font-bold uppercase tracking-wider text-[#d9bb72]">{user.role}</span></span><span className="text-[10px] text-slate-400">⌄</span></button>{menuOpen&&<div className="absolute right-0 top-[calc(100%+8px)] w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1420] p-2 shadow-2xl"><div className="border-b border-white/10 px-3 py-3"><p className="text-[9px] font-black uppercase tracking-[.2em] text-slate-500">Signed in as</p><p className="mt-1 text-sm font-black text-white">{user.displayName}</p><p className="mt-0.5 text-[10px] text-slate-400">@{user.username} · {user.role}</p></div><button type="button" onClick={()=>void logout()} disabled={loggingOut} className="mt-2 flex w-full items-center justify-between rounded-xl bg-red-400/10 px-3 py-2.5 text-left text-xs font-black text-red-200 hover:bg-red-400/15">{loggingOut?"Signing out…":"Log out this workstation"}<span>↪</span></button></div>}</div>}
    </div>
  </nav>
}
