"use client";

/**
 * CertificateCard — The Forge's premium certificate artwork.
 *
 * Design language: luxury editorial. Warm cream parchment, restrained gold
 * rules, Cormorant Garamond for display, Dancing Script for the signature.
 * Zero stats on the artwork — stats belong on the verification page only.
 *
 * Print-ready: @media print targets #cert-card and forces A4 landscape.
 * Download is always window.print() — zero extra dependencies.
 *
 * Consumed by:
 *   /verify/cert/[code]                      — public cert page
 *   /dashboard/mentor/[menteeId]/preview-cert — mentor preview
 *   MentorCertReleaseCard                    — collapsed inline preview
 */

import { QRCodeSVG } from "qrcode.react";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CertificateCardProps {
  learnerName: string;
  programName: string;
  /** Pre-formatted display date, e.g. "May 28, 2026" */
  issueDate: string;
  /** Display cert ID, e.g. "TF-2026-A3F9C281" */
  certId: string;
  mentorName: string;
  mentorTitle: string;
  /** Without https://, e.g. "forge-ab.vercel.app/verify/cert/xyz" */
  verifyUrl: string;
  /** "Cohort 4" — empty string hides this line */
  cohort: string;
  curriculumYear: string;
  /** Short hash for display, e.g. "a3f9c2…e81d" */
  cryptoHash: string;
  preview?: boolean;
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const GOLD     = "#B8952A";
const GOLD_RICH = "#9c7d21";
const GOLD_DIM = "rgba(184,149,42,0.35)";
const PAPER    = "#FAF8F3";
const INK      = "#1A1A1A";
const MUTED    = "#6B6B6B";

// ─── Google Fonts (self-contained — loaded inside the component) ───────────────

const GOOGLE_FONTS_CSS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Dancing+Script:wght@600;700&family=Inter:wght@300;400;500;600&display=swap');`;

// ─── Print CSS ─────────────────────────────────────────────────────────────────

const PRINT_CSS = `
@media print {
  @page { size: A4 landscape; margin: 0; }
  body * { visibility: hidden !important; }
  #cert-card, #cert-card * { visibility: visible !important; }
  #cert-card {
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    max-width: none !important;
    margin: 0 !important;
    aspect-ratio: auto !important;
    box-shadow: none !important;
  }
}`;

// ─── Corner bracket ornament ──────────────────────────────────────────────────

function CornerMark({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const deg = { tl: 0, tr: 90, br: 180, bl: 270 }[pos];
  const style: React.CSSProperties = {
    position: "absolute",
    ...(pos === "tl" || pos === "tr" ? { top: "2.4%" } : { bottom: "2.4%" }),
    ...(pos === "tl" || pos === "bl" ? { left: "2%" } : { right: "2%" }),
    transform: `rotate(${deg}deg)`,
    pointerEvents: "none",
    zIndex: 1,
  };
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" style={style} aria-hidden>
      {/* Outer L bracket */}
      <path
        d="M 2 2 L 44 2 M 2 2 L 2 44"
        stroke={GOLD}
        strokeWidth="1.6"
        fill="none"
      />
      {/* Inner parallel rule */}
      <path
        d="M 8 8 L 38 8 M 8 8 L 8 38"
        stroke={GOLD}
        strokeWidth="0.6"
        fill="none"
        opacity="0.55"
      />
      {/* Corner anchor */}
      <circle cx="2" cy="2" r="2.4" fill={GOLD} />
      {/* Hairline detail */}
      <path
        d="M 18 2 L 18 5 M 24 2 L 24 5 M 30 2 L 30 5 M 2 18 L 5 18 M 2 24 L 5 24 M 2 30 L 5 30"
        stroke={GOLD}
        strokeWidth="0.8"
        opacity="0.7"
      />
    </svg>
  );
}

// ─── SVG Seal ─────────────────────────────────────────────────────────────────

function ForgeSeal() {
  // Full clockwise circle starting at W (9 o'clock).
  // 75% offset = 12 o'clock (top). textAnchor="middle" centres text there.
  const sealPath = "M 50 50 m -42,0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0";
  const innerArc = "M 50 50 m -34,0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0";
  return (
    <svg width="120" height="120" viewBox="0 0 100 100" aria-label="The Forge seal">
      {/* Outer disc — very faint gold tint, NOT pure paper, so it reads as a stamp */}
      <circle cx="50" cy="50" r="48" fill="rgba(184,149,42,0.06)" />
      {/* Outer ring */}
      <circle cx="50" cy="50" r="46.5" fill="none" stroke={GOLD} strokeWidth="1.4" />
      {/* Hairline inner ring */}
      <circle cx="50" cy="50" r="38.5" fill="none" stroke={GOLD} strokeWidth="0.6" opacity="0.55" />
      {/* Innermost emblem disc */}
      <circle cx="50" cy="50" r="22" fill="rgba(184,149,42,0.08)" stroke={GOLD} strokeWidth="0.5" opacity="0.7" />

      {/* Decorative tick marks around the ring (12 ticks) */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
        const r1 = 41, r2 = 44;
        const x1 = 50 + r1 * Math.cos(angle), y1 = 50 + r1 * Math.sin(angle);
        const x2 = 50 + r2 * Math.cos(angle), y2 = 50 + r2 * Math.sin(angle);
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={GOLD} strokeWidth="0.7" opacity="0.55" />
        );
      })}

      {/* 5-pointed star (the forge mark) */}
      <path
        d="M50 36.5 L52.4 44 L60.3 44 L53.95 48.6 L56.35 56.1 L50 51.5 L43.65 56.1 L46.05 48.6 L39.7 44 L47.6 44 Z"
        fill={GOLD}
      />

      {/* Circular text — clockwise path, 25% offset = TOP (N) so it reads right-side-up. */}
      <defs>
        <path id="sealRing" d={sealPath} />
        <path id="sealInner" d={innerArc} />
      </defs>
      <text
        fontFamily="'Inter', sans-serif"
        fontSize="5"
        letterSpacing="3"
        fill={GOLD}
        fontWeight="700"
      >
        <textPath href="#sealRing" startOffset="25%" textAnchor="middle">
          ★  THE FORGE  ·  VERIFIED  ·  AUTHENTIC  ★
        </textPath>
      </text>
      {/* "EST 2026" sits inside the ring, plain text, not on the arc — guaranteed legible. */}
      <text
        x="50"
        y="72"
        textAnchor="middle"
        fontFamily="'Inter', sans-serif"
        fontSize="3.6"
        letterSpacing="2.5"
        fill={GOLD}
        fontWeight="600"
        opacity="0.8"
      >
        EST · 2026
      </text>
    </svg>
  );
}

// ─── Lock icon ────────────────────────────────────────────────────────────────

function LockIcon() {
  return (
    <svg width="9" height="11" viewBox="0 0 9 11" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <rect x="0.75" y="4.25" width="7.5" height="6.25" rx="1.25" stroke={GOLD} strokeWidth="1" />
      <path d="M2.5 4.25V3.25C2.5 2.15 3.37 1.25 4.5 1.25C5.63 1.25 6.5 2.15 6.5 3.25V4.25" stroke={GOLD} strokeWidth="1" />
      <circle cx="4.5" cy="7.5" r="1.1" fill={GOLD} />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CertificateCard({
  learnerName,
  programName,
  issueDate,
  certId,
  mentorName,
  mentorTitle,
  verifyUrl,
  cohort,
  curriculumYear,
  cryptoHash,
  preview,
}: CertificateCardProps) {
  const showCohortLine = cohort.trim().length > 0;

  return (
    <>
      {/* Fonts + print CSS — both loaded in-component for full portability */}
      <style dangerouslySetInnerHTML={{ __html: GOOGLE_FONTS_CSS }} />
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div
        id="cert-card"
        style={{
          position: "relative",
          aspectRatio: "297 / 210",       /* A4 landscape */
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          background: PAPER,
          color: INK,
          overflow: "hidden",
          fontFamily: "'Inter', -apple-system, sans-serif",
          boxSizing: "border-box",
          /* Flat, no shadows — credibility over ornamentation */
          outline: `1px solid ${GOLD_DIM}`,
        }}
      >
        {/* ── Double border rule for depth ── */}
        <div style={{
          position: "absolute",
          inset: "1.4%",
          border: `1.5px solid ${GOLD}`,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          inset: "2.4%",
          border: `1px solid ${GOLD_DIM}`,
          pointerEvents: "none",
        }} />

        {/* ── Corner ornaments ── */}
        <CornerMark pos="tl" />
        <CornerMark pos="tr" />
        <CornerMark pos="bl" />
        <CornerMark pos="br" />

        {/* ── Content column ── */}
        <div style={{
          position: "relative",
          height: "100%",
          padding: "3.2% 7%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}>

          {/* ─────────────────────────────────────────
              1. HEADER
          ───────────────────────────────────────── */}
          <div style={{ textAlign: "center", width: "100%" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.875rem",
              marginBottom: "0.625rem",
            }}>
              {/* Left ornament */}
              <div style={{ width: 32, height: 1, background: GOLD }} />
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path d="M12 2 L14.5 9.5 L22 9.5 L15.75 14 L18.25 21.5 L12 17 L5.75 21.5 L8.25 14 L2 9.5 L9.5 9.5 Z" fill={GOLD} />
              </svg>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.6875rem",
                fontWeight: 700,
                letterSpacing: "0.55em",
                color: GOLD_RICH,
                textTransform: "uppercase",
                paddingLeft: "0.55em",
              }}>
                The Forge
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path d="M12 2 L14.5 9.5 L22 9.5 L15.75 14 L18.25 21.5 L12 17 L5.75 21.5 L8.25 14 L2 9.5 L9.5 9.5 Z" fill={GOLD} />
              </svg>
              {/* Right ornament */}
              <div style={{ width: 32, height: 1, background: GOLD }} />
            </div>
            {/* Certificate of Completion */}
            <div style={{
              fontFamily: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: "2.125rem",
              color: INK,
              letterSpacing: "0.015em",
              lineHeight: 1,
              marginTop: "0.5rem",
            }}>
              Certificate of Completion
            </div>
          </div>

          {/* ─────────────────────────────────────────
              2. BODY — the hero block
          ───────────────────────────────────────── */}
          <div style={{
            textAlign: "center",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.45rem",
          }}>
            {/* THIS IS TO CERTIFY THAT */}
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.5625rem",
              fontWeight: 500,
              letterSpacing: "0.3em",
              color: MUTED,
              textTransform: "uppercase",
            }}>
              This is to certify that
            </div>

            {/* ── LEARNER NAME — the hero element ── */}
            <div style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 700,
              fontSize: "3.4rem",
              color: INK,
              letterSpacing: "0.02em",
              lineHeight: 1.05,
              wordBreak: "break-word",
            }}>
              {learnerName}
            </div>

            {/* Achievement statement */}
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.625rem",
              fontWeight: 400,
              color: MUTED,
              letterSpacing: "0.06em",
            }}>
              has successfully completed the rigorous program in
            </div>

            {/* Program name */}
            <div style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "2rem",
              color: GOLD_RICH,
              letterSpacing: "0.02em",
              lineHeight: 1.1,
            }}>
              {programName}
            </div>

            {/* Cohort + year */}
            {showCohortLine && (
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.5rem",
                fontWeight: 400,
                color: MUTED,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                marginTop: "0.1rem",
              }}>
                {cohort} · {curriculumYear} Curriculum
              </div>
            )}
            {!showCohortLine && (
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.5rem",
                fontWeight: 400,
                color: MUTED,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                marginTop: "0.1rem",
              }}>
                {curriculumYear} Curriculum
              </div>
            )}
          </div>

          {/* ─────────────────────────────────────────
              3. DIVIDER
          ───────────────────────────────────────── */}
          <div style={{
            width: "88%",
            height: 1,
            background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)`,
          }} />

          {/* ─────────────────────────────────────────
              4. BOTTOM ROW — date | seal | signature
          ───────────────────────────────────────── */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            gap: "1rem",
          }}>
            {/* Left: Date */}
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: "italic",
                fontSize: "0.875rem",
                color: INK,
                borderBottom: `1px solid ${INK}`,
                paddingBottom: "0.2rem",
                marginBottom: "0.3rem",
                display: "inline-block",
                minWidth: "8rem",
                letterSpacing: "0.02em",
              }}>
                {issueDate}
              </div>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.4375rem",
                fontWeight: 500,
                letterSpacing: "0.28em",
                color: MUTED,
                textTransform: "uppercase",
                display: "block",
              }}>
                Issued
              </div>
            </div>

            {/* Center: Seal */}
            <div style={{ flexShrink: 0 }}>
              <ForgeSeal />
            </div>

            {/* Right: Signature */}
            <div style={{ flex: 1, textAlign: "right" }}>
              <div style={{
                fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
                fontSize: "1.625rem",
                fontWeight: 700,
                color: INK,
                lineHeight: 1.1,
                borderBottom: `1px solid ${INK}`,
                paddingBottom: "0.2rem",
                marginBottom: "0.3rem",
                display: "inline-block",
                minWidth: "9rem",
                textAlign: "center",
              }}>
                {mentorName}
              </div>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.4375rem",
                fontWeight: 400,
                letterSpacing: "0.14em",
                color: MUTED,
                textTransform: "uppercase",
                display: "block",
              }}>
                {mentorTitle}
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────
              5. FOOTER STRIP — certId | QR | crypto
          ───────────────────────────────────────── */}
          <div style={{
            width: "100%",
            borderTop: `1px solid ${GOLD_DIM}`,
            paddingTop: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
          }}>
            {/* Left: Cert ID */}
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}>
              <LockIcon />
              <span style={{
                fontFamily: "'JetBrains Mono', 'Courier New', 'Lucida Console', monospace",
                fontSize: "0.5rem",
                fontWeight: 600,
                color: GOLD,
                letterSpacing: "0.1em",
              }}>
                {certId}
              </span>
            </div>

            {/* Center: QR code */}
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <QRCodeSVG
                value={`https://${verifyUrl}`}
                size={54}
                bgColor={PAPER}
                fgColor={INK}
                level="M"
              />
            </div>

            {/* Right: Crypto hash + URL */}
            <div style={{ flex: 1, textAlign: "right" }}>
              <div style={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: "0.4375rem",
                fontWeight: 500,
                color: MUTED,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "0.25rem",
              }}>
                Cryptographically signed · {cryptoHash}
              </div>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.4375rem",
                fontWeight: 400,
                color: MUTED,
                letterSpacing: "0.06em",
              }}>
                {verifyUrl}
              </div>
            </div>
          </div>

        </div>{/* /content column */}

        {/* ── PREVIEW stamp — small, top-right, like a real "DRAFT" stamp ── */}
        {preview && (
          <div style={{
            position: "absolute",
            top: "5%",
            right: "5%",
            transform: "rotate(-8deg)",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.75rem",
            fontWeight: 800,
            color: "rgba(180,30,30,0.55)",
            letterSpacing: "0.3em",
            border: "2px solid rgba(180,30,30,0.45)",
            padding: "0.3rem 0.85rem",
            borderRadius: 4,
            pointerEvents: "none",
            background: "rgba(180,30,30,0.04)",
            zIndex: 2,
          }}>
            PREVIEW
          </div>
        )}

      </div>
    </>
  );
}

// ─── Companion exports (used by verify + preview pages) ───────────────────────

/**
 * Drop <CertificatePrintStyles/> in any page that has a <CertificateCard/>
 * so window.print() always produces the right output even if the component
 * hasn't mounted yet (SSR pages).
 */
export function CertificatePrintStyles() {
  return <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />;
}

export function DownloadCertButton({ label = "Download / Print" }: { label?: string; verifyCode?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.625rem 1.125rem",
        background: GOLD,
        color: "#000",
        border: "none",
        borderRadius: 6,
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.75rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        cursor: "pointer",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {label}
    </button>
  );
}

// ─── Helper: build CertificateCardProps from a Certificate DB row ─────────────

/**
 * Derive all the display fields from a Certificate Prisma record.
 * Pass the result directly as spread props to <CertificateCard/>.
 */
export function certToCardProps(cert: {
  id: string;
  verifyCode: string;
  title: string;
  issuedAt: Date | string;
  signedBy: string | null;
  signature: string | null;
  cohort?: string | null;
  user?: { name: string | null };
}): Omit<CertificateCardProps, "learnerName"> {
  const issuedAt = cert.issuedAt instanceof Date ? cert.issuedAt : new Date(cert.issuedAt);
  const year = issuedAt.getFullYear();
  const certId = `TF-${year}-${cert.verifyCode.slice(-8).toUpperCase()}`;
  const cryptoHash = cert.signature ? cert.signature.slice(0, 7) + "…" + cert.signature.slice(-4) : "—";
  const verifyUrl = `forge-ab.vercel.app/verify/cert/${cert.verifyCode}`;

  return {
    programName: cert.title,
    issueDate: issuedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    certId,
    mentorName: cert.signedBy ?? "The Forge",
    mentorTitle: "Program Director, The Forge",
    verifyUrl,
    cohort: cert.cohort ?? "",
    curriculumYear: String(year),
    cryptoHash,
  };
}
