import { prisma } from "../lib/prisma";

/**
 * Keeps the first InvestigationMaster row for each normalized investigation name.
 * Duplicate rows are merged safely: existing InvestigationOrder records are moved
 * to the retained master row before the duplicate master rows are removed.
 *
 * Normalization is intentionally conservative: case, repeated whitespace and
 * punctuation differences are treated as the same name. Distinct variants such
 * as "X-Ray Knee" and "X-Ray Knee AP/Lateral" remain separate.
 */
function normalizeName(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  const rows = await prisma.investigationMaster.findMany({
    select: { id: true, name: true },
    orderBy: { id: "asc" },
  });

  const groups = new Map<string, number[]>();
  for (const row of rows) {
    const key = normalizeName(row.name);
    const ids = groups.get(key) ?? [];
    ids.push(row.id);
    groups.set(key, ids);
  }

  let duplicateRows = 0;
  let mergedGroups = 0;

  for (const ids of groups.values()) {
    if (ids.length < 2) continue;
    const keeper = ids[0];
    const duplicates = ids.slice(1);
    mergedGroups += 1;
    duplicateRows += duplicates.length;

    await prisma.$transaction(async (tx) => {
      for (const duplicateId of duplicates) {
        await tx.investigationOrder.updateMany({
          where: { investigationId: duplicateId },
          data: { investigationId: keeper },
        });
        await tx.investigationMaster.delete({ where: { id: duplicateId } });
      }
    });
  }

  const remaining = await prisma.investigationMaster.count({ where: { active: true } });
  console.log(`Investigation Master dedupe: groups=${mergedGroups}, removed=${duplicateRows}, final=${remaining}`);
}

main()
  .catch((error) => {
    console.error("Investigation Master dedupe failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
