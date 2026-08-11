"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ClinicalLeadCard from "@/components/ClinicalLeadCard";

const fields = [
  { n: "01", en: "Musculoskeletal & Joint", hi: "मस्क्युलोस्केलेटल एवं जोड़", tag: "Pain, injury & joint function", items: "Osteoarthritis • Rheumatoid arthritis • Shoulder & knee disorders • Sports injuries • Tendon & ligament injuries" },
  { n: "02", en: "Spine Related", hi: "रीढ़ से संबंधित", tag: "Restoring movement. Relieving pain.", items: "Sciatica • Radiculopathy • Mechanical neck & back pain • Disc-related disorders • Spondylosis • Spinal stenosis" },
  { n: "03", en: "Brain Related", hi: "मस्तिष्क से संबंधित", tag: "Recovery after neurological injury & disease", items: "Stroke • Traumatic Brain Injury • Parkinson's disease • Brain-related movement disorders • Balance & coordination problems" },
  { n: "04", en: "Peripheral Nerve Related", hi: "पेरिफेरल नर्व से संबंधित", tag: "From nerve injury to functional recovery", items: "Peripheral neuropathy • Nerve injuries • Entrapment neuropathies • Brachial plexus disorders • Foot drop" },
  { n: "05", en: "Paediatric Rehabilitation", hi: "बाल पुनर्वास", tag: "Helping children move, develop & participate", items: "Cerebral Palsy • CTEV / Clubfoot • Developmental delay • Paediatric neurological & musculoskeletal conditions" },
  { n: "06", en: "Neuro Rehabilitation", hi: "न्यूरो पुनर्वास", tag: "Rebuilding movement, balance & independence", items: "Stroke rehabilitation • Parkinson's rehabilitation • Multiple sclerosis • Gait & balance disorders • Ataxia" },
  { n: "07", en: "Spinal Cord Rehabilitation", hi: "स्पाइनल कॉर्ड पुनर्वास", tag: "Maximising independence after spinal cord injury", items: "Spinal cord injury • Paraplegia • Tetraplegia • Mobility & wheelchair rehabilitation • Functional independence" },
  { n: "08", en: "Other Specialized Rehabilitation", hi: "अन्य विशेष पुनर्वास", tag: "Complex problems. Individualised solutions.", items: "Rheumatological conditions • Chronic pain • Amputation rehabilitation • Prosthetic & orthotic rehabilitation" },
];

export default function HomeV2() {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const hi = lang === "hi";
  return (
    <main className="min-h-screen bg-[#f5efe3] text-[#10233f]">
      <header className="sticky top-0 z-30 border-b border-[#ded5c5] bg-[#fbf8f1]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-3 sm:px-8">
          <Link href="/home-v2" className="flex items-center gap-3"><Image src="/serawat-logo.png" alt="SAMS" width={76} height={44} className="h-11 w-auto object-contain" priority /><div><p className="font-serif text-xl font-bold tracking-tight text-[#082b61]">SAMS</p><p className="hidden text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:block">Serawat Advanced Musculoskeletal, Joint & Spine Centre</p></div></Link>
          <div className="flex items-center gap-3"><div className="flex rounded-full border border-[#ded5c5] bg-[#f5efe3] p-1 text-[10px] font-black"><button onClick={() => setLang("en")} className={`rounded-full px-3 py-1.5 ${!hi ? "bg-[#082b61] text-white" : "text-slate-500"}`}>EN</button><button onClick={() => setLang("hi")} className={`rounded-full px-3 py-1.5 ${hi ? "bg-[#082b61] text-white" : "text-slate-500"}`}>हिन्दी</button></div><Link href="/dashboard" className="hidden rounded-xl bg-[#082b61] px-4 py-2.5 text-xs font-black text-white sm:block">Command Center ↗</Link></div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#071f46] text-white">
        <div className="absolute -right-40 -top-40 h-[260px] w-[260px] rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-[220px] w-[220px] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-[1400px] items-center gap-5 px-5 py-2 sm:px-8 sm:py-4 lg:grid-cols-[1fr_1.08fr] lg:gap-6 lg:py-4">
          <div className="max-w-2xl">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-blue-200">Serawat Advanced Musculoskeletal, Joint & Spine Centre</p>
            <h1 className="mt-3 max-w-3xl font-serif text-4xl font-medium leading-[1] tracking-[-0.03em] sm:text-5xl lg:text-5xl">{hi ? <>दर्द से आगे।<br /><em className="text-blue-300">बेहतर जीवन की ओर।</em></> : <>Advanced care for<br /><em className="text-blue-300">pain, movement & recovery.</em></>}</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100/80 sm:text-base">{hi ? "दर्द, गतिशीलता और पुनर्वास के लिए विशेषज्ञ, व्यक्तिगत और उद्देश्यपूर्ण देखभाल।" : "Specialized, personalised care for pain, movement, function and recovery — bringing specialist rehabilitation together under one roof."}</p>
            <div className="mt-4 flex flex-wrap gap-3"><Link href="/patients" className="rounded-xl bg-white px-5 py-3 text-sm font-black text-[#082b61] shadow-xl">{hi ? "परामर्श शुरू करें" : "Begin Your Consultation"} →</Link><a href="#doctor" className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur">{hi ? "डॉक्टर से मिलें" : "Meet Your Specialist"} ↓</a></div>
          </div>
          <div id="doctor" className="mx-auto w-full max-w-[500px] lg:justify-self-end"><ClinicalLeadCard /></div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 sm:py-14"><div className="grid gap-7 lg:grid-cols-[.72fr_1.28fr] lg:items-start"><div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0b63ce]">A message from your doctor</p><h2 className="mt-3 font-serif text-4xl font-medium leading-tight text-[#082b61] sm:text-5xl">{hi ? "हर मरीज की कहानी अलग है।" : "Every patient has a different story."}</h2></div><div className="border-l border-[#ded5c5] pl-5 sm:pl-8"><p className="font-serif text-2xl leading-[1.4] text-[#203b5d] sm:text-3xl">{hi ? "SAMS में हम पहले आपकी कहानी समझते हैं—आपकी समस्या, आपकी गतिविधि और आपके लक्ष्य। हमारा उद्देश्य केवल बीमारी का उपचार नहीं, बल्कि बेहतर गति, बेहतर कार्यक्षमता और अधिक स्वतंत्रता की ओर आपकी यात्रा में साथ देना है।" : "At SAMS, we understand your story first — your problem, your movement, your daily life and your goals. Our aim is not simply to treat a condition, but to help you move better, function better and live better."}</p><p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-slate-500">— Dr. Suraj Serawat</p></div></div></section>

      <section className="border-y border-[#ded5c5] bg-[#fbf8f1]"><div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 sm:py-14"><div className="max-w-3xl"><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0b63ce]">Why SAMS</p><h2 className="mt-3 font-serif text-4xl font-medium leading-tight text-[#082b61] sm:text-6xl">{hi ? "देखभाल जो निदान से आगे देखती है।" : "Care that sees beyond the diagnosis."}</h2><p className="mt-4 text-base leading-7 text-slate-500">{hi ? "SAMS में विशेषज्ञ मूल्यांकन, दर्द प्रबंधन, पुनर्वास और कार्यात्मक सुधार को व्यक्ति-केंद्रित योजना में जोड़ा जाता है।" : "SAMS brings specialist assessment, pain medicine, rehabilitation and functional recovery together around one personalised plan — because meaningful recovery is about more than a diagnosis."}</p></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{["Personalised assessment","Evidence-informed care","Goal-oriented rehabilitation","Continuity & follow-up"].map((x,i)=><div key={x} className="rounded-2xl border border-[#ded5c5] bg-white/70 p-5"><span className="font-serif text-3xl text-[#0b63ce]">0{i+1}</span><h3 className="mt-4 text-sm font-black text-[#082b61]">{x}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{["Understand the person, not only the condition.","Treatment shaped by clinical reasoning and evidence.","Plans built around movement, function and independence.","Support beyond the first appointment."][i]}</p></div>)}</div></div></section>

      <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-24"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0b63ce]">Our areas of expertise</p><h2 className="mt-4 font-serif text-4xl font-medium text-[#082b61] sm:text-6xl">{hi ? "पुनर्वास विशेषज्ञता का व्यापक दायरा" : "Expertise across the spectrum of rehabilitation."}</h2></div><p className="max-w-md text-sm leading-6 text-slate-500">{hi ? "दर्द और जोड़ से लेकर न्यूरोलॉजिकल एवं बाल पुनर्वास तक।" : "From pain and joints to neurological, paediatric and spinal rehabilitation — specialised care, connected."}</p></div><div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{fields.map(f=><article key={f.n} className="group rounded-[1.75rem] border border-[#ded5c5] bg-[#fbf8f1] p-6 shadow-[0_12px_40px_rgba(8,43,97,0.04)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_22px_60px_rgba(8,43,97,0.10)]"><div className="flex items-start justify-between"><span className="font-serif text-3xl text-[#0b63ce]/70">{f.n}</span><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#0b63ce]">SAMS</span></div><h3 className="mt-8 font-serif text-2xl font-medium leading-tight text-[#082b61]">{hi ? f.hi : f.en}</h3><p className="mt-3 text-xs font-black uppercase tracking-[0.08em] text-[#0b63ce]">{f.tag}</p><p className="mt-4 text-xs leading-6 text-slate-500">{f.items}</p><div className="mt-6 border-t border-[#ded5c5] pt-4 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 group-hover:text-[#0b63ce]">Explore care →</div></article>)}</div></section>

      <section className="bg-[#071f46] text-white"><div className="mx-auto max-w-[1200px] px-5 py-16 text-center sm:px-8 sm:py-24"><p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-300">Your next step</p><h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl font-medium leading-tight sm:text-6xl">{hi ? "बेहतर गति की शुरुआत यहीं से करें।" : "Your journey toward better movement starts here."}</h2><p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-blue-100/70">{hi ? "SAMS में विशेषज्ञ मूल्यांकन और व्यक्तिगत पुनर्वास देखभाल के बारे में जानें।" : "Discover specialist assessment and personalised rehabilitation care at SAMS."}</p><Link href="/patients" className="mt-8 inline-flex rounded-xl bg-white px-7 py-4 text-sm font-black text-[#082b61] shadow-xl">{hi ? "परामर्श के लिए आगे बढ़ें" : "Start Your Consultation"} →</Link></div></section>

      <footer className="border-t border-[#ded5c5] bg-[#fbf8f1]"><div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-5 py-8 text-xs text-slate-500 sm:flex-row sm:justify-between"><span>SAMS • Serawat Advanced Musculoskeletal, Joint & Spine Centre</span><span>Clinical care • Pain medicine • Rehabilitation</span></div></footer>
    </main>
  );
}
