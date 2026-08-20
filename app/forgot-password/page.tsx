"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [recoveryKey, setRecoveryKey] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, recoveryKey, newPassword, confirmPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to reset password.");
      setMessage("Password updated successfully. Redirecting to sign in…");
      setTimeout(() => router.replace("/login"), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f4ea] grid place-items-center p-5">
      <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl border border-[#eadfca]">
        <p className="text-[10px] font-black tracking-[.3em] text-[#0d5b4c]">SAMS · ACCOUNT RECOVERY</p>
        <h1 className="mt-2 text-3xl font-black text-[#0b2748]">Set new password</h1>
        <p className="mt-1 text-sm text-slate-500">Use your administrator recovery key to create a new password.</p>

        <div className="mt-7 space-y-4">
          <input required value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" placeholder="Username" className="w-full rounded-xl border p-3" />
          <input required value={recoveryKey} onChange={e => setRecoveryKey(e.target.value)} type="password" autoComplete="off" placeholder="Recovery key" className="w-full rounded-xl border p-3" />
          <input required minLength={12} value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" autoComplete="new-password" placeholder="New password (minimum 12 characters)" className="w-full rounded-xl border p-3" />
          <input required minLength={12} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" autoComplete="new-password" placeholder="Confirm new password" className="w-full rounded-xl border p-3" />

          {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
          {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{message}</p>}

          <button disabled={busy} className="w-full rounded-xl bg-[#0d5b4c] p-3 font-black text-white disabled:opacity-50">
            {busy ? "Updating password…" : "Set new password"}
          </button>
          <button type="button" onClick={() => router.replace("/login")} className="w-full rounded-xl border border-slate-200 p-3 font-bold text-slate-700">
            Back to sign in
          </button>
        </div>
      </form>
    </main>
  );
}
