import { NextRequest, NextResponse } from "next/server";
import { audit, ensureAuthTables, verifySessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function actor(req: NextRequest) {
  const s = verifySessionCookie(req.cookies.get("sams_session")?.value);
  return s && ["SUPER_ADMIN", "ADMIN"].includes(s.role) ? s : null;
}

const defaults: Record<string, unknown> = {
  "centre.name": "Serawat Advanced Multispeciality Joint & Spine Centre",
  "centre.address": "",
  "centre.phone": "",
  "centre.email": "",
  "centre.gstin": "",
  "centre.website": "",
  "regional.currency": "INR",
  "regional.timezone": "Asia/Kolkata",
  "regional.dateFormat": "DD/MM/YYYY",
  "opd.defaultDuration": 15,
  "opd.slotInterval": 15,
  "opd.walkIn": true,
  "opd.tokenResetDaily": true,
  "appointment.allowBooking": true,
  "appointment.reminderHours": 24,
  "clinical.requireVisitCompletion": true,
  "clinical.allowBackdatedNotes": false,
  "clinical.requireDiagnosis": false,
  "investigation.requireVerification": true,
  "investigation.requireReportRelease": true,
  "billing.allowPartialPayment": true,
  "billing.allowOutstanding": true,
  "billing.defaultDiscount": 0,
  "billing.taxEnabled": false,
  "billing.taxRate": 0,
  "billing.currency": "INR",
  "invoice.prefix": "INV",
  "invoice.receiptPrefix": "RCT",
  "invoice.footer": "Thank you for choosing SAMS.",
  "documents.paperSize": "A4",
  "documents.showLogo": true,
  "documents.showSignature": true,
  "notifications.appointmentReminder": false,
  "notifications.followUpReminder": false,
  "notifications.paymentReceipt": false,
  "security.sessionMinutes": 60,
  "security.auditEnabled": true,
  "security.requireAdminForMasterChanges": true,
  "workflow.patientRegistration": "REGISTRATION → PATIENT PROFILE",
  "workflow.opdVisit": "REGISTRATION → OPD → TOKEN → CONSULTATION",
  "workflow.investigation": "ORDER → SAMPLE/PROCESSING → REPORT → RELEASE",
  "workflow.billing": "CHARGES → BILL → PAYMENT → RECEIPT → OUTSTANDING",
  "workflow.followUp": "VISIT → FOLLOW-UP DATE → APPOINTMENT",
};

export async function GET(req: NextRequest) {
  try {
    const s = actor(req); if (!s) return NextResponse.json({ error: "Administrator permission required." }, { status: 403 });
    await ensureAuthTables();
    const rows = await prisma.$queryRawUnsafe<Array<{ key: string; value: string }>>(`SELECT "key","value" FROM "SamsSetting" ORDER BY "key"`);
    const values: Record<string, unknown> = { ...defaults };
    for (const r of rows) { try { values[r.key] = JSON.parse(r.value); } catch { values[r.key] = r.value; } }
    const [departments, doctors, investigations] = await Promise.all([
      prisma.department.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, code: true, active: true } }),
      prisma.doctor.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, qualification: true, active: true, department: { select: { id: true, name: true, code: true } } } }),
      prisma.investigationMaster.findMany({ orderBy: { name: "asc" }, select: { id: true, code: true, name: true, category: true, rate: true, active: true } }),
    ]);
    return NextResponse.json({ values, references: { departments, doctors, investigations } });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Unable to load settings." }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  try {
    const s = actor(req); if (!s) return NextResponse.json({ error: "Administrator permission required." }, { status: 403 });
    await ensureAuthTables();
    const body = await req.json();
    const values = body?.values;
    if (!values || typeof values !== "object" || Array.isArray(values)) return NextResponse.json({ error: "Settings payload is invalid." }, { status: 400 });
    const allowed = new Set(Object.keys(defaults));
    for (const [key, value] of Object.entries(values as Record<string, unknown>)) {
      if (!allowed.has(key)) continue;
      await prisma.$executeRawUnsafe(`INSERT INTO "SamsSetting" ("key","value","updatedAt","updatedBy") VALUES (?,?,CURRENT_TIMESTAMP,?) ON CONFLICT("key") DO UPDATE SET "value"=excluded."value","updatedAt"=CURRENT_TIMESTAMP,"updatedBy"=excluded."updatedBy"`, key, JSON.stringify(value), s.username);
    }
    await audit(s.userId, s.username, "UPDATE", "SamsSetting", Object.keys(values).join(","));
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Unable to save settings." }, { status: 500 }); }
}
