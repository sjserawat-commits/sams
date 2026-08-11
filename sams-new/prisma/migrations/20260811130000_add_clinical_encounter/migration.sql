-- Reconcile the existing ClinicalEncounter table used by SAMS.
-- This migration adds the missing Visit speciality field without deleting data.
ALTER TABLE "ClinicalEncounter" ADD COLUMN "speciality" TEXT;

CREATE INDEX IF NOT EXISTS "ClinicalEncounter_patientId_idx" ON "ClinicalEncounter"("patientId");
