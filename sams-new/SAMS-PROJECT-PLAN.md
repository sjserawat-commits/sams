# SAMS — Serawat Advanced Multispecialty Joint & Spine Center
## Project Plan and Development Baseline

## 1. Purpose

SAMS — Serawat Advanced Multispecialty Joint & Spine Center — is a modular hospital management and clinical information system designed to support hospital administration, patient management, clinical documentation, PM&R workflows, patient access, billing, analytics, and future expansion.

The system must prioritize:
- Patient safety
- Data integrity
- Security and privacy
- Reliable clinical workflows
- Maintainable architecture
- Clear and simple user interfaces
- Modular future expansion

---

## 2. Current Technology Direction

The current SAMS application is being developed as a modern web application with:

- Next.js / React
- TypeScript
- Prisma
- Database-backed application architecture
- Modular components
- Patient and clinical workflows
- GitHub repository and Codespace development environment

The existing repository is the source code that must be preserved and progressively improved.

---

## 3. Major SAMS Modules

The overall planned system includes:

### Core Platform
- Application dashboard
- Navigation
- Authentication
- User roles and permissions
- Hospital configuration
- System settings
- Audit and activity tracking

### Patient Management
- Patient registration
- Patient demographic information
- Patient identification
- Patient search
- Patient profile
- Patient history
- Clinical encounters
- Patient records

### Clinical System
- OPD workflow
- IPD workflow
- Clinical documentation
- Diagnoses
- Procedures
- Investigations
- Prescriptions
- Clinical notes
- Follow-up management

### PM&R Specialty System
SAMS includes dedicated Physical Medicine and Rehabilitation workflows.

The PM&R system is intended to support:
- Rehabilitation assessment
- Functional assessment
- Physical examination
- Disability/functional documentation
- Therapy planning
- Rehabilitation goals
- Physiotherapy-related workflows
- Occupational therapy-related workflows
- Speech/swallow-related workflows where applicable
- Assistive device documentation
- Follow-up and progress documentation
- Rehabilitation outcome tracking

The detailed clinical design must be implemented carefully and should not be invented by the AI agent without approval.

### Patient Portal
Planned functionality includes:
- Patient access
- Patient profile
- Appointments
- Clinical information as permitted
- Reports/documents
- Follow-up information
- Communication-related features as planned

### Billing
Planned functionality includes:
- Billing records
- Charges
- Payments
- Receipts
- Billing summaries
- Future integration with hospital financial workflows

### Analytics
Planned functionality includes:
- Dashboard statistics
- Patient statistics
- Clinical activity
- PM&R activity
- Billing analytics
- Operational reports
- Future customizable reports

---

## 4. Batch Development Direction

The SAMS project has been developed in planned batches.

The known planned areas include:

- Core SAMS platform
- Patient management
- Clinical workflows
- Additional hospital functionality
- Patient Portal
- Billing & Analytics
- PM&R specialty modules
- Final integration and deployment

Previously generated batch concepts should be treated as planned scope, but the actual repository implementation is the source of truth.

Do not assume that a previously planned batch has been fully implemented merely because it was planned or generated.

---

## 5. Database / Prisma Rules

Prisma is an important part of SAMS.

Before changing the Prisma schema:

1. Inspect the complete existing schema.
2. Identify existing models.
3. Identify existing relations.
4. Check for duplicate models.
5. Check field types and relation consistency.
6. Make the smallest safe change.
7. Run Prisma validation after changes.
8. Generate the Prisma client when appropriate.
9. Do not reset or wipe the database without explicit approval.

Database integrity is more important than speed.

Never solve a schema problem by deleting existing clinical or patient data.

---

## 6. Current Implementation Status

The repository already contains application code and folders including areas such as:

- app
- lib
- components
- prisma
- public
- package.json

The application has previously reached a working homepage/dashboard stage.

The current implementation must always be inspected before making assumptions about what exists.

---

## 7. Development Principles

### Preserve working functionality

Do not replace working functionality merely because a different implementation is preferred.

### Minimal safe changes

When fixing an error, make the smallest change that correctly solves the problem.

### Understand before modifying

Inspect related files before changing them.

### No speculative architecture

Do not introduce major architectural changes without approval.

### No destructive shortcuts

Never delete large parts of the project to solve an isolated problem.

### Validate continuously

After meaningful changes, use appropriate validation such as:
- TypeScript checks
- Prisma validation
- Build checks
- Tests
- Linting where configured

---

## 8. AI Agent Operating Rules

The AI agent must follow AGENTS.md.

The AI agent must:

1. Read this project plan.
2. Inspect the existing repository before coding.
3. Determine what is already implemented.
4. Distinguish planned functionality from implemented functionality.
5. Follow existing architecture unless an approved change is required.
6. Explain major problems before making major changes.
7. Avoid destructive operations.
8. Preserve patient and clinical data structures.
9. Validate its work.
10. Report exactly what it changed.

---

## 9. Changes Requiring Approval

The AI agent must ask for approval before:

- Changing the overall architecture
- Replacing the database technology
- Major Prisma schema redesign
- Removing database models
- Removing patient/clinical fields
- Resetting or wiping databases
- Changing authentication architecture
- Major security changes
- Removing existing modules
- Large-scale UI redesign
- Introducing major new dependencies
- Changing deployment architecture
- Making changes that could affect existing patient/clinical data

---

## 10. Clinical Safety

SAMS is intended for healthcare workflows.

The AI agent must not invent clinical protocols, medical decision rules, treatment algorithms, drug dosing, diagnostic criteria, or clinical recommendations and present them as approved SAMS functionality.

Clinical functionality must be explicitly designed and approved before implementation.

---

## 11. Security and Privacy

SAMS may handle sensitive healthcare information.

Development must prioritize:
- Authentication
- Authorization
- Role-based access
- Secure data handling
- Appropriate validation
- Auditability
- Protection against accidental data exposure

Do not expose secrets, credentials, tokens, API keys, or private patient information.

---

## 12. Deployment Direction

The project is being developed through GitHub and Codespaces.

Deployment must preserve:
- Database integrity
- Environment configuration
- Secrets
- Production safety
- Reproducible builds
- Reliable migrations

Never treat a successful local build as proof that production is safe.

---

## 13. Source of Truth

The following hierarchy should be used:

1. Explicit current user-approved instruction
2. SAMS-PROJECT-PLAN.md
3. AGENTS.md
4. Existing working repository architecture
5. Previously discussed or generated ideas

If there is a conflict, stop and ask for clarification rather than guessing.

---

## 14. Current Development Philosophy

SAMS should be developed incrementally.

The preferred workflow is:

INSPECT
→ UNDERSTAND
→ PROPOSE
→ APPROVE WHEN REQUIRED
→ IMPLEMENT
→ VALIDATE
→ REPORT

The goal is not simply to make the application run.

The goal is to build a stable, maintainable, secure, modular hospital system.

---

## 15. Future Expansion

The architecture should allow future addition of:
- More clinical specialties
- More rehabilitation services
- Additional hospital departments
- Advanced reporting
- Interoperability
- Notifications
- Appointment systems
- Document management
- Additional patient-facing services
- Additional analytics

Future functionality should be added modularly rather than through unnecessary rewrites.

---

## 16. Important Instruction

Never assume that a feature is approved merely because it appears in this document.

This document describes the project direction and baseline.

When implementation details are unclear, inspect the repository and ask for approval before making a major decision.
