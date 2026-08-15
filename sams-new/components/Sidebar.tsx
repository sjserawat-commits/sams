import Image from "next/image";
import Link from "next/link";

const clinicalItems = [
  { href: "/dashboard", label: "Dashboard", icon: "⌂" },
  { href: "/patients", label: "Patient Directory", icon: "♙" },
  { href: "/investigations", label: "Investigation", icon: "⌁" },
  { href: "/billing", label: "Billing", icon: "₹" },
];

const receptionItems = [
  { href: "/patients/new", label: "Patient Registration", icon: "＋" },
  { href: "/patients/list", label: "Patient Registry", icon: "♙" },
  { href: "/appointments", label: "Appointments", icon: "▣" },
  { href: "/opd", label: "OPD Registration", icon: "⌁" },
  { href: "/patient-search", label: "Slip Printing", icon: "▤" },
];

function NavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link href={href} className="group flex items-center gap-3 rounded-xl border border-transparent px-3.5 py-3 text-sm font-bold text-slate-600 transition hover:border-blue-100 hover:bg-blue-50 hover:text-[#0b63ce]">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-sm font-black text-[#082b61] transition group-hover:bg-white group-hover:text-[#0b63ce]">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[250px] shrink-0 flex-col overflow-y-auto border-r border-slate-200/80 bg-white/95 px-4 py-5 shadow-[8px_0_30px_rgba(8,43,97,0.04)] lg:flex">
      <Link href="/" className="mb-8 flex items-center gap-3 rounded-2xl px-2 py-2">
        <Image src="/serawat-logo.png" alt="SAMS" width={62} height={42} className="h-11 w-auto object-contain" priority />
        <span>
          <span className="block text-lg font-black tracking-tight text-[#082b61]">SAMS</span>
          <span className="block max-w-[165px] text-[8px] font-bold uppercase leading-3 tracking-[0.12em] text-slate-400">Serawat Advanced Musculoskeletal, Joint & Spine Centre</span>
        </span>
      </Link>

      <div className="mb-3 px-2 text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Reception / Front Desk</div>
      <nav className="space-y-1.5">
        <NavItem href="/reception" label="Reception" icon="⌂" />
        {receptionItems.map((item) => <NavItem key={item.href + item.label} {...item} />)}
      </nav>

      <div className="mb-3 mt-7 px-2 text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Clinical workspace</div>
      <nav className="space-y-1.5">
        {clinicalItems.map((item) => <NavItem key={item.href} {...item} />)}
      </nav>

      <div className="mt-auto pt-6">
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-[#082b61] to-[#0b63ce] p-4 text-white shadow-[0_12px_30px_rgba(8,43,97,0.15)]">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-200">SAMS</p>
          <p className="mt-1 text-sm font-black">Clinical Operations</p>
          <p className="mt-1 text-[11px] leading-4 text-blue-100">Reception, patient flow, visits, investigations and billing in one workspace.</p>
        </div>
      </div>
    </aside>
  );
}
