# SAMS Push 6 — Functional Completion

## Scope
- Returning-patient identification/search before new registration.
- Complete supported billing flow using existing investigation/prescription billing foundations.
- Payment status and receipt workflow where supported by the existing schema.
- Treatment/rehabilitation workflow using existing encounter context.
- Clinical documentation and follow-up persistence.
- OPD/clinical navigation cleanup and major-button audit.
- Remove or complete Push 6 placeholders; no feature in this scope is considered complete if it is only decorative.

## Safety rules
- Preserve Patient -> OPDVisit -> ClinicalEncounter relationships.
- Do not create duplicate patient or encounter systems.
- Reuse existing APIs/schema before adding new models.
- Run TypeScript and production build before declaring Push 6 complete.
- Verify the complete patient journey before Push 7.

## Billing acceptance criteria
Patient/OPD context must be retained through charge creation, payment status, receipt and billing history. Existing investigation and prescription billing fields must be reused where applicable.

## Returning-patient acceptance criteria
Search must support available patient identifiers beyond name alone, show matching records, allow verification through the patient profile, and then allow a new OPD visit without creating a duplicate Patient record.

## No-placeholder rule
Do not leave "coming soon", "will be connected", fake save/generate buttons, or dead major routes in Push 6 scope. If a feature cannot be safely completed from the existing architecture, stop and report it rather than marking it complete.
