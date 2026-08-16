import { prisma } from "../lib/prisma";

const expectedCategories = [
  "Advanced Imaging",
  "Allergy",
  "Audiology",
  "Autoimmunity",
  "Bacteriology",
  "Biochemistry",
  "Bone & Metabolic",
  "Cardiology",
  "Clinical Pathology",
  "Coagulation",
  "Cytology",
  "CT",
  "Dental",
  "Dermatology",
  "Electrodiagnosis",
  "Endocrinology",
  "ENT",
  "Gastroenterology",
  "Genetics",
  "Hematology",
  "Hematopathology",
  "Hepatology",
  "Histopathology",
  "Imaging",
  "Immunoassay",
  "Immunology",
  "Infectious Disease",
  "MRI",
  "Microbiology",
  "Molecular Diagnostics",
  "Nephrology",
  "Neurology",
  "Neurophysiology",
  "Nuclear Medicine",
  "Obstetrics & Gynecology",
  "Ophthalmology",
  "Orthopedics",
  "Pathology & Cytology",
  "Pediatrics",
  "Pulmonary",
  "Radiology",
  "Rheumatology",
  "Serology",
  "Sleep Medicine",
  "Toxicology",
  "Transfusion Medicine",
  "Tumor Markers",
  "Ultrasound",
  "Urology",
  "Vitamins & Nutrition",
];

async function main() {
  const rows = await prisma.investigationMaster.groupBy({
    by: ["category"],
    where: { active: true },
    _count: { _all: true },
    orderBy: { category: "asc" },
  });

  const total = await prisma.investigationMaster.count({ where: { active: true } });
  const counts = new Map(rows.map((r) => [r.category.trim().toLowerCase(), r._count._all]));
  const present = new Set(rows.map((r) => r.category.trim().toLowerCase()));
  const missing = expectedCategories.filter((c) => !present.has(c.toLowerCase()));

  console.log(`\nTOTAL ACTIVE INVESTIGATIONS: ${total}`);
  console.log(`ACTIVE CATEGORIES: ${rows.length}`);
  console.log("\nCATEGORY COVERAGE:");
  console.table(rows.map((r) => ({ category: r.category, count: r._count._all })));

  console.log("\nEXPECTED MAJOR CATEGORIES NOT PRESENT:");
  console.log(missing.length ? missing.join("\n") : "None");

  const lowCoverage = rows
    .filter((r) => r._count._all < 5)
    .map((r) => ({ category: r.category, count: r._count._all }));
  console.log("\nCATEGORIES WITH <5 ENTRIES (REVIEW FOR GAP):");
  console.table(lowCoverage);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
