"use client";

/**
 * CertificateCard — The Forge's certificate artwork. V2.
 *
 * The earlier version was technically correct and visually anemic. This
 * one is heavier, more anchored, more deliberate — closer to an actual
 * engraved diploma than a templated PDF.
 *
 * Anchors of the composition:
 *   1. A real TF monogram crest at the top — not a generic star
 *   2. "Certificate of Completion" as the formal title (Cormorant Garamond)
 *   3. The recipient name as the visual centerpiece
 *   4. The program name treated with weight + scale matching the name
 *   5. A LARGE central wax-style SVG seal (160px) — Allen's name on the
 *      signature line, sits below the seal not next to it
 *   6. Date stamp left, verify info right, anchored on a footer ribbon
 *
 * Hard rules retained from the brief: warm cream paper, restrained gold,
 * no shadows, no gradients, no raster textures. All visual interest comes
 * from typography weight, vector ornament, and proportion.
 */

import { QRCodeSVG } from "qrcode.react";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CertificateCardProps {
  learnerName: string;
  programName: string;
  issueDate: string;        // pre-formatted "May 28, 2026"
  certId: string;           // "TF-2026-A3F9C281"
  mentorName: string;
  mentorTitle: string;
  verifyUrl: string;        // no https://
  cohort: string;
  curriculumYear: string;
  cryptoHash: string;
  preview?: boolean;
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const PAPER     = "#FAF8F3";
const PAPER_DEEP = "#F4EFE2";
const INK       = "#1A1410";
const INK_SOFT  = "#3a2f24";
const GOLD      = "#B8952A";
const GOLD_DEEP = "#8a6f1f";
const GOLD_LIGHT = "#d9b850";
const MUTED     = "#7a6a55";

// ─── Fonts & Print CSS ────────────────────────────────────────────────────────

const FONTS_CSS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Cinzel:wght@500;600;700&family=Dancing+Script:wght@600;700&family=Inter:wght@300;400;500;600;700&display=swap');`;

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
    outline: none !important;
  }
}`;

// ─── TF Monogram (crest at top) ───────────────────────────────────────────────

function TFMonogram({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      {/* Outer wreath ring (laurel-like) */}
      <circle cx="32" cy="32" r="29" fill="none" stroke={GOLD} strokeWidth="1.4" />
      <circle cx="32" cy="32" r="25" fill="none" stroke={GOLD} strokeWidth="0.5" opacity="0.6" />

      {/* Laurel leaves — 8 small marks around the perimeter */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * 2 * Math.PI;
        const x = 32 + 27 * Math.cos(a);
        const y = 32 + 27 * Math.sin(a);
        return <circle key={i} cx={x} cy={y} r="1.4" fill={GOLD} />;
      })}

      {/* "TF" interlocking monogram */}
      {/* T crossbar */}
      <path d="M16 22 L48 22" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
      {/* T stem */}
      <path d="M32 22 L32 48" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
      {/* F top bar (offset right, overlapping T) */}
      <path d="M27 22 L42 22" stroke={GOLD_DEEP} strokeWidth="2.4" strokeLinecap="round" />
      {/* F middle bar */}
      <path d="M27 33 L40 33" stroke={GOLD_DEEP} strokeWidth="2.2" strokeLinecap="round" />
      {/* F stem (offset slightly to read as separate letter) */}
      <path d="M27 22 L27 48" stroke={GOLD_DEEP} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

// ─── Corner brackets ──────────────────────────────────────────────────────────

function CornerOrnament({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const deg = { tl: 0, tr: 90, br: 180, bl: 270 }[pos];
  const style: React.CSSProperties = {
    position: "absolute",
    ...(pos === "tl" || pos === "tr" ? { top: "2.6%" } : { bottom: "2.6%" }),
    ...(pos === "tl" || pos === "bl" ? { left: "2.2%" } : { right: "2.2%" }),
    transform: `rotate(${deg}deg)`,
    pointerEvents: "none",
    zIndex: 1,
  };
  return (
    <svg width="58" height="58" viewBox="0 0 58 58" style={style} aria-hidden>
      {/* Heavy outer L bracket */}
      <path d="M 0 0 L 50 0 M 0 0 L 0 50" stroke={GOLD} strokeWidth="2" fill="none" />
      {/* Filigree flourish */}
      <path d="M 8 0 L 8 8 L 0 8 M 18 0 L 18 4 M 26 0 L 26 4 M 0 18 L 4 18 M 0 26 L 4 26" stroke={GOLD} strokeWidth="0.9" fill="none" opacity="0.85" />
      <path d="M 14 0 L 14 14 L 0 14" stroke={GOLD} strokeWidth="0.6" fill="none" opacity="0.55" />
      {/* Anchor diamond */}
      <path d="M 0 0 L 3 3 L 6 0 L 3 -3 Z" fill={GOLD} transform="translate(2 2)" />
    </svg>
  );
}

// ─── Decorative divider (filigree line) ───────────────────────────────────────

function Filigree({ width = 180 }: { width?: number }) {
  return (
    <svg width={width} height="12" viewBox={`0 0 ${width} 12`} aria-hidden>
      <line x1="0" y1="6" x2={width / 2 - 16} y2="6" stroke={GOLD} strokeWidth="0.7" />
      <line x1={width / 2 + 16} y1="6" x2={width} y2="6" stroke={GOLD} strokeWidth="0.7" />
      {/* Center diamond + flanking dots */}
      <circle cx={width / 2 - 12} cy="6" r="1.4" fill={GOLD} />
      <path d={`M ${width / 2} 1 L ${width / 2 + 6} 6 L ${width / 2} 11 L ${width / 2 - 6} 6 Z`} fill={GOLD} />
      <circle cx={width / 2 + 12} cy="6" r="1.4" fill={GOLD} />
    </svg>
  );
}

// ─── The Forge Seal (big) ─────────────────────────────────────────────────────

function ForgeSeal({ size = 160 }: { size?: number }) {
  // Clockwise full circle path starting at W (9 o'clock).
  // Quarters: 0%=W, 25%=N (top), 50%=E, 75%=S (bottom).
  const ring = "M 50 50 m -42,0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0";

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-label="The Forge seal">
      {/* Faint disc fill */}
      <circle cx="50" cy="50" r="48" fill={PAPER_DEEP} />

      {/* Outer heavy ring */}
      <circle cx="50" cy="50" r="46.5" fill="none" stroke={GOLD} strokeWidth="1.6" />
      {/* Thin double ring */}
      <circle cx="50" cy="50" r="44" fill="none" stroke={GOLD} strokeWidth="0.5" opacity="0.55" />
      {/* Inner ring containing the emblem */}
      <circle cx="50" cy="50" r="30" fill="none" stroke={GOLD} strokeWidth="0.7" opacity="0.7" />

      {/* 24 decorative ticks around the outer band */}
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * 2 * Math.PI - Math.PI / 2;
        const isMajor = i % 6 === 0;
        const r1 = isMajor ? 38 : 39.5;
        const r2 = isMajor ? 42 : 41.5;
        const x1 = 50 + r1 * Math.cos(a), y1 = 50 + r1 * Math.sin(a);
        const x2 = 50 + r2 * Math.cos(a), y2 = 50 + r2 * Math.sin(a);
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={GOLD} strokeWidth={isMajor ? "1" : "0.5"} opacity={isMajor ? 0.85 : 0.5} />
        );
      })}

      {/* Anvil + flame emblem inside the inner ring */}
      {/* Anvil base */}
      <path d="M30 60 L70 60 L67 64 L33 64 Z" fill={INK} />
      {/* Anvil body */}
      <path d="M35 52 L65 52 L67 58 L33 58 Z" fill={INK} />
      {/* Anvil horn (left point) */}
      <path d="M35 52 L28 50 L28 55 L35 57 Z" fill={INK} />
      {/* Flame on top of anvil */}
      <path
        d="M50 48 C50 48 46 44 47 39 C48 36 50 35 50 35 C50 35 51 38 53 39 C54 40 55 43 54 46 C53 48 50 48 50 48 Z"
        fill={GOLD}
      />
      <path
        d="M50 46 C50 46 48 43 48.5 41 C49 39 50 38.5 50 38.5 C50 38.5 51 40 51.5 41 C52 42.5 51 45 50 46 Z"
        fill={GOLD_LIGHT}
      />

      {/* Circular text — TOP (25% offset on clockwise path = 12 o'clock, right-side-up) */}
      <defs>
        <path id="sealRingTop" d={ring} />
      </defs>
      <text fontFamily="'Cinzel', 'Cormorant Garamond', serif" fontSize="5.4" letterSpacing="2.2" fill={INK} fontWeight="600">
        <textPath href="#sealRingTop" startOffset="25%" textAnchor="middle">
          ★ &nbsp; THE FORGE &nbsp;·&nbsp; VERIFIED &nbsp; ★
        </textPath>
      </text>

      {/* "EST 2026" centered inside the inner ring */}
      <text x="50" y="76" textAnchor="middle"
        fontFamily="'Cinzel', serif" fontSize="3.6" letterSpacing="2.6"
        fill={GOLD_DEEP} fontWeight="600">
        EST · MMXXVI
      </text>
    </svg>
  );
}

// ─── Lock icon ────────────────────────────────────────────────────────────────

function LockIcon() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <rect x="1" y="5" width="8" height="6.5" rx="1" stroke={GOLD} strokeWidth="1" />
      <path d="M2.8 5V3.5C2.8 2.3 3.7 1.3 5 1.3C6.3 1.3 7.2 2.3 7.2 3.5V5" stroke={GOLD} strokeWidth="1" />
      <circle cx="5" cy="8.2" r="1.1" fill={GOLD} />
    </svg>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

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
  const showCohort = cohort.trim().length > 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONTS_CSS }} />
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div
        id="cert-card"
        style={{
          position: "relative",
          aspectRatio: "297 / 210",
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          background: PAPER,
          color: INK,
          overflow: "hidden",
          fontFamily: "'Inter', sans-serif",
          boxSizing: "border-box",
        }}
      >
        {/* ── Outer heavy border ── */}
        <div style={{
          position: "absolute",
          inset: "1.2%",
          border: `2px solid ${GOLD}`,
          pointerEvents: "none",
        }} />
        {/* ── Inner hairline border ── */}
        <div style={{
          position: "absolute",
          inset: "2.3%",
          border: `1px solid ${GOLD}`,
          opacity: 0.5,
          pointerEvents: "none",
        }} />

        {/* ── Corner ornaments ── */}
        <CornerOrnament pos="tl" />
        <CornerOrnament pos="tr" />
        <CornerOrnament pos="bl" />
        <CornerOrnament pos="br" />

        {/* ── Content ── */}
        <div style={{
          position: "relative",
          height: "100%",
          padding: "2.6% 7.5% 3.2%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}>

          {/* ─────────────────────── HEADER ─────────────────────── */}
          <div style={{ textAlign: "center", marginBottom: "0.4rem" }}>
            <TFMonogram size={56} />
            <div style={{
              fontFamily: "'Cinzel', 'Cormorant Garamond', serif",
              fontSize: "0.875rem",
              fontWeight: 700,
              letterSpacing: "0.45em",
              color: INK,
              marginTop: "0.4rem",
              paddingLeft: "0.45em",
            }}>
              THE FORGE
            </div>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.5rem",
              fontWeight: 500,
              letterSpacing: "0.32em",
              color: MUTED,
              textTransform: "uppercase",
              marginTop: "0.2rem",
            }}>
              — Independent Mentorship Programme —
            </div>
          </div>

          {/* ────────────────── CERTIFICATE TITLE ────────────────── */}
          <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: "2.25rem",
              color: INK,
              letterSpacing: "0.015em",
              lineHeight: 1,
            }}>
              Certificate of Completion
            </div>
            <div style={{ marginTop: "0.65rem" }}>
              <Filigree width={200} />
            </div>
          </div>

          {/* ──────────────────── HERO BLOCK ────────────────────── */}
          <div style={{
            textAlign: "center",
            marginTop: "0.65rem",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.55rem",
              fontWeight: 500,
              letterSpacing: "0.42em",
              color: MUTED,
              textTransform: "uppercase",
              marginBottom: "0.55rem",
            }}>
              Be it known that
            </div>

            {/* THE NAME — engraved heavy serif */}
            <div style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 700,
              fontSize: "3.6rem",
              color: INK,
              letterSpacing: "0.005em",
              lineHeight: 1,
              wordBreak: "break-word",
              padding: "0 0.5rem",
            }}>
              {learnerName}
            </div>

            <div style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontSize: "0.95rem",
              fontWeight: 400,
              color: INK_SOFT,
              marginTop: "0.7rem",
              marginBottom: "0.35rem",
              maxWidth: "70%",
              lineHeight: 1.35,
            }}>
              has, through rigorous mentorship and demonstrated work,
              completed the programme in
            </div>

            {/* PROGRAM NAME — same weight class as learner name */}
            <div style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 700,
              fontSize: "2.5rem",
              color: GOLD_DEEP,
              letterSpacing: "0.018em",
              lineHeight: 1.05,
              marginTop: "0.2rem",
            }}>
              {programName}
            </div>

            {/* Cohort line */}
            <div style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "0.5625rem",
              fontWeight: 600,
              color: MUTED,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              marginTop: "0.6rem",
            }}>
              {showCohort ? `${cohort} · ${curriculumYear} Curriculum` : `${curriculumYear} Curriculum`}
            </div>
          </div>

          {/* ────────────────── FOOTER STRIP ────────────────── */}
          <div style={{
            width: "100%",
            marginTop: "auto",
            paddingTop: "0.5rem",
          }}>
            {/* Filigree separator */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.6rem" }}>
              <Filigree width={260} />
            </div>

            {/* Three columns: date | seal | signature */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "end",
              gap: "1.5rem",
              width: "100%",
            }}>
              {/* LEFT — Date */}
              <div style={{ textAlign: "left" }}>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: "1.1rem",
                  fontWeight: 500,
                  color: INK,
                  paddingBottom: "0.25rem",
                  borderBottom: `1.5px solid ${INK}`,
                  display: "inline-block",
                  minWidth: "10rem",
                  letterSpacing: "0.015em",
                }}>
                  {issueDate}
                </div>
                <div style={{
                  fontFamily: "'Cinzel', sans-serif",
                  fontSize: "0.5rem",
                  fontWeight: 600,
                  letterSpacing: "0.36em",
                  color: MUTED,
                  textTransform: "uppercase",
                  marginTop: "0.35rem",
                }}>
                  Date of Issue
                </div>
              </div>

              {/* CENTER — Seal */}
              <div style={{ flexShrink: 0, alignSelf: "end", paddingBottom: "0.3rem" }}>
                <ForgeSeal size={132} />
              </div>

              {/* RIGHT — Signature */}
              <div style={{ textAlign: "right" }}>
                <div style={{
                  fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
                  fontSize: "1.95rem",
                  fontWeight: 700,
                  color: INK,
                  lineHeight: 1,
                  paddingBottom: "0.15rem",
                  borderBottom: `1.5px solid ${INK}`,
                  display: "inline-block",
                  minWidth: "11rem",
                  textAlign: "center",
                }}>
                  {mentorName}
                </div>
                <div style={{
                  fontFamily: "'Cinzel', sans-serif",
                  fontSize: "0.5rem",
                  fontWeight: 600,
                  letterSpacing: "0.22em",
                  color: MUTED,
                  textTransform: "uppercase",
                  marginTop: "0.35rem",
                }}>
                  {mentorTitle}
                </div>
              </div>
            </div>

            {/* Verification strip */}
            <div style={{
              marginTop: "1rem",
              paddingTop: "0.55rem",
              borderTop: `0.5px solid ${GOLD}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
              opacity: 0.95,
            }}>
              {/* Left: cert id */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flex: 1 }}>
                <LockIcon />
                <span style={{
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontSize: "0.5rem",
                  fontWeight: 700,
                  color: GOLD_DEEP,
                  letterSpacing: "0.16em",
                }}>
                  {certId}
                </span>
              </div>

              {/* Center: QR */}
              <div style={{ flexShrink: 0 }}>
                <QRCodeSVG
                  value={`https://${verifyUrl}`}
                  size={46}
                  bgColor={PAPER}
                  fgColor={INK}
                  level="M"
                />
              </div>

              {/* Right: hash + url */}
              <div style={{ flex: 1, textAlign: "right" }}>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.4375rem",
                  fontWeight: 600,
                  color: MUTED,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}>
                  Cryptographically signed · {cryptoHash}
                </div>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.4375rem",
                  color: MUTED,
                  letterSpacing: "0.06em",
                  marginTop: "0.18rem",
                }}>
                  {verifyUrl}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── PREVIEW stamp — small corner badge ── */}
        {preview && (
          <div style={{
            position: "absolute",
            top: "5.5%",
            right: "5.5%",
            transform: "rotate(-9deg)",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.65rem",
            fontWeight: 800,
            color: "rgba(180,30,30,0.55)",
            letterSpacing: "0.32em",
            border: "2px solid rgba(180,30,30,0.45)",
            padding: "0.3rem 0.8rem",
            borderRadius: 3,
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

// ─── Companion exports ────────────────────────────────────────────────────────

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

// ─── Helper: build props from a Certificate DB row ────────────────────────────

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
