"use client";

import Image from "next/image";
import Link from "next/link";

type ClinicalLeadCardProps = {
  name?: string;
  credentials?: string;
  specialty?: string;
  description?: string;
  imageSrc?: string;
};

const defaultLead = {
  name: "Dr. Suraj Serawat",
  credentials: "MBBS, MD Physical Medicine & Rehabilitation",
  specialty: "Pain Medicine • Joint & Spine Specialist",
  description:
    "Clinical leadership focused on pain medicine, musculoskeletal and joint conditions, spine disorders, neurological rehabilitation and comprehensive functional recovery at Serawat Advanced Musculoskeletal, Joint & Spine Centre.",
};

const expertise = [
  "Musculoskeletal & joint conditions",
  "Spine-related disorders",
  "Pain medicine",
  "Brain and neurological rehabilitation",
  "Peripheral nerve-related conditions",
  "Paediatric rehabilitation",
  "Spinal cord rehabilitation",
  "Specialized rehabilitation and functional recovery",
];

export default function ClinicalLeadCard({
  name = defaultLead.name,
  credentials = defaultLead.credentials,
  specialty = defaultLead.specialty,
  description = defaultLead.description,
  imageSrc = "/doctor-photo.jpg",
}: ClinicalLeadCardProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_15px_50px_rgba(8,43,97,0.06)]">
      <div className="grid lg:grid-cols-[330px_1fr]">
        <div className="relative min-h-[360px] overflow-hidden bg-[#082b61]">
          <Image src={imageSrc} alt={name} fill sizes="(max-width: 1024px) 100vw, 330px" className="object-cover object-top" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#082b61]/75 via-transparent to-transparent" />
          <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-blue-100 backdrop-blur-md">Clinical Lead</div>
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-md">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-200">SAMS</p>
            <p className="mt-1 text-xs font-bold text-white">Serawat Advanced Musculoskeletal, Joint & Spine Centre</p>
          </div>
        </div>

        <div className="flex flex-col justify-between p-7 sm:p-9">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">Meet the clinical lead</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#082b61] sm:text-4xl">{name}</h2>
            <p className="mt-2 text-sm font-bold text-slate-500">{credentials}</p>
            <div className="mt-5 inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#0b63ce]">{specialty}</div>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-500">{description}</p>

            <div className="mt-7">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0b63ce]">Areas of expertise</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {expertise.map((item) => (
                  <div key={item} className="flex items-start gap-2 rounded-xl border border-slate-100 bg-[#f8fafc] px-3 py-2.5 text-xs font-bold text-[#082b61]">
                    <span className="mt-0.5 text-[#0b63ce]">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
            <Link href="/dashboard" className="rounded-xl bg-[#082b61] px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-950/10 transition hover:-translate-y-0.5 hover:bg-[#0b63ce]">Open Command Center <span className="ml-2">→</span></Link>
            <Link href="/patients" className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-black text-[#082b61] transition hover:bg-blue-50">Patient Workspace <span className="ml-2">↗</span></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
