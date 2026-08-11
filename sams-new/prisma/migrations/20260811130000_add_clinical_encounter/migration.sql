-- Reconcile an existing ClinicalEncounter table created outside Prisma.
-- The table may already exist in local Codespaces databases.
CREATE TABLE IF NOT EXISTS "ClinicalEncounter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "encounterDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "speciality" TEXT,
    "chiefComplaint" TEXT,
    "diagnosis" TEXT,
    "clinicalNotes" TEXT,
    "treatmentPlan" TEXT,
    "followUpDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClinicalEncounter_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ClinicalEncounter_patientId_idx" ON "ClinicalEncounter"("patientId");
