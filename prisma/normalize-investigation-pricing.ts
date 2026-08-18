import { prisma } from "../lib/prisma";

const corporateDefaults: Record<string, number> = {
  Hematology: 220,
  Biochemistry: 450,
  Endocrinology: 700,
  "Vitamins & Nutrition": 700,
  Immunology: 900,
  Serology: 500,
  Microbiology: 600,
  Bacteriology: 600,
  "Clinical Pathology": 250,
  Histopathology: 900,
  Cytology: 700,
  "Molecular Diagnostics": 2500,
  Genetics: 3500,
  "Flow Cytometry": 2200,
  Immunohematology: 700,
  Cardiology: 1200,
  Pulmonary: 800,
  Radiology: 700,
  Ultrasound: 900,
  CT: 4500,
  MRI: 6500,
  Neurology: 1500,
  Neurophysiology: 1500,
  Electrodiagnosis: 1500,
};

async function main() {
  const rows = await prisma.investigationMaster.findMany();
  let smsPriced = 0;
  let corporatePriced = 0;
  let retained = 0;
  let provisional = 0;

  for (const row of rows) {
    const sms = Number(row.smsBenchmarkRate || 0);
    const corporate = Number(row.corporateBenchmarkRate || 0);

    if (sms > 0) {
      const rate = Math.max(1, Math.round(sms * 1.65));
      await prisma.investigationMaster.update({ where: { id: row.id }, data: { rate } });
      smsPriced++;
      continue;
    }

    if (corporate > 0) {
      const rate = Math.max(1, Math.round(corporate * 0.65));
      await prisma.investigationMaster.update({ where: { id: row.id }, data: { rate } });
      corporatePriced++;
      continue;
    }

    if (Number(row.rate || 0) > 0) {
      retained++;
      continue;
    }

    const benchmark = corporateDefaults[row.category] ?? 500;
    const rate = Math.max(1, Math.round(benchmark * 0.65));
    await prisma.investigationMaster.update({
      where: { id: row.id },
      data: { corporateBenchmarkRate: benchmark, rate },
    });
    provisional++;
  }

  const zeroCount = await prisma.investigationMaster.count({ where: { rate: { lte: 0 } } });
  const total = await prisma.investigationMaster.count();
  if (zeroCount > 0) throw new Error(`Pricing normalization failed: ${zeroCount} investigations still have zero/non-positive rates.`);

  console.log(`Investigation pricing normalized: total ${total}; SMS×1.65 ${smsPriced}; corporate×0.65 ${corporatePriced}; retained existing non-zero ${retained}; provisional category benchmark ${provisional}; zero rates ${zeroCount}.`);
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(async () => prisma.$disconnect());
