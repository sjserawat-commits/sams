# SAMS Safe Database Hardening Plan

## Safety rule
Do not change the production database provider or destructive schema until a backup, restore test, migration rehearsal, and end-to-end QA are complete.

## Current state
- Development database remains SQLite.
- Existing data must remain untouched during hardening.
- PostgreSQL migration is a staged future cutover, not an immediate provider switch.

## Phase 1 — Non-destructive hardening
1. Verify Prisma schema and relations.
2. Identify legacy ClinicalEncounter/Encounter dependencies.
3. Add safe application-level validation before schema-breaking changes.
4. Review money fields for Decimal migration.
5. Review Appointment -> Patient relation and migration impact.
6. Review InvestigationMaster change-request integrity and audit trail.
7. Define indexes from actual query patterns.
8. Define Visit/token uniqueness rules by date/session/department as appropriate.

## Phase 2 — Migration rehearsal
1. Create a disposable PostgreSQL staging database.
2. Generate a PostgreSQL-compatible Prisma schema in a migration branch.
3. Export a verified SQLite backup.
4. Import/copy representative data.
5. Validate row counts and relationships.
6. Validate billing totals and outstanding balances.
7. Validate patient, Visit, investigation and clinical history.
8. Run the complete patient journey.

## Phase 3 — Production cutover
Only after staging passes:
1. Announce maintenance window.
2. Take final SQLite backup and integrity check.
3. Run final migration.
4. Verify critical counts and financial totals.
5. Point application to PostgreSQL.
6. Smoke-test authentication, patients, Visits, investigations, billing and reports.
7. Keep the original SQLite backup unchanged for rollback.

## Rollback
If critical validation fails, stop release, restore the previous application/database configuration, and preserve the failed migration artifacts for diagnosis. Never delete the original backup during cutover.

## Do not do
- Do not run `prisma db push --force-reset` against production.
- Do not delete ClinicalEncounter records merely to enforce Visit terminology.
- Do not switch SQLite to PostgreSQL without a tested migration.
- Do not use Float for new monetary calculations where Decimal can be used safely.
