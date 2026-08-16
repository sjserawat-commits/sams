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
    <Link href={href} className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-bold text-slate-300 transition-all hover:border-[#d6a443]/30 hover:bg-white/5 hover:text-[#f2d38b]">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#071525] text-sm font-black text-[#d6a443] transition group-hover:border-[#d6a443]/40 group-hover:bg-[#102943] group-hover:text-[#f2d38b]">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[270px] shrink-0 flex-col overflow-y-auto border-r border-[#d6a443]/20 bg-[linear-gradient(180deg,#061525_0%,#0a1d31_48%,#071525_100%)] px-4 py-5 shadow-[12px_0_40px_rgba(0,0,0,0.28)] lg:flex">
      <div className="relative mb-5 overflow-hidden rounded-[1.25rem] border border-[#d6a443]/35 bg-[linear-gradient(135deg,#0b3158,#071b30)] p-4 text-white shadow-[0_16px_35px_rgba(0,0,0,0.25)]">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#d6a443]/10 blur-2xl" />
        <Link href="/" className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#d6a443]/35 bg-white/95 p-1 shadow-lg">
            <Image src="/serawat-logo.png" alt="SAMS" width={56} height={38} className="h-10 w-auto object-contain" priority />
          </div>
          <span className="min-w-0">
            <span className="block text-lg font-black tracking-tight text-[#f2d38b]">SAMS</span>
            <span className="block text-[8px] font-bold uppercase leading-3 tracking-[0.11em] text-slate-300">Serawat Advanced Multispeciality Joint & Spine Centre</span>
          </span>
        </Link>
      </div>

      <div className="mb-2 px-2 text-[9px] font-black uppercase tracking-[0.22em] text-[#d6a443]">Quick Access</div>
      <nav className="mb-5 space-y-1">
        <NavItem href="/" label="Home" icon="⌂" />
        <NavItem href="/dashboard" label="Dashboard" icon="▦" />
      </nav>

      <div className="mb-2 px-2 text-[9px] font-black uppercase tracking-[0.22em] text-[#d6a443]">Reception / Front Desk</div>
      <nav className="space-y-1">
        {receptionItems.map((item) => <NavItem key={item.href + item.label} {...item} />)}
      </nav>

      <div className="mb-2 mt-6 px-2 text-[9px] font-black uppercase tracking-[0.22em] text-[#d6a443]">Clinical workspace</div>
      <nav className="space-y-1">
        {clinicalItems.map((item) => <NavItem key={item.href} {...item} />)}
      </nav>

      <div className="mt-auto pt-5">
        <div className="rounded-[1.25rem] border border-[#d6a443]/20 bg-[#071525]/80 p-4 shadow-inner">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#d6a443]">Front Desk</p>
          <p className="mt-1 text-sm font-black text-white">Patient journey starts here</p>
          <p className="mt-1 text-[11px] leading-4 text-slate-400">Registration → OPD → Consultation → Care → Follow-up</p>
        </div>
      </div>
    </aside>
  );
}
