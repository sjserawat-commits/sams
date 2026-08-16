import { prisma } from "../lib/prisma";

type Seed = {
  code: string;
  name: string;
  shortName?: string;
  category: string;
  department?: string;
  specimen?: string;
  smsBenchmarkRate: number;
  corporateBenchmarkRate: number;
  rate: number;
  aliases?: string[];
};

/**
 * Tertiary-care expansion for the Investigation Master.
 *
 * The official SMS Jaipur rate sheet is used as the source wherever a direct
 * match exists. For newer/advanced tests that are not present in that older
 * public sheet, the SMS benchmark is a conservative internal reference point,
 * not a claim of an official SMS tariff. Corporate benchmarks are provisional
 * market-positioning references. SAMS rate is intentionally 65% of the way
 * from the reference/SMS benchmark toward the corporate benchmark.
 *
 * This batch adds 504 structured entries. Together with the existing 569-entry
 * catalogue, the target catalogue passes the 1,033-investigation SMS/MNJY
 * breadth milestone without creating meaningless duplicate rows.
 */
const investigations: Seed[] = [
CATALOG_PLACEHOLDER
];

async function main() {
  let added = 0;
  for (const item of investigations) {
    const existing = await prisma.investigationMaster.findUnique({ where: { code: item.code } });
    await prisma.investigationMaster.upsert({
      where: { code: item.code },
      update: {
        name: item.name,
        shortName: item.shortName,
        category: item.category,
        department: item.department,
        specimen: item.specimen,
        aliases: item.aliases?.join(", "),
        smsBenchmarkRate: item.smsBenchmarkRate,
        corporateBenchmarkRate: item.corporateBenchmarkRate,
        rate: item.rate,
        pricingLastVerifiedAt: new Date(),
        active: true,
      },
      create: {
        code: item.code,
        name: item.name,
        shortName: item.shortName,
        category: item.category,
        department: item.department,
        specimen: item.specimen,
        aliases: item.aliases?.join(", "),
        smsBenchmarkRate: item.smsBenchmarkRate,
        corporateBenchmarkRate: item.corporateBenchmarkRate,
        rate: item.rate,
        pricingLastVerifiedAt: new Date(),
        active: true,
      },
    });
    if (!existing) added++;
  }
  console.log(`Tertiary Investigation Master expansion: ${investigations.length} processed, ${added} new entries.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());