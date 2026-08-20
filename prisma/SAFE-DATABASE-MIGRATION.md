# SAMS Safe Database Migration Plan

## Current state

SAMS currently uses SQLite through Prisma. Do **not** switch the production database provider directly in the active application branch.

## Safety rules

1. Keep the current SQLite schema and production data intact until a migration has been rehearsed successfully.
2. Create a verified SQLite backup before every schema/data migration.
3. Perform PostgreSQL work in a separate staging environment first.
4. Never run destructive `prisma db push` operations against production data.
5. Compare record counts and financial totals after migration.
6. Test the complete patient journey before production cutover.
7. Keep the last known-good SQLite backup available for rollback.

## Migration sequence

`SQLite backup -> schema review -> PostgreSQL staging -> data migration rehearsal -> integrity checks -> application QA -> production cutover -> rollback window`

## Known schema items requiring controlled migration

- Patient <-> Appointment relation should be made explicit.
- `ClinicalEncounter` is still present internally while `OPDVisit` is the current Visit model; do not delete the legacy model until data dependencies are mapped.
- Billing amounts currently use `Float`; monetary representation must be changed only through a tested migration strategy.
- Investigation master change requests need a proper foreign-key relationship and audit lifecycle.
- Query indexes should be added based on actual patient, Visit, billing and investigation access patterns.
- Status strings should be normalized through application-level constants/enums before database constraints are introduced.

## Verification checklist

- [ ] Backup exists and size verifies.
- [ ] Patient count matches.
- [ ] Appointment count matches.
- [ ] Visit count matches.
- [ ] Investigation order count matches.
- [ ] Prescription count matches.
- [ ] Billing record count matches.
- [ ] Billing line-item count matches.
- [ ] Outstanding balance totals match.
- [ ] Full Visit workflow passes.
- [ ] Billing/payment workflow passes.
- [ ] Admin permissions pass.
- [ ] Production build passes.

This document intentionally does not change the active SQLite schema. The purpose of this phase is to make the eventual PostgreSQL migration reversible and testable.
