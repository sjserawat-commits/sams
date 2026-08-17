# SAMS — AI Agent Instructions

## Core rule
This repository is the Smart Advanced Medical System (SAMS).
Always follow the SAMS project plan and preserve existing working functionality.

## Before changing code
1. Inspect the existing code first.
2. Understand the current architecture before modifying it.
3. Do not assume a file or module is missing just because it is not where expected.
4. Check related files, database schema, routes, and components before making changes.

## Safety rules
- Do not delete working features to solve an error.
- Do not rewrite the application unnecessarily.
- Do not change the overall architecture without approval.
- Do not make destructive database operations without approval.
- Do not reset, wipe, or recreate the database unless explicitly authorized.
- Do not remove existing database models or fields without approval.
- Preserve existing patient and clinical data structures unless a planned migration is required.
- Never use destructive commands such as rm -rf on the project without explicit approval.

## Development workflow
For every significant task:
1. Inspect.
2. Explain the problem.
3. Propose the smallest safe solution.
4. Implement only the approved scope.
5. Run validation/tests/build checks.
6. Report exactly what changed and whether validation passed.

## SAMS priorities
Patient safety, data integrity, reliability, maintainability, security, and clear clinical workflows take priority over cosmetic changes.

## Prisma
Before changing prisma/schema.prisma:
- Inspect the complete schema.
- Check existing models and relations.
- Avoid duplicate model definitions.
- Validate the schema after changes.
- Do not destroy or reset production-like data.

## Scope control
If a request conflicts with the SAMS project plan, stop and explain the conflict before making the change.

If a major architectural, database, authentication, security, or data-model decision is required, ask for approval before proceeding.

## Communication
Keep explanations concise and practical.
When an error occurs, diagnose the actual error before proposing a fix.
Do not hide errors or claim success when validation has failed.
