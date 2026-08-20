"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const r = useRouter();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const x = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });
      const d = await x.json();
      if (!x.ok) throw new Error(d.error || "Unable to sign in");
      r.replace("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f4ea] grid place-items-center p-5">
      <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl border border-[#eadfca]">
        <p className="text-[10px] font-black tracking-[.3em] text-[#0d5b4c]">SAMS · SECURE ACCESS</p>
        <h1 className="mt-2 text-3xl font-black text-[#0b2748]">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">Authorized staff only.</p>

        <div className="mt-7 space-y-4">
          <input required value={u} onChange={e => setU(e.target.value)} autoComplete="username" placeholder="Username" className="w-full rounded-xl border p-3" />
          <input required value={p} onChange={e => setP(e.target.value)} type="password" autoComplete="current-password" placeholder="Password" className="w-full rounded-xl border p-3" />
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
          <button type="submit" disabled={busy} className="w-full rounded-xl bg-[#0d5b4c] p-3 font-black text-white disabled:opacity-50">
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <a
            href="/forgot-password"
            className="block w-full cursor-pointer text-center text-sm font-bold text-[#0d5b4c] underline underline-offset-4"
          >
            Forgot password? Set a new password
          </a>
        </div>
      </form>
    </main>
  );
}
