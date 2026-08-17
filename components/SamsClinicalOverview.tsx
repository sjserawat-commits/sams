const treatingFields = [
  { title: "Musculoskeletal & Joint", tagline: "Move better. Live better.", items: ["Osteoarthritis", "Rheumatoid arthritis", "Joint pain & stiffness", "Shoulder & knee disorders", "Sports injuries", "Tendon & ligament problems"] },
  { title: "Spine Related", tagline: "Relieve pain. Restore movement.", items: ["Sciatica", "Radiculopathy", "Mechanical neck & back pain", "Disc-related disorders", "Cervical & lumbar spondylosis", "Spinal stenosis"] },
  { title: "Brain Related", tagline: "Recovery after neurological injury & disease.", items: ["Stroke", "Traumatic Brain Injury (TBI)", "Parkinson’s disease", "Acquired brain injury", "Movement disorders", "Balance & coordination problems"] },
  { title: "Peripheral Nerve Related", tagline: "From nerve injury to functional recovery.", items: ["Peripheral neuropathy", "Peripheral nerve injuries", "Nerve compression disorders", "Entrapment neuropathies", "Brachial plexus injuries", "Foot drop"] },
  { title: "Paediatric Rehabilitation", tagline: "Helping children move, develop & participate.", items: ["Cerebral Palsy (CP)", "CTEV / Clubfoot", "Developmental delay", "Paediatric neurological conditions", "Paediatric musculoskeletal conditions", "Gait & movement disorders"] },
  { title: "Neuro Rehabilitation", tagline: "Rebuilding movement, balance & independence.", items: ["Stroke rehabilitation", "Parkinson’s rehabilitation", "Multiple sclerosis", "Guillain-Barré syndrome", "Ataxia & coordination disorders", "Balance & gait disorders"] },
  { title: "Spinal Cord Rehabilitation", tagline: "Maximising independence after spinal cord injury.", items: ["Spinal cord injury", "Paraplegia", "Tetraplegia", "Incomplete spinal cord injury", "Spinal cord-related weakness", "Mobility & wheelchair rehabilitation"] },
  { title: "Other Specialized Rehabilitation", tagline: "Complex problems. Individualised solutions.", items: ["Rheumatological conditions", "Chronic pain", "Amputation rehabilitation", "Prosthetic rehabilitation", "Orthotic & assistive-device needs", "Complex functional disabilities"] },
];

const reasons = [
  ["Personalized assessment", "We begin by understanding the person, the condition and the goals that matter most."],
  ["Specialist clinical thinking", "Pain medicine, musculoskeletal, spine and rehabilitation expertise come together in one clinical approach."],
  ["Function, not just symptoms", "Our aim is meaningful improvement in movement, participation, independence and quality of life."],
  ["Whole-person rehabilitation", "Musculoskeletal, neurological, paediatric and functional needs are considered as part of the bigger picture."],
  ["Continuity of care", "Assessment, treatment, documentation and follow-up remain connected throughout the patient's journey."],
  ["Care built around your goals", "Your priorities help shape the treatment plan—from reducing pain to returning to everyday life."],
];

export default function SamsClinicalOverview() {
  return (
    <>
      <section className="mt-10 overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-[0_20px_70px_rgba(8,43,97,0.07)]">
        <div className="grid lg:grid-cols-[1.15fr_.85fr]">
          <div className="p-8 sm:p-10 lg:p-14">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#0b63ce]">The SAMS approach</p>
            <h2 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-tight tracking-[-0.025em] text-[#082b61] sm:text-5xl">Care that sees beyond the diagnosis.</h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600">SAMS — Serawat Advanced Musculoskeletal, Joint & Spine Centre — is built around a simple belief: meaningful healthcare should help people understand their problem, move with greater confidence and return to the life they value.</p>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">With expertise spanning Pain Medicine, musculoskeletal and joint conditions, spine disorders, brain and nerve-related conditions, paediatric rehabilitation and specialised functional recovery, we bring clinical assessment and rehabilitation together around the individual.</p>
          </div>
          <div className="border-t border-slate-100 bg-[#f7faff] p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-14">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#0b63ce]">What guides our care</p>
            <div className="mt-6 grid gap-3">{["Listen & understand", "Assess the cause and impact", "Plan around individual goals", "Treat, rehabilitate & follow through"].map((item, i) => <div key={item} className="flex items-center gap-4 rounded-2xl border border-blue-100 bg-white px-4 py-4 text-sm font-bold text-[#082b61] shadow-sm"><span className="font-serif text-xl italic text-[#0b63ce]">0{i + 1}</span>{item}</div>)}</div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-6 max-w-4xl"><p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#0b63ce]">Conditions treated here</p><h2 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[#082b61] sm:text-5xl">Expertise across the spectrum of rehabilitation.</h2><p className="mt-4 text-base leading-7 text-slate-500">From pain and movement disorders to neurological and paediatric rehabilitation, specialised care is brought together under one roof.</p></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {treatingFields.map((field, index) => <article key={field.title} className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-[0_14px_45px_rgba(8,43,97,0.05)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_65px_rgba(8,43,97,0.11)]"><div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-blue-50 opacity-60 blur-2xl transition group-hover:bg-blue-100" /><div className="relative"><div className="flex items-center justify-between"><span className="font-serif text-2xl italic text-[#0b63ce]">{String(index + 1).padStart(2, "0")}</span><span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-300 transition group-hover:text-[#0b63ce]">Explore →</span></div><h3 className="mt-8 text-lg font-black leading-6 text-[#082b61]">{field.title}</h3><p className="mt-2 text-xs font-bold leading-5 text-[#0b63ce]">{field.tagline}</p><ul className="mt-5 space-y-2 border-t border-slate-100 pt-4">{field.items.map((item) => <li key={item} className="flex gap-2 text-xs font-medium leading-5 text-slate-500"><span className="text-[#0b63ce]">•</span><span>{item}</span></li>)}</ul></div></article>)}
        </div>
      </section>

      <section className="relative mt-10 overflow-hidden rounded-[2.5rem] bg-[#082b61] p-8 text-white shadow-[0_25px_80px_rgba(8,43,97,0.18)] sm:p-10 lg:p-14">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#0b63ce]/30 blur-3xl" />
        <div className="relative max-w-4xl"><p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-200">Why choose SAMS</p><h2 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-[-0.02em] sm:text-5xl">Because recovery is personal.</h2><p className="mt-5 text-base leading-8 text-blue-100">Every person has a different condition, story and definition of recovery. SAMS brings specialist clinical expertise and rehabilitation thinking together to create care that is personal, purposeful and focused on what you want to get back to.</p></div>
        <div className="relative mt-9 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{reasons.map(([title, description], index) => <div key={title} className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm"><span className="font-serif text-lg italic text-blue-200">0{index + 1}</span><h3 className="mt-4 text-sm font-black">{title}</h3><p className="mt-2 text-xs leading-5 text-blue-100/75">{description}</p></div>)}</div>
      </section>

      <section className="relative mt-10 overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-[0_20px_70px_rgba(8,43,97,0.06)]">
        <div className="grid lg:grid-cols-[1fr_360px]">
          <div className="p-8 sm:p-10 lg:p-14"><p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#0b63ce]">A message from your doctor</p><h2 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-tight text-[#082b61] sm:text-5xl">“Let’s focus on what matters to you.”</h2><p className="mt-7 max-w-3xl text-base leading-8 text-slate-600">Every patient comes with a different story, a different challenge and a different goal. At SAMS, our approach is to understand that story first—to identify the problem, understand how it affects movement and daily life, and create a treatment plan around what matters most to you.</p><p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">Whether you are living with pain, recovering from an injury, facing a neurological condition or working toward greater independence, our goal is simple: to help you move better, function better and live better.</p><div className="mt-8 border-t border-slate-100 pt-5"><p className="font-serif text-xl italic text-[#082b61]">Dr. Suraj Serawat</p><p className="mt-1 text-xs font-bold text-slate-400">MBBS, MD Physical Medicine & Rehabilitation • SMS Medical College, Jaipur</p><p className="mt-1 text-xs font-black text-[#0b63ce]">Pain Medicine • Joint & Spine Specialist</p></div></div>
          <div className="hidden bg-[#f7faff] p-10 lg:flex lg:items-center"><div className="rounded-[2rem] border border-blue-100 bg-white p-7 shadow-sm"><p className="font-serif text-2xl italic leading-9 text-[#082b61]">“Treatment is not only about treating a condition. It is about helping you return to the life, movement and independence that matter to you.”</p></div></div>
        </div>
      </section>
    </>
  );
}
