"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage(){
  const r=useRouter();
  const [key,setKey]=useState("");
  const [u,setU]=useState("admin");
  const [name,setName]=useState("SAMS Administrator");
  const [p,setP]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);

  async function submit(e:FormEvent){
    e.preventDefault();
    setBusy(true);
    setError("");
    try{
      const x=await fetch("/api/auth/setup",{
        method:"POST",
        headers:{"Content-Type":"application/json","Accept":"application/json"},
        body:JSON.stringify({setupKey:key,username:u,displayName:name,password:p}),
        cache:"no-store",
      });
      const text=await x.text();
      let d:{error?:string;message?:string}={};
      if(text.trim()){
        try{ d=JSON.parse(text); }catch{ throw new Error(`Setup server returned an invalid response (HTTP ${x.status}). Check the Codespaces terminal.`); }
      }
      if(!x.ok) throw new Error(d.error || `Setup failed (HTTP ${x.status}).`);
      r.replace("/login");
    }catch(e){
      setError(e instanceof Error?e.message:"Setup failed");
    }finally{
      setBusy(false);
    }
  }

  return <main className="min-h-screen bg-[#f8f4ea] grid place-items-center p-5"><form onSubmit={submit} className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl border border-[#eadfca]"><p className="text-[10px] font-black tracking-[.3em] text-[#0d5b4c]">SAMS · FIRST RUN</p><h1 className="mt-2 text-3xl font-black text-[#0b2748]">Create Administrator</h1><p className="mt-1 text-sm text-slate-500">Requires the server-side SAMS_SETUP_KEY.</p><div className="mt-6 space-y-3"><input required value={key} onChange={e=>setKey(e.target.value)} type="password" placeholder="Setup key" className="w-full rounded-xl border p-3"/><input required value={name} onChange={e=>setName(e.target.value)} placeholder="Display name" className="w-full rounded-xl border p-3"/><input required value={u} onChange={e=>setU(e.target.value)} placeholder="Username" className="w-full rounded-xl border p-3"/><input required minLength={12} value={p} onChange={e=>setP(e.target.value)} type="password" placeholder="Password (12+ characters)" className="w-full rounded-xl border p-3"/>{error&&<p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}<button disabled={busy} className="w-full rounded-xl bg-[#0d5b4c] p-3 font-black text-white">{busy?"Creating…":"Create administrator"}</button></div></form></main>
}
