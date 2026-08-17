import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

const departments = [
  { id: 1, name: "Cardiology", code: "CARD" },
  { id: 2, name: "Cardiothoracic & Vascular Surgery (CTVS)", code: "CTVS" },
  { id: 3, name: "Clinical Immunology & Rheumatology", code: "CIR" },
  { id: 4, name: "Dental Surgery", code: "DENT" },
  { id: 5, name: "Dermatology & Venereology", code: "DERM" },
  { id: 6, name: "Emergency Medicine", code: "EM" },
  { id: 7, name: "Endocrinology", code: "ENDO" },
  { id: 8, name: "ENT", code: "ENT" },
  { id: 9, name: "Gastroenterology", code: "GASTRO" },
  { id: 10, name: "General Medicine", code: "MED" },
  { id: 11, name: "General Surgery", code: "SURG" },
  { id: 12, name: "Hepato-Pancreato-Biliary Surgery", code: "HPB" },
  { id: 13, name: "Immunohematology & Blood Transfusion", code: "IHBT" },
  { id: 14, name: "Microbiology", code: "MICRO" },
  { id: 15, name: "Nephrology", code: "NEPH" },
  { id: 16, name: "Neurology", code: "NEURO" },
  { id: 17, name: "Neurosurgery", code: "NS" },
  { id: 18, name: "Obstetrics & Gynaecology", code: "OBGYN" },
  { id: 19, name: "Ophthalmology", code: "OPHTH" },
  { id: 20, name: "Orthopaedics", code: "ORTHO" },
  { id: 21, name: "Paediatrics", code: "PEDS" },
  { id: 22, name: "Pathology", code: "PATH" },
  { id: 23, name: "Physical Medicine & Rehabilitation", code: "PMR" },
  { id: 24, name: "Plastic & Reconstructive Surgery", code: "PLAST" },
  { id: 25, name: "Psychiatry", code: "PSYCH" },
  { id: 26, name: "Radiology / Radio-diagnosis", code: "RAD" },
  { id: 27, name: "Respiratory Medicine / Pulmonology", code: "RESP" },
  { id: 28, name: "Urology", code: "URO" },
];

const consultants = [
  {
    id: 1,
    name: "Dr Suraj Serawat",
    qualification: "MD PM&R",
    departmentId: 23,
  },
  {
    id: 2,
    name: "Dr Pinki Natwadiya",
    qualification: undefined,
    departmentId: 27,
  },
];

async function main() {
  for (const department of departments) {
    await prisma.department.upsert({
      where: { id: department.id },
      update: {
        name: department.name,
        code: department.code,
        active: true,
      },
      create: {
        id: department.id,
        name: department.name,
        code: department.code,
        active: true,
      },
    });
  }

  for (const consultant of consultants) {
    await prisma.doctor.upsert({
      where: { id: consultant.id },
      update: {
        name: consultant.name,
        qualification: consultant.qualification,
        departmentId: consultant.departmentId,
        active: true,
      },
      create: {
        id: consultant.id,
        name: consultant.name,
        qualification: consultant.qualification,
        departmentId: consultant.departmentId,
        active: true,
      },
    });
  }

  console.log(`Department master synced: ${departments.length}`);
  console.log(`Consultant master synced: ${consultants.length}`);
  console.log("Consultant → department mappings: PM&R → Dr Suraj Serawat; Respiratory Medicine → Dr Pinki Natwadiya");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
