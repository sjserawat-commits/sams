import Image from "next/image";
import Link from "next/link";

const receptionItems = [
  { href: "/patients/new", label: "Patient Registration", icon: "＋" },
  { href: "/patients/list", label: "Patient Registry", icon: "♙" },
  { href: "/appointments", label: "Appointments", icon: "▣" },
  { href: "/opd", label: "OPD Registration", icon: "⌁" },
  { href: "/patient-search", label: "Slip Printing", icon: "▤" },
];

const clinicalItems = [
  { href: "/patients", label: "Patient Directory", icon: "♙" },
  { href: "/investigations", label: "Investigation", icon: "⌁" },
  { href: "/billing", label: "Billing", icon: "₹" },
];

function NavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link href={href} className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:border-blue-100 hover:bg-blue-50 hover:text-[#0b63ce]">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-sm font-black text-[#082b61] transition group-hover:bg-white group-hover:text-[#0b63ce]">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[270px] shrink-0 flex-col overflow-y-auto border-r border-slate-200/80 bg-white px-4 py-5 shadow-[10px_0_34px_rgba(8,43,97,0.06)] lg:flex">
      <div className="mb-5 rounded-[1.25rem] border border-blue-100 bg-gradient-to-br from-[#061f49] to-[#0b63ce] p-4 text-white shadow-[0_14px_30px_rgba(8,43,97,0.16)]">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/serawat-logo.png" alt="SAMS" width={56} height={38} className="h-10 w-auto object-contain" priority />
          <span className="min-w-0">
            <span className="block text-lg font-black tracking-tight">SAMS</span>
            <span className="block text-[8px] font-bold uppercase leading-3 tracking-[0.11em] text-blue-100">Serawat Advanced Multispecialty Joint & Spine Centre</span>
          </span>
        </Link>
      </div>

      <div className="mb-2 px-2 text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Quick Access</div>
      <nav className="mb-5 space-y-1">
        <NavItem href="/" label="Home" icon="⌂" />
        <NavItem href="/dashboard" label="Dashboard" icon="▦" />
      </nav>

      <div className="mb-2 px-2 text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Reception / Front Desk</div>
      <nav className="space-y-1">
        {receptionItems.map((item) => <NavItem key={item.href + item.label} {...item} />)}
      </nav>

      <div className="mb-2 mt-6 px-2 text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Clinical workspace</div>
      <nav className="space-y-1">
        {clinicalItems.map((item) => <NavItem key={item.href} {...item} />)}
      </nav>

      <div className="mt-auto pt-5">
        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">Front Desk</p>
          <p className="mt-1 text-sm font-black text-[#082b61]">Patient journey starts here</p>
          <p className="mt-1 text-[11px] leading-4 text-slate-500">Registration → OPD → Consultation → Care → Follow-up</p>
        </div>
      </div>
    </aside>
  );
}
