import Image from "next/image";
import Link from "next/link";

const services = [
  { title: "Pain Medicine", text: "Comprehensive assessment and evidence-based management of acute and chronic pain conditions." },
  { title: "Neurorehabilitation", text: "Goal-oriented rehabilitation for neurological conditions, with a focus on function, mobility and independence." },
  { title: "Spine Rehabilitation", text: "Integrated evaluation and rehabilitation for spine-related pain, movement limitations and functional recovery." },
  { title: "Musculoskeletal & Joint Care", text: "Assessment and non-surgical management of common musculoskeletal, joint and soft-tissue conditions." },
  { title: "Physical Medicine & Rehabilitation", text: "Personalized rehabilitation programs designed to restore function, participation and quality of life." },
  { title: "Sports & Functional Rehabilitation", text: "Structured rehabilitation to support safe return to activity, performance and everyday function." },
  { title: "Electrodiagnosis", text: "Specialized nerve and muscle assessment to support diagnosis and clinical decision-making when indicated." },
  { title: "Disability & Functional Rehabilitation", text: "Function-focused care for people living with disability, complex impairments or long-term functional limitations." },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#082b61]">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-3 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/serawat-logo.png" alt="SAMS Serawat Advanced Multispecialty Joint & Spine Center" width={82} height={46} className="h-11 w-auto object-contain" priority />
            <div>
              <p className="text-lg font-black tracking-tight">SAMS</p>
              <p className="max-w-[320px] text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">SAMS Serawat Advanced Multispecialty Joint &amp; Spine Center</p>
            </div>
          </Link>
          <Link href="/patients" className="rounded-xl bg-[#082b61] px-4 py-2.5 text-xs font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0b63ce]">Book / Register <span className="ml-1">↗</span></Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-5 py-7 sm:px-8 sm:py-10">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-[#082b61] px-7 py-10 text-white shadow-[0_28px_80px_rgba(8,43,97,0.20)] sm:px-10 sm:py-14 lg:px-14">
          <div className="absolute -right-24 -top-28 h-96 w-96 rounded-full bg-[#0b63ce]/35 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative max-w-4xl">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-200">About the Centre</p>
            <h1 className="mt-4 text-4xl font-black leading-[1.02] tracking-[-0.04em] sm:text-6xl">Expert care.<br /><span className="text-blue-300">Focused on function.</span></h1>
            <p className="mt-6 max-w-3xl text-sm leading-7 text-blue-100 sm:text-base">SAMS Serawat Advanced Multispecialty Joint &amp; Spine Center is focused on comprehensive physical medicine, rehabilitation and pain care—bringing clinical expertise together with a function-first approach to recovery.</p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
          <div className="relative overflow-hidden rounded-[2.25rem] bg-white p-4 shadow-[0_18px_60px_rgba(8,43,97,0.08)] ring-1 ring-slate-200/70">
            <div className="relative min-h-[430px] overflow-hidden rounded-[1.8rem] bg-gradient-to-b from-blue-50 to-slate-50">
              <Image src="/doctor-suraj.jpg" alt="Dr. Suraj Serawat" fill className="object-cover object-top" priority />
            </div>
            <div className="px-4 pb-3 pt-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">Clinical Lead</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">Dr. Suraj Serawat</h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">Consultant Physiatrist</p>
              <p className="mt-1 text-xs font-bold text-slate-400">MD – Physical Medicine &amp; Rehabilitation</p>
            </div>
          </div>

          <article className="rounded-[2.25rem] border border-slate-200/80 bg-white p-7 shadow-[0_18px_60px_rgba(8,43,97,0.06)] sm:p-10">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">About Dr. Suraj Serawat</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">A physiatry-led approach to recovery</h2>
            <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">Dr. Suraj Serawat is a Consultant Physiatrist with an MD in Physical Medicine &amp; Rehabilitation, with focused clinical interests in pain medicine, neurorehabilitation and spine rehabilitation.</p>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">His approach is centered on understanding the whole person—not only the diagnosis. Care is designed around pain control, movement, function, participation and meaningful recovery, with individualized rehabilitation strategies where appropriate.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {["Pain Specialist", "Neurorehabilitation", "Spine Rehabilitation", "Physical Medicine & Rehabilitation"].map((item) => <div key={item} className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm font-bold text-[#082b61]">{item}</div>)}
            </div>
          </article>
        </section>

        <section className="mt-10">
          <div className="mb-6 max-w-3xl"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">Services We Provide</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Specialized care across pain, rehabilitation and function.</h2><p className="mt-3 text-sm leading-6 text-slate-500">A coordinated range of services designed around accurate assessment, symptom management and functional recovery.</p></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => <article key={service.title} className="group rounded-[1.65rem] border border-slate-200/80 bg-white p-6 shadow-[0_12px_45px_rgba(8,43,97,0.05)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_20px_55px_rgba(8,43,97,0.10)]"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xs font-black text-[#0b63ce] group-hover:bg-[#0b63ce] group-hover:text-white">{String(index + 1).padStart(2, "0")}</div><h3 className="mt-7 text-lg font-black tracking-tight">{service.title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{service.text}</p></article>)}
          </div>
        </section>

        <section className="mt-10 overflow-hidden rounded-[2.25rem] bg-white shadow-[0_18px_60px_rgba(8,43,97,0.06)] ring-1 ring-slate-200/70">
          <div className="grid lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="p-7 sm:p-10"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">SAMS Serawat Advanced</p><h2 className="mt-2 text-2xl font-black tracking-tight">Restoring function • Relieving pain • Enhancing lives</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Care at SAMS is built around clinical reasoning, personalized rehabilitation and measurable functional goals.</p></div>
            <div className="border-t border-slate-100 p-6 lg:border-l lg:border-t-0"><Link href="/patients" className="inline-flex rounded-xl bg-[#082b61] px-6 py-3.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0b63ce]">Start Patient Registration <span className="ml-2">→</span></Link></div>
          </div>
        </section>

        <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 pb-8 text-xs font-medium text-slate-400 sm:flex-row"><span>SAMS • Serawat Advanced Multispecialty Joint &amp; Spine Center</span><span>Physical Medicine • Rehabilitation • Pain Medicine • Electrodiagnosis</span></footer>
      </div>
    </main>
  );
}
