import Link from "next/link";

const modules = [
  { title: "Doctors / Experts", status: "FUNCTIONAL", href: "/admin/experts", text: "Create, edit, photograph and remove public expert profiles." },
  { title: "Departments", status: "FUNCTIONAL", href: "/admin/departments", text: "Create, edit and safely deactivate departments used by Visits and Doctors." },
  { title: "Investigation Master", status: "FUNCTIONAL", href: "/investigation-master", text: "Maintain diagnostic catalogue, reference values and billing rates." },
  { title: "Master Approvals", status: "FUNCTIONAL", href: "/admin/investigation-master-approvals", text: "Review proposed Investigation Master changes before activation." },
  { title: "Billing Controls", status: "FUNCTIONAL", href: "/admin/billing", text: "Review finance, collections and billing performance." },
  { title: "Reports", status: "FUNCTIONAL", href: "/reports", text: "Open operational, clinical and financial reporting." },
  { title: "Settings", status: "PARTIAL", href: "/settings", text: "Existing system settings shell is available; persistent User Management, RBAC and Security controls require an authentication/user model." },
];

export default function Phase3AdminPage() {
  return <main className="min-h-screen bg-[#080d16] px-5 py-8 text-slate-100 sm:px-8 lg:px-10"><div className="mx-auto max-w-6xl">
    <header className="rounded-[2rem] border border-white/10 bg-white/[.045] p-7 shadow-2xl"><Link href="/admin" className="text-xs font-black text-[#d9bb72]">← Administration</Link><p className="mt-7 text-[9px] font-black uppercase tracking-[.3em] text-[#d9bb72]">SAMS · Phase 3</p><h1 className="mt-2 text-4xl font-black tracking-tight">Admin & Master Data Control</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Single control surface for hospital masters, team management, diagnostics, finance and release-readiness checks.</p></header>
    <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{modules.map(m=><Link key={m.title} href={m.href} className="rounded-2xl border border-white/10 bg-white/[.045] p-5 transition hover:-translate-y-0.5 hover:bg-white/[.07]"><div className="flex items-center justify-between gap-3"><h2 className="font-black">{m.title}</h2><span className={`rounded-full px-2.5 py-1 text-[8px] font-black ${m.status==="FUNCTIONAL"?"bg-emerald-400/10 text-emerald-300":"bg-amber-400/10 text-amber-300"}`}>{m.status}</span></div><p className="mt-3 text-xs leading-5 text-slate-400">{m.text}</p><p className="mt-5 text-[10px] font-black uppercase tracking-widest text-[#d9bb72]">Open control →</p></Link>)}</section>
    <section className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/[.05] p-5"><p className="text-[9px] font-black uppercase tracking-[.25em] text-amber-300">Release gate</p><h2 className="mt-2 text-xl font-black">Authentication / RBAC is the remaining structural admin dependency.</h2><p className="mt-2 text-sm leading-6 text-slate-400">The current Prisma schema contains Doctor, Department and clinical master models but no User, Role, Permission or AuditLog model. Therefore this phase does not fabricate a fake security system. Real user management and role enforcement must be implemented together with the authentication architecture before production deployment.</p></section>
  </div></main>;
}
