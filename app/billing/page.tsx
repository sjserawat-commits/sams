import { redirect } from "next/navigation";
import PatientChargesPage from "./patient-charges/page";

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ visitId?: string }> }) {
  const params = await searchParams;
  if (params.visitId) redirect(`/billing/review?visitId=${encodeURIComponent(params.visitId)}`);
  return <PatientChargesPage />;
}
