import { redirect } from "next/navigation";

export default function PatientProfileIndexPage() {
  redirect("/patients/list");
}
