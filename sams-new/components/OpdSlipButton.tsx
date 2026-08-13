"use client";

import { useRouter } from "next/navigation";

export default function OpdSlipButton({ patientId }: { patientId: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() =>
        router.push(`/patients/profile/${patientId}/opd-slip`)
      }
      className="rounded-xl bg-[#0b63ce] px-5 py-3 text-sm font-black text-white"
    >
      Create OPD Slip
    </button>
  );
}
