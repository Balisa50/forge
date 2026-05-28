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
const GOLD_DIM = "rgba(184,149,42,0.26)";
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
    ...(pos === "tl" || pos === "tr" ? { top: "1.25%" } : { bottom: "1.25%" }),
    ...(pos === "tl" || pos === "bl" ? { left: "0.75%" } : { right: "0.75%" }),
    transform: `rotate(${deg}deg)`,
    pointerEvents: "none",
  };
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" style={style} aria-hidden>
      <path
        d="M 4 4 L 26 4 M 4 4 L 4 26 M 14 4 L 14 11 L 4 11"
        stroke={GOLD}
        strokeWidth="1.1"
        fill="none"
        opacity="0.75"
      />
      <circle cx="4" cy="4" r="1.8" fill={GOLD} opacity="0.75" />
    </svg>
  );
}

// ─── SVG Seal ─────────────────────────────────────────────────────────────────

function ForgeSeal() {
  // Full clockwise circle starting at W (9 o'clock).
  // 75% offset = 12 o'clock (top). textAnchor="middle" centres text there.
  // Text reads left→right across the top ring with a natural gap at the bottom.
  const sealPath = "M 50 50 m -42,0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0";
  return (
    <svg width="92" height="92" viewBox="0 0 100 100" aria-label="The Forge seal">
      {/* Paper fill so background bleeds through correctly */}
      <circle cx="50" cy="50" r="48" fill={PAPER} />
      {/* Outer ring */}
      <circle cx="50" cy="50" r="46" fill="none" stroke={GOLD} strokeWidth="1.2" />
      {/* Hairline inner ring */}
      <circle cx="50" cy="50" r="38.5" fill="none" stroke={GOLD} strokeWidth="0.5" opacity="0.45" />

      {/* 5-pointed star (mathematically correct) */}
      {/* Outer r=15, inner r=6.5, centered at (50,50), first point at 12 o'clock */}
      <path
        d="M50 35 L52.9 43.9 L62.3 43.9 L55.1 49.3 L57.8 58.1 L50 52.8 L42.2 58.1 L44.9 49.3 L37.7 43.9 L47.1 43.9 Z"
        fill={GOLD}
        opacity="0.9"
      />

      {/* Circular text at 75% offset = centered at top */}
      <defs>
        <path id="sealRing" d={sealPath} />
      </defs>
      <text
        fontFamily="'Inter', sans-serif"
        fontSize="5.4"
        letterSpacing="2.8"
        fill={GOLD}
        fontWeight="600"
      >
        <textPath href="#sealRing" startOffset="75%" textAnchor="middle">
          THE FORGE  ·  VERIFIED  ·  2026  ·
        </textPath>
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
        {/* ── Single thin border rule ── */}
        <div style={{
          position: "absolute",
          inset: "1.4%",
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
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.6rem",
              fontWeight: 600,
              letterSpacing: "0.52em",
              color: GOLD,
              textTransform: "uppercase",
              marginBottom: "0.625rem",
            }}>
              The Forge
            </div>
            {/* Gold rule */}
            <div style={{
              width: "20%",
              height: 1,
              background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
              margin: "0 auto 0.75rem",
            }} />
            {/* Certificate of Completion */}
            <div style={{
              fontFamily: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "1.8rem",
              color: INK,
              letterSpacing: "0.025em",
              lineHeight: 1,
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
              fontWeight: 600,
              fontSize: "1.625rem",
              color: GOLD,
              letterSpacing: "0.03em",
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

        {/* ── PREVIEW watermark ── */}
        {preview && (
          <div style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            pointerEvents: "none",
          }}>
            <div style={{
              transform: "rotate(-22deg)",
              fontFamily: "'Inter', sans-serif",
              fontSize: "4.5rem",
              fontWeight: 800,
              color: "rgba(220,38,38,0.11)",
              letterSpacing: "0.4em",
              border: "5px solid rgba(220,38,38,0.11)",
              padding: "0.35em 1.5em",
              borderRadius: 14,
            }}>
              PREVIEW
            </div>
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
