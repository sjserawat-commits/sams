import Link from "next/link";

const groups = [
  ["Back, Neck & Spine Conditions", "Back pain, neck pain, disc problems, sciatica, spondylosis and spinal stenosis."],
  ["Musculoskeletal & Joint Conditions", "Knee, shoulder, hip, ankle, foot, elbow, wrist and soft-tissue conditions."],
  ["Neurological Conditions & Rehabilitation", "Stroke, Parkinsonism, multiple sclerosis, peripheral nerve disorders and brain injury rehabilitation."],
  ["Spinal Cord Disorders & Rehabilitation", "Spinal cord injury, congenital spinal cord-related conditions, myelopathy and functional rehabilitation."],
  ["Paediatric & Congenital Rehabilitation", "Cerebral palsy, CTEV and other developmental or congenital conditions."],
  ["Pain Management & Chronic Pain", "Chronic musculoskeletal, spinal, neuropathic and persistent pain conditions."],
  ["Post-Polio & Neuromuscular Conditions", "Post-polio residual syndrome, muscle weakness and neuromuscular rehabilitation."],
  ["Sports & Activity-Related Conditions", "Sports injuries, overuse injuries, muscle and tendon problems and return-to-activity rehabilitation."],
  ["Functional & Disability Rehabilitation", "Mobility, gait, balance, weakness, contractures, spasticity and functional limitations."],
  ["Specialized Rehabilitation", "Amputation, prosthetic and orthotic rehabilitation, spasticity, gait, wheelchair, seating and positioning."],
];

export default function ConditionsPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#082b61]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <div><p className="text-xl font-black">SAMS</p><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Serawat Advanced Musculoskeletal, Joint & Spine Centre</p></div>
          <Link href="/home-v2" className="rounded-xl bg-[#082b61] px-4 py-2 text-xs font-black text-white">Home</Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">SAMS Care Areas</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Conditions We Treat</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">Comprehensive Physical Medicine & Rehabilitation, pain management, musculoskeletal and neuro-spine rehabilitation care.</p>
        <section className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map(([title, description]) => <article key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(8,43,97,0.05)]"><h2 className="text-lg font-black">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-500">{description}</p></article>)}
        </section>
      </div>
    </main>
  );
}
