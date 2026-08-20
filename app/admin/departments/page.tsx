"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Department = { id: number; name: string; code: string; active: boolean; _count: { doctors: number; opdVisits: number } };

export default function DepartmentMasterPage() {
  const [rows, setRows] = useState<Department[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const r = await fetch("/api/admin/departments", { cache: "no-store" });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Unable to load departments.");
    setRows(d);
  };
  useEffect(() => { void load().catch((e) => setMessage(e.message)); }, []);

  const save = async () => {
    if (!name.trim() || !code.trim()) { setMessage("Department name and code are required."); return; }
    setBusy(true); setMessage("");
    try {
      const r = await fetch("/api/admin/departments", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing ? { id: editing, name, code } : { name, code }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Unable to save department.");
      setName(""); setCode(""); setEditing(null); setMessage(editing ? "Department updated." : "Department created."); await load();
    } catch (e) { setMessage(e instanceof Error ? e.message : "Unable to save department."); }
    finally { setBusy(false); }
  };

  const deactivate = async (id: number) => {
    if (!window.confirm("Deactivate this department? Existing Visits will remain unchanged.")) return;
    setBusy(true); setMessage("");
    try {
      const r = await fetch("/api/admin/departments", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Unable to deactivate department.");
      setMessage("Department deactivated."); await load();
    } catch (e) { setMessage(e instanceof Error ? e.message : "Unable to deactivate department."); }
    finally { setBusy(false); }
  };

  return <main className="min-h-screen bg-[#080d16] px-5 py-8 text-slate-100 sm:px-8 lg:px-10"><div className="mx-auto max-w-6xl">
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[.045] p-5"><div><p className="text-[9px] font-black uppercase tracking-[.28em] text-[#d9bb72]">SAMS · Administration · Master Data</p><h1 className="mt-1 text-2xl font-black">Department Master</h1><p className="mt-1 text-sm text-slate-400">Manage active departments used by Visits and Doctors.</p></div><Link href="/admin" className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-black">← Administration</Link></header>
    <section className="rounded-2xl border border-white/10 bg-white/[.045] p-6"><h2 className="text-lg font-black">{editing ? "Edit Department" : "Add Department"}</h2><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_220px_auto]"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Department name" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none"/><input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="Code e.g. PMR" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm uppercase outline-none"/><button disabled={busy} onClick={()=>void save()} className="rounded-xl bg-[#c9a85c] px-5 py-3 text-xs font-black text-[#080d16]">{busy ? "Saving…" : editing ? "Update" : "Add"}</button></div>{editing&&<button onClick={()=>{setEditing(null);setName("");setCode("");}} className="mt-3 text-xs font-bold text-slate-400">Cancel edit</button>}{message&&<p className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-xs font-semibold text-slate-300">{message}</p>}</section>
    <section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[.045]"><div className="grid grid-cols-[1fr_100px_110px_110px_120px] gap-3 bg-black/20 px-5 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500"><span>Department</span><span>Code</span><span>Doctors</span><span>Visits</span><span>Action</span></div>{rows.map(d=><div key={d.id} className="grid grid-cols-[1fr_100px_110px_110px_120px] items-center gap-3 border-t border-white/10 px-5 py-4"><div><p className="font-black">{d.name}</p><p className="text-[10px] text-slate-500">{d.active ? "Active" : "Inactive"}</p></div><span className="font-mono text-xs text-slate-400">{d.code}</span><span>{d._count.doctors}</span><span>{d._count.opdVisits}</span><div className="flex gap-3 text-xs font-black"><button onClick={()=>{setEditing(d.id);setName(d.name);setCode(d.code)}} className="text-[#d9bb72]">Edit</button>{d.active&&<button onClick={()=>void deactivate(d.id)} className="text-red-400">Deactivate</button>}</div></div>)}{rows.length===0&&<p className="p-8 text-center text-sm text-slate-500">No departments configured.</p>}</section>
  </div></main>;
}
