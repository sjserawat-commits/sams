import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const patient = await prisma.patient.findFirst({
    where: {
      id: Number(id),
    },
  });

  if (!patient) {
    notFound();
  }

  return (
    <main>
      <Sidebar />
      <div>
        <Navigation />

        <header>
          <h1>Patient Profile</h1>
          <p>Complete patient record</p>
        </header>

        <section>
          <h2>Patient Information</h2>
          <p>
            <strong>Patient ID:</strong> {patient.patientId}
          </p>
          <p>
            <strong>Name:</strong> {patient.firstName} {patient.lastName}
          </p>
          <p>
            <strong>Gender:</strong> {patient.gender || "-"}
          </p>
          <p>
            <strong>Date of Birth:</strong>{" "}
            {patient.dateOfBirth
              ? patient.dateOfBirth.toLocaleDateString()
              : "-"}
          </p>
          <p>
            <strong>Phone:</strong> {patient.phone || "-"}
          </p>
          <p>
            <strong>Address:</strong> {patient.address || "-"}
          </p>
        </section>

        <section>
          <h2>Medical Record</h2>
          <p>No clinical records added yet.</p>
        </section>

        <p>
          <a href="/patients/list">← Back to Patient List</a>
        </p>
      </div>
    </main>
  );
}
