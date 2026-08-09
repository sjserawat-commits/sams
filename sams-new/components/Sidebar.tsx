import Link from "next/link";

export default function Sidebar() {
  return (
    <aside>
      <h2>SAMS</h2>
      <nav>
        <ul>
          <li><Link href="/dashboard">Dashboard</Link></li>
          <li><Link href="/patients">Patients</Link></li>
          <li><Link href="/appointments">Appointments</Link></li>
          <li><Link href="/clinical">Clinical</Link></li>
          <li><Link href="/billing">Billing</Link></li>
          <li><Link href="/analytics">Analytics</Link></li>
          <li><Link href="/settings">Settings</Link></li>
        </ul>
      </nav>
    </aside>
  );
}
