const treatingFields = [
  { title: "Musculoskeletal & Joint", items: ["Osteoarthritis", "Rheumatoid arthritis", "Joint pain & stiffness", "Shoulder & knee disorders", "Sports injuries", "Tendon & ligament problems", "Post-operative rehabilitation"] },
  { title: "Spine Related", items: ["Sciatica", "Radiculopathy", "Mechanical neck & back pain", "Disc-related disorders", "Cervical & lumbar spondylosis", "Spinal stenosis", "Postural spine disorders"] },
  { title: "Brain Related", items: ["Stroke", "Traumatic Brain Injury (TBI)", "Parkinson’s disease", "Acquired brain injury", "Brain-related movement disorders", "Balance & coordination problems"] },
  { title: "Peripheral Nerve Related", items: ["Peripheral neuropathy", "Peripheral nerve injuries", "Nerve compression disorders", "Entrapment neuropathies", "Brachial plexus injuries", "Foot drop"] },
  { title: "Paediatric Rehabilitation", items: ["Cerebral Palsy (CP)", "CTEV / Clubfoot", "Developmental delay", "Paediatric neurological conditions", "Paediatric musculoskeletal conditions", "Gait & movement disorders"] },
  { title: "Neuro Rehabilitation", items: ["Stroke rehabilitation", "Parkinson’s rehabilitation", "Multiple sclerosis", "Guillain-Barré syndrome", "Ataxia & coordination disorders", "Balance & gait disorders", "Functional mobility problems"] },
  { title: "Spinal Cord Rehabilitation", items: ["Spinal cord injury", "Paraplegia", "Tetraplegia", "Incomplete spinal cord injury", "Spinal cord-related weakness", "Mobility & wheelchair rehabilitation", "Transfers & activities of daily living"] },
  { title: "Other Specialized Rehabilitation", items: ["Rheumatological conditions", "Chronic pain", "Amputation rehabilitation", "Prosthetic rehabilitation", "Orthotic & assistive-device needs", "Complex functional disabilities"] },
];

const reasons = [
  ["Personalized assessment", "Care begins with understanding the individual, the condition and the patient's functional goals."],
  ["Evidence-informed care", "Clinical decisions are guided by contemporary evidence, examination and individual needs."],
  ["Rehabilitation-focused approach", "The goal is not only symptom relief, but better movement, function and independence."],
  ["Multidisciplinary thinking", "Musculoskeletal, neurological, paediatric and functional needs can be considered together."],
  ["Continuity of care", "Assessment, treatment, documentation and follow-up remain connected through the patient's journey."],
  ["Patient-centred goals", "Treatment plans are shaped around meaningful activities, participation and recovery."],
];

export default function SamsClinicalOverview() {
  return (
    <>
      <section className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_15px_50px_rgba(8,43,97,0.06)]">
        <div className="grid lg:grid-cols-[1.15fr_.85fr]">
          <div className="p-7 sm:p-9 lg:p-11">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">Introduction to SAMS</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#082b61] sm:text-4xl">Advanced clinical care with rehabilitation at its core.</h2>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-500">SAMS — Serawat Advanced Musculoskeletal, Joint & Spine Centre — brings together specialist clinical assessment, diagnosis, treatment planning and rehabilitation to help people recover movement, function and confidence.</p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500">Our clinical scope extends beyond musculoskeletal and spine conditions to neurological, spinal cord, peripheral nerve, paediatric and other specialised rehabilitation needs. Care is planned around the person, the condition and the goals that matter to them.</p>
          </div>
          <div className="border-t border-slate-100 bg-[#f7faff] p-7 sm:p-9 lg:border-l lg:border-t-0 lg:p-11">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">Our clinical focus</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {["Assessment & diagnosis", "Individualized treatment planning", "Functional rehabilitation", "Long-term recovery & follow-up"].map((item) => <div key={item} className="rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm font-bold text-[#082b61]"><span className="mr-2 text-[#0b63ce]">✓</span>{item}</div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">Conditions treated here</p><h2 className="mt-2 text-3xl font-black tracking-tight text-[#082b61]">Our major treating fields.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">A broad clinical scope covering musculoskeletal, spine, brain, nerve, paediatric and specialised rehabilitation needs.</p></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {treatingFields.map((field, index) => <article key={field.title} className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_12px_40px_rgba(8,43,97,0.04)]"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[10px] font-black text-[#0b63ce]">{String(index + 1).padStart(2, "0")}</span><h3 className="text-base font-black text-[#082b61]">{field.title}</h3></div><ul className="mt-4 space-y-2">{field.items.map((item) => <li key={item} className="flex gap-2 text-xs font-medium leading-5 text-slate-500"><span className="text-[#0b63ce]">•</span><span>{item}</span></li>)}</ul></article>)}
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] bg-[#082b61] p-7 text-white shadow-[0_25px_70px_rgba(8,43,97,0.16)] sm:p-9 lg:p-11">
        <div className="max-w-3xl"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-200">Why choose SAMS</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Care designed around recovery, function and you.</h2><p className="mt-4 text-sm leading-7 text-blue-100">SAMS combines specialist clinical thinking with a rehabilitation-oriented approach, keeping the patient's goals and functional recovery at the centre of care.</p></div>
        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{reasons.map(([title, description]) => <div key={title} className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm"><h3 className="text-sm font-black">{title}</h3><p className="mt-2 text-xs leading-5 text-blue-100/75">{description}</p></div>)}</div>
      </section>
    </>
  );
}
