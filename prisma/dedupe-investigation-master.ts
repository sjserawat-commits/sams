import { prisma } from "../lib/prisma";

function normalizeName(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function rank(row: { id: number; smsBenchmarkRate: number | null; corporateBenchmarkRate: number | null; rate: number }) {
  if (row.smsBenchmarkRate != null && row.smsBenchmarkRate > 0) return 4;
  if (row.corporateBenchmarkRate != null && row.corporateBenchmarkRate > 0) return 3;
  if (row.rate > 0) return 2;
  return 1;
}

async function main() {
  const rows = await prisma.investigationMaster.findMany({
    where: { active: true },
    orderBy: { id: "asc" },
  });

  const groups = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = normalizeName(row.name);
    if (!key) continue;
    const group = groups.get(key) ?? [];
    group.push(row);
    groups.set(key, group);
  }

  let removed = 0;
  let reassignedOrders = 0;

  for (const group of groups.values()) {
    if (group.length < 2) continue;

    group.sort((a, b) => {
      const rankDiff = rank(b) - rank(a);
      return rankDiff !== 0 ? rankDiff : a.id - b.id;
    });

    const winner = group[0];
    const duplicates = group.slice(1);

    for (const duplicate of duplicates) {
      const result = await prisma.investigationOrder.updateMany({
        where: { investigationId: duplicate.id },
        data: { investigationId: winner.id },
      });
      reassignedOrders += result.count;
      await prisma.investigationMaster.delete({ where: { id: duplicate.id } });
      removed += 1;
    }
  }

  const finalCount = await prisma.investigationMaster.count({ where: { active: true } });
  console.log(`Investigation Master dedupe complete: removed ${removed} duplicate names, reassigned ${reassignedOrders} orders, final active count ${finalCount}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
