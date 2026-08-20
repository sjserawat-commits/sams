import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

export type SamsRole = "SUPER_ADMIN" | "ADMIN" | "DOCTOR" | "RECEPTION" | "BILLING" | "CLINICAL" | "LAB" | "PATIENT";

export const ROLE_PERMISSIONS: Record<SamsRole, string[]> = {
  SUPER_ADMIN: ["*"], ADMIN: ["admin.read", "admin.write", "users.manage", "masters.manage", "reports.read", "audit.read"],
  DOCTOR: ["patient.read", "patient.write", "visit.read", "visit.write", "clinical.read", "clinical.write", "prescription.write", "investigation.write"],
  RECEPTION: ["patient.read", "patient.write", "visit.read", "visit.write", "appointment.write"],
  BILLING: ["patient.read", "visit.read", "billing.read", "billing.write", "payment.write", "receipt.read"],
  CLINICAL: ["patient.read", "visit.read", "clinical.read", "clinical.write", "investigation.write", "prescription.write"],
  LAB: ["patient.read", "visit.read", "investigation.read", "investigation.write", "result.write"],
  PATIENT: ["patient.self", "appointment.self", "report.self"],
};

export async function ensureAuthTables() {
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "SamsUser" ("id" INTEGER PRIMARY KEY AUTOINCREMENT,"username" TEXT NOT NULL UNIQUE,"displayName" TEXT NOT NULL,"passwordHash" TEXT NOT NULL,"recoveryKeyHash" TEXT,"role" TEXT NOT NULL,"departmentId" TEXT,"doctorId" TEXT,"forcePasswordChange" BOOLEAN NOT NULL DEFAULT 0,"active" BOOLEAN NOT NULL DEFAULT 1,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  for (const sql of [`ALTER TABLE "SamsUser" ADD COLUMN "recoveryKeyHash" TEXT`,`ALTER TABLE "SamsUser" ADD COLUMN "departmentId" TEXT`,`ALTER TABLE "SamsUser" ADD COLUMN "doctorId" TEXT`,`ALTER TABLE "SamsUser" ADD COLUMN "forcePasswordChange" BOOLEAN NOT NULL DEFAULT 0`]) { try { await prisma.$executeRawUnsafe(sql); } catch {} }
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "SamsSession" ("id" TEXT PRIMARY KEY,"userId" INTEGER NOT NULL,"expiresAt" DATETIME NOT NULL,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "SamsAuditLog" ("id" INTEGER PRIMARY KEY AUTOINCREMENT,"userId" INTEGER,"username" TEXT,"action" TEXT NOT NULL,"resource" TEXT NOT NULL,"details" TEXT,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "SamsSetting" ("key" TEXT PRIMARY KEY,"value" TEXT NOT NULL,"updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedBy" TEXT)`);
}
export function hashPassword(password: string) { const salt = crypto.randomBytes(16).toString("hex"); const hash = crypto.scryptSync(password, salt, 64).toString("hex"); return `${salt}:${hash}`; }
export function verifyPassword(password: string, stored: string) { try { const [salt, expected] = stored.split(":"); if (!salt || !expected) return false; const actual = crypto.scryptSync(password, salt, 64).toString("hex"); return crypto.timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex")); } catch { return false; } }
export function generateTemporaryPassword(length = 14) { const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%"; const bytes = crypto.randomBytes(length); return Array.from(bytes, b => alphabet[b % alphabet.length]).join(""); }
export function generateRecoveryKey() { return `SAMS-${crypto.randomBytes(18).toString("base64url")}`; }
export function permissionsFor(role: SamsRole) { return ROLE_PERMISSIONS[role] ?? []; }
export function can(role: SamsRole, permission: string) { const p = permissionsFor(role); return p.includes("*") || p.includes(permission); }
export function sessionCookieValue(userId: number, username: string, role: SamsRole, expiresAt: number, sessionId?: string) { const secret = process.env.SAMS_SESSION_SECRET; if (!secret) throw new Error("SAMS_SESSION_SECRET is not configured."); const payload = Buffer.from(JSON.stringify({ userId, username, role, exp: expiresAt, sid: sessionId ?? crypto.randomUUID() })).toString("base64url"); const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64url"); return `${payload}.${sig}`; }
export function verifySessionCookie(value: string | undefined) { try { const secret = process.env.SAMS_SESSION_SECRET; if (!secret || !value) return null; const [payload, sig] = value.split("."); if (!payload || !sig) return null; const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url"); if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null; const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { userId:number; username:string; role:SamsRole; exp:number; sid?:string }; if (!data.exp || Date.now() >= data.exp) return null; return data; } catch { return null; } }
export async function audit(userId: number | null, username: string | null, action: string, resource: string, details?: string) { await ensureAuthTables(); await prisma.$executeRawUnsafe(`INSERT INTO "SamsAuditLog" ("userId","username","action","resource","details") VALUES (?,?,?,?,?)`, userId, username, action, resource, details ?? null); }
