-- Add the missing speciality field to the existing ClinicalEncounter table.
ALTER TABLE "ClinicalEncounter" ADD COLUMN "speciality" TEXT;
