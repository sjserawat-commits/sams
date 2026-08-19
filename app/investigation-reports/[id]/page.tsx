import { redirect } from "next/navigation";

export default async function LabReport({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/investigation-reports/${id}/print`);
}
