import { prisma } from "../lib/prisma";

async function main() {
  console.log("Clearing all patient-related transactional data...");

  // Use SAMS's configured Prisma adapter so this script works with Prisma 7
  // and targets the same SQLite database used by the application.
  const billingLineItems = await prisma.billingLineItem.deleteMany();
  const investigationOrders = await prisma.investigationOrder.deleteMany();
  const prescriptions = await prisma.prescription.deleteMany();
  const billingRecords = await prisma.billingRecord.deleteMany();
  const clinicalEncounters = await prisma.clinicalEncounter.deleteMany();
  const appointments = await prisma.appointment.deleteMany();
  const opdVisits = await prisma.oPDVisit.deleteMany();
  const patients = await prisma.patient.deleteMany();

  console.log("Patient data cleared successfully:");
  console.log(`- Billing line items: ${billingLineItems.count}`);
  console.log(`- Investigation orders: ${investigationOrders.count}`);
  console.log(`- Prescriptions: ${prescriptions.count}`);
  console.log(`- Billing records: ${billingRecords.count}`);
  console.log(`- Clinical encounters: ${clinicalEncounters.count}`);
  console.log(`- Appointments: ${appointments.count}`);
  console.log(`- OPD visits: ${opdVisits.count}`);
  console.log(`- Patients: ${patients.count}`);
  console.log("Master data such as doctors, departments and investigations was preserved.");
}

main()
  .catch((error) => {
    console.error("Failed to clear patient data:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    void prisma.$disconnect();
  });
