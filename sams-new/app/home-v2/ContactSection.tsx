export default function ContactSection() {
  return (
    <section className="mt-8 overflow-hidden rounded-[2rem] bg-[#082b61] p-7 text-white shadow-[0_20px_60px_rgba(8,43,97,0.18)] sm:p-9">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-200">SAMS patient care</p>
      <h2 className="mt-2 text-3xl font-black tracking-tight">Need expert rehabilitation care?</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">Connect with Dr. Suraj Serawat for pain, musculoskeletal, neuro and spine rehabilitation. Contact details will be added here once finalized.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href="/about" className="rounded-xl bg-white px-5 py-3 text-sm font-black text-[#082b61]">Meet Dr. Suraj Serawat →</a>
        <a href="/about#services" className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white">View Services ↗</a>
      </div>
    </section>
  );
}
