-- Add identity and contact fields used by the Register New Patient workflow.
ALTER TABLE "Patient" ADD COLUMN "aadhaarNumber" TEXT;
ALTER TABLE "Patient" ADD COLUMN "emergencyContact" TEXT;
CREATE UNIQUE INDEX "Patient_aadhaarNumber_key" ON "Patient"("aadhaarNumber");
