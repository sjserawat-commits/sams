import Image from "next/image";
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="border-r border-slate-200 bg-white px-4 py-5">
      <Link href="/" className="mb-7 flex items-center gap-3 px-2">
        <Image src="/serawat-logo.png" alt="SAMS" width={62} height={42} className="h-11 w-auto object-contain" priority />
        <span><span className="block text-lg font-black tracking-tight text-[#082b61]">SAMS</span><span className="block max-w-[180px] text-[8px] font-bold uppercase tracking-[0.12em] leading-3 text-slate-400">Serawat Advanced Musculoskeletal, Joint & Spine Centre</span></span>
      </Link>
      <nav>
        <ul className="space-y-1">
          <li><Link className="block rounded-xl px-3 py-2.5 hover:bg-blue-50" href="/dashboard">Dashboard</Link></li>
          <li><Link className="block rounded-xl px-3 py-2.5 hover:bg-blue-50" href="/patients">Patients</Link></li>
          <li><Link className="block rounded-xl px-3 py-2.5 hover:bg-blue-50" href="/appointments">Appointments</Link></li>
          <li><Link className="block rounded-xl px-3 py-2.5 hover:bg-blue-50" href="/clinical">Clinical</Link></li>
          <li><Link className="block rounded-xl px-3 py-2.5 hover:bg-blue-50" href="/billing">Billing</Link></li>
          <li><Link className="block rounded-xl px-3 py-2.5 hover:bg-blue-50" href="/analytics">Analytics</Link></li>
          <li><Link className="block rounded-xl px-3 py-2.5 hover:bg-blue-50" href="/settings">Settings</Link></li>
        </ul>
      </nav>
    </aside>
  );
}
