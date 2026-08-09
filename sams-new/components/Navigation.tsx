"use client";

import Link from "next/link";

export default function Navigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
      {" | "}
      <Link href="/dashboard">Dashboard</Link>
      {" | "}
      <Link href="/patients">Patients</Link>
    </nav>
  );
}
