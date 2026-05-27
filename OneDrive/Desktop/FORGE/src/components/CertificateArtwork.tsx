"use client";

/**
 * The actual certificate artwork. Reused by:
 *   - the public /verify/cert/[code] page (the real cert)
 *   - the mentor's mentee drilldown preview (before release)
 *   - the print stylesheet (Download → Save as PDF)
 *
 * Fixed landscape aspect (4:3-ish) so it renders consistently when downloaded
 * or screenshotted. All styling is INLINE so an embedded print/iframe context
 * preserves the look.
 */

import { Award, CheckCircle2 } from "lucide-react";

interface Props {
  recipientName: string;
  roadmapTitle: string;
  issuedAt: string; // ISO
  totalTasks: number;
  totalHours: number;
  passRate: number; // 0..1
  verifyCode: string;
  /** Mentor's persona name (mentorDisplayName). Null for solo learners. */
  signedBy?: string | null;
  /** When true, overlays a watermark + "PREVIEW" badge across the artwork. */
  preview?: boolean;
  /** When true, switches blur on so unfinished mentees see the future cert. */
  blurred?: boolean;
}

const GOLD = "#d4af37";
const GOLD_LIGHT = "#f0c75c";
const GOLD_DIM = "rgba(212,175,55,0.6)";
const PAPER = "#fdfaf2";       // warm parchment
const INK = "#1a1410";          // deep brown-black

function formatIssued(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function CertificateArtwork({
  recipientName,
  roadmapTitle,
  issuedAt,
  totalTasks,
  totalHours,
  passRate,
  verifyCode,
  signedBy,
  preview,
  blurred,
}: Props) {
  const passPct = Math.round(passRate * 100);
  const strong = passRate >= 0.8;

  return (
    <div
      id="cert-artwork"
      style={{
        position: "relative",
        aspectRatio: "1.414",       // ISO A-series landscape
        width: "100%",
        maxWidth: 1100,
        margin: "0 auto",
        background: PAPER,
        color: INK,
        boxShadow: "0 30px 80px -20px rgba(0,0,0,0.4), 0 10px 40px -15px rgba(0,0,0,0.3)",
        filter: blurred ? "blur(7px)" : undefined,
        transition: "filter 0.4s",
        overflow: "hidden",
      }}
    >
      {/* Outer gold border */}
      <div
        style={{
          position: "absolute",
          inset: "1.4%",
          border: `3px solid ${GOLD}`,
          boxShadow: `inset 0 0 0 1px ${GOLD}`,
        }}
      />
      {/* Inner thin gold rule */}
      <div
        style={{
          position: "absolute",
          inset: "2.4%",
          border: `1px solid ${GOLD_DIM}`,
        }}
      />

      {/* Corner ornaments */}
      {([
        { top: "1.4%", left: "1.4%", right: undefined, bottom: undefined, deg: 0 },
        { top: "1.4%", left: undefined, right: "1.4%", bottom: undefined, deg: 90 },
        { top: undefined, left: undefined, right: "1.4%", bottom: "1.4%", deg: 180 },
        { top: undefined, left: "1.4%", right: undefined, bottom: "1.4%", deg: 270 },
      ] as const).map((c, i) => (
        <svg
          key={i}
          width="42"
          height="42"
          viewBox="0 0 42 42"
          style={{
            position: "absolute",
            top: c.top, left: c.left, right: c.right, bottom: c.bottom,
            transform: `rotate(${c.deg}deg)`,
            transformOrigin: "center",
          }}
        >
          <path
            d="M 4 4 L 38 4 M 4 4 L 4 38 M 14 4 L 14 14 L 4 14 M 24 4 L 24 8 M 4 24 L 8 24"
            stroke={GOLD}
            strokeWidth="1.4"
            fill="none"
          />
          <circle cx="4" cy="4" r="2.4" fill={GOLD} />
        </svg>
      ))}

      {/* Watermark "THE FORGE" inscribed faintly down the center */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-15deg)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontWeight: 700,
          fontSize: "13rem",
          color: GOLD,
          opacity: 0.05,
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        THE FORGE
      </div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          height: "100%",
          padding: "6% 8%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: "center",
        }}
      >
        {/* Header */}
        <div style={{ width: "100%" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.5rem" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2 L14 9 L21 9 L15.5 13.5 L17.5 21 L12 16.5 L6.5 21 L8.5 13.5 L3 9 L10 9 Z" fill={GOLD} stroke={GOLD} strokeWidth="0.5" />
            </svg>
            <span style={{
              fontFamily: "'SF Mono', 'Menlo', monospace",
              fontSize: "0.6875rem",
              letterSpacing: "0.5em",
              color: GOLD,
              textTransform: "uppercase",
              paddingLeft: "0.5em",
            }}>
              The Forge
            </span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2 L14 9 L21 9 L15.5 13.5 L17.5 21 L12 16.5 L6.5 21 L8.5 13.5 L3 9 L10 9 Z" fill={GOLD} stroke={GOLD} strokeWidth="0.5" />
            </svg>
          </div>
          <div
            style={{
              width: "30%",
              height: 1,
              background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
              margin: "0.5rem auto 1rem",
            }}
          />
          <div
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              fontSize: "1.875rem",
              color: INK,
              letterSpacing: "0.02em",
              fontWeight: 400,
            }}
          >
            Certificate of Completion
          </div>
        </div>

        {/* Body — name + roadmap */}
        <div style={{ width: "100%" }}>
          <div
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: "0.6875rem",
              letterSpacing: "0.32em",
              color: "#6b5a3a",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            This is to certify that
          </div>
          <div
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "3.25rem",
              fontWeight: 700,
              color: INK,
              letterSpacing: "0.02em",
              lineHeight: 1.1,
              marginBottom: "1rem",
              minHeight: "1.1em",
            }}
          >
            {recipientName}
          </div>
          <div
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: "0.6875rem",
              letterSpacing: "0.32em",
              color: "#6b5a3a",
              textTransform: "uppercase",
              marginBottom: "0.625rem",
            }}
          >
            has successfully completed the program
          </div>
          <div
            style={{
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              fontSize: "1.5rem",
              color: GOLD,
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            {roadmapTitle}
          </div>
        </div>

        {/* Stats strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "3rem",
            width: "100%",
            padding: "0.75rem 0",
            borderTop: `1px solid ${GOLD_DIM}`,
            borderBottom: `1px solid ${GOLD_DIM}`,
          }}
        >
          {[
            { label: "Weeks Verified", value: String(totalTasks) },
            { label: "Hours Invested", value: String(Math.round(totalHours)) },
            { label: "Pass Rate", value: `${passPct}%`, color: strong ? "#1f7a3f" : "#7a5a1f" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "1.625rem",
                  fontWeight: 700,
                  color: s.color ?? INK,
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: "0.5625rem",
                  letterSpacing: "0.22em",
                  color: "#6b5a3a",
                  textTransform: "uppercase",
                  marginTop: "0.3125rem",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Footer — date / seal / signature */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            width: "100%",
            gap: "1rem",
          }}
        >
          {/* Date */}
          <div style={{ textAlign: "left", flex: 1 }}>
            <div
              style={{
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                fontSize: "0.9375rem",
                color: INK,
                borderBottom: `1px solid ${INK}`,
                paddingBottom: "0.25rem",
                marginBottom: "0.25rem",
                display: "inline-block",
                minWidth: 140,
              }}
            >
              {formatIssued(issuedAt)}
            </div>
            <div
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: "0.5625rem",
                letterSpacing: "0.22em",
                color: "#6b5a3a",
                textTransform: "uppercase",
              }}
            >
              Issued
            </div>
          </div>

          {/* Seal */}
          <div style={{ flexShrink: 0, position: "relative" }}>
            <svg width="92" height="92" viewBox="0 0 100 100">
              <defs>
                <radialGradient id="sealGrad" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0%" stopColor={GOLD_LIGHT} />
                  <stop offset="100%" stopColor={GOLD} />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="46" fill="url(#sealGrad)" stroke={INK} strokeWidth="1.2" />
              <circle cx="50" cy="50" r="38" fill="none" stroke={INK} strokeWidth="0.6" opacity="0.5" />
              {/* Star */}
              <path
                d="M50 24 L55 42 L74 42 L59 53 L65 71 L50 60 L35 71 L41 53 L26 42 L45 42 Z"
                fill={INK}
                opacity="0.85"
              />
              {/* Circular text — abuse Path */}
              <defs>
                <path id="sealText" d="M 50 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" />
              </defs>
              <text
                fontFamily="'SF Mono', monospace"
                fontSize="6"
                letterSpacing="2"
                fill={INK}
                fontWeight="bold"
              >
                <textPath href="#sealText" startOffset="2%">
                  • THE FORGE • VERIFIED BY AI • THE FORGE • VERIFIED BY AI •
                </textPath>
              </text>
            </svg>
          </div>

          {/* Signature */}
          <div style={{ textAlign: "right", flex: 1 }}>
            <div
              style={{
                fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
                fontSize: "1.5rem",
                color: INK,
                lineHeight: 1,
                borderBottom: `1px solid ${INK}`,
                paddingBottom: "0.25rem",
                marginBottom: "0.25rem",
                display: "inline-block",
                minWidth: 160,
                textAlign: "center",
              }}
            >
              {signedBy ?? "The Forge"}
            </div>
            <div
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: "0.5625rem",
                letterSpacing: "0.22em",
                color: "#6b5a3a",
                textTransform: "uppercase",
              }}
            >
              {signedBy ? "Mentor of Record" : "Issuing Authority"}
            </div>
          </div>
        </div>

        {/* Verify code strip */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "0.625rem",
            borderTop: `1px solid ${GOLD_DIM}`,
            marginTop: "0.25rem",
          }}
        >
          <div
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: "0.625rem",
              letterSpacing: "0.18em",
              color: "#6b5a3a",
              textTransform: "uppercase",
            }}
          >
            Verify online at forge-ab.vercel.app/verify/cert/{verifyCode.slice(0, 16)}…
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              fontFamily: "'SF Mono', monospace",
              fontSize: "0.625rem",
              color: strong ? "#1f7a3f" : "#7a5a1f",
              letterSpacing: "0.1em",
            }}
          >
            <CheckCircle2 size={10} />
            CRYPTOGRAPHICALLY SIGNED
          </div>
        </div>
      </div>

      {/* PREVIEW watermark */}
      {preview && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              transform: "rotate(-22deg)",
              fontFamily: "'SF Mono', monospace",
              fontSize: "5rem",
              fontWeight: 900,
              color: "rgba(220,38,38,0.16)",
              letterSpacing: "0.4em",
              border: "6px solid rgba(220,38,38,0.16)",
              padding: "0.5rem 2rem",
              borderRadius: 16,
            }}
          >
            PREVIEW
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Print-only stylesheet helper. Drop <CertificatePrintStyles/> in any page
 * that renders <CertificateArtwork/> so window.print() produces a flawless
 * one-page PDF.
 */
export function CertificatePrintStyles() {
  return (
    <style>{`
      @media print {
        @page { size: A4 landscape; margin: 0; }
        body * { visibility: hidden !important; }
        #cert-artwork, #cert-artwork * { visibility: visible !important; }
        #cert-artwork {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          max-width: none !important;
          box-shadow: none !important;
          margin: 0 !important;
          filter: none !important;
        }
      }
    `}</style>
  );
}

export function DownloadCertButton({ verifyCode }: { verifyCode: string }) {
  void verifyCode;
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="forge-btn forge-btn-primary"
      style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
    >
      <Award size={14} /> Download / Print
    </button>
  );
}
