/**
 * Certificate signature.
 *
 * Each certificate gets a HMAC-SHA256 over its canonical fields, signed
 * with CERT_SECRET (a server-side env var). To verify, recompute and compare.
 * If the DB is tampered with, the recomputed signature won't match.
 *
 * Anyone can hit /verify/cert/[code] to confirm authenticity — the page
 * recomputes the signature server-side and reports verified=true|false.
 */
import { createHmac } from "node:crypto";

export interface CertFields {
  id: string;
  userId: string;
  roadmapId: string;
  title: string;
  totalTasks: number;
  totalHours: number;
  passRate: number;
  issuedAt: Date;
}

function canonical(c: CertFields): string {
  return [
    c.id,
    c.userId,
    c.roadmapId,
    c.title,
    c.totalTasks.toString(),
    c.totalHours.toFixed(2),
    c.passRate.toFixed(4),
    c.issuedAt.toISOString(),
  ].join("|");
}

function secret(): string {
  const s = process.env.CERT_SECRET;
  if (!s) {
    // Fall back to NEXTAUTH_SECRET / AUTH_SECRET so we always have signing
    // material — never blow up cert issuance because of a missing env.
    return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "forge-cert-fallback";
  }
  return s;
}

export function signCert(c: CertFields): string {
  return createHmac("sha256", secret()).update(canonical(c)).digest("hex");
}

export function verifyCertSignature(c: CertFields, signature: string): boolean {
  const expected = signCert(c);
  // Constant-time compare to avoid timing leaks. crypto.timingSafeEqual
  // requires equal-length buffers, so guard length first.
  if (expected.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}
