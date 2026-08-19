import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing all patient-related transactional data...");

  // Delete child records first because several relations are not configured
  // with cascading deletes in the current Prisma schema.
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
    await prisma.$disconnect();
  });
