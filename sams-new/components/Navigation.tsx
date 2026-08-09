"use client";

import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="flex flex-wrap items-center gap-2 border-b bg-white px-6 py-4 shadow-sm">
      <Link href="/" className="mr-4 text-xl font-bold text-blue-700">
        SAMS
      </Link>

      <Link href="/" className="rounded px-3 py-2 hover:bg-blue-50">
        Home
      </Link>

      <Link href="/patients" className="rounded px-3 py-2 hover:bg-blue-50">
        Patients
      </Link>

      <Link href="/clinical" className="rounded px-3 py-2 hover:bg-blue-50">
        Clinical
      </Link>

      <Link href="/pmr" className="rounded px-3 py-2 hover:bg-blue-50">
        PM&R
      </Link>

      <Link href="/billing" className="rounded px-3 py-2 hover:bg-blue-50">
        Billing
      </Link>

      <Link href="/reports" className="rounded px-3 py-2 hover:bg-blue-50">
        Reports
      </Link>

      <Link href="/portal" className="rounded px-3 py-2 hover:bg-blue-50">
        Patient Portal
      </Link>
    </nav>
  );
}
