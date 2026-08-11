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
  credentials: "MBBS, MS Orthopaedics",
  specialty: "Orthopaedics • Joint & Spine Care",
  description:
    "Clinical leadership for advanced musculoskeletal, joint, spine and rehabilitation care at Serawat Advanced Musculoskeletal, Joint & Spine Centre.",
};

export default function ClinicalLeadCard({
  name = defaultLead.name,
  credentials = defaultLead.credentials,
  specialty = defaultLead.specialty,
  description = defaultLead.description,
  imageSrc,
}: ClinicalLeadCardProps) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_15px_50px_rgba(8,43,97,0.06)]">
      <div className="grid lg:grid-cols-[300px_1fr]">
        <div className="relative min-h-[300px] overflow-hidden bg-[#082b61]">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={name}
              fill
              sizes="(max-width: 1024px) 100vw, 300px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgba(59,130,246,0.5),transparent_48%)]">
              <div className="flex h-36 w-36 items-center justify-center rounded-full border-8 border-white/15 bg-white/10 text-5xl font-black text-white shadow-2xl backdrop-blur-sm">
                {initials || "DS"}
              </div>
            </div>
          )}
          <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-blue-100 backdrop-blur-md">
            Clinical Lead
          </div>
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-black/15 p-4 backdrop-blur-md">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-200">SAMS</p>
            <p className="mt-1 text-xs font-bold text-white">Serawat Advanced Musculoskeletal Centre</p>
          </div>
        </div>

        <div className="flex flex-col justify-between p-7 sm:p-9">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0b63ce]">
              Meet the clinical lead
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#082b61] sm:text-4xl">
              {name}
            </h2>
            <p className="mt-2 text-sm font-bold text-slate-500">{credentials}</p>
            <div className="mt-5 inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#0b63ce]">
              {specialty}
            </div>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-500">
              {description}
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <LeadStat label="Focus" value="MSK Care" />
            <LeadStat label="Workspace" value="Clinical" />
            <LeadStat label="Status" value="Active" />
          </div>

          <div className="mt-7 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
            <Link
              href="/dashboard"
              className="rounded-xl bg-[#082b61] px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-950/10 transition hover:-translate-y-0.5 hover:bg-[#0b63ce]"
            >
              Open Command Center <span className="ml-2">→</span>
            </Link>
            <Link
              href="/patients"
              className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-black text-[#082b61] transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Patient Workspace <span className="ml-2">↗</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function LeadStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-[#f8fafc] p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-black text-[#082b61]">{value}</p>
    </div>
  );
}
