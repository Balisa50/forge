"use client";

/**
 * CertificateCard — The Forge's certificate artwork.
 *
 * Responsive engineering: every dimension is expressed in `cqi` (1% of the
 * container's inline width). The cert is designed at a 900px nominal width;
 * 1px in the design = (1/900 * 100)cqi = 0.111cqi. The cert wrapper sets
 * `container-type: inline-size` so cqi resolves to the wrapper's actual
 * width — which means the cert renders IDENTICALLY proportional whether
 * it's 360px wide on a phone, 900px on a laptop, or 297mm in print.
 *
 * No JS measurement, no transform scaling, no media queries needed for
 * proportions. The print override only swaps mm dimensions for A4 landscape.
 *
 * Used by:
 *   /verify/cert/[code]                       — the public cert page
 *   /dashboard/mentor/[id]/preview-cert       — mentor preview
 *   MentorCertReleaseCard                     — inline preview in drilldown
 */

import React, { useEffect, useRef } from "react";

export interface CertificateCardProps {
  learnerName: string;
  programName: string;
  /** Pre-formatted: "May 28, 2026" */
  issueDate: string;
  /** "TF-2026-A3F9C281" */
  certId: string;
  /** Mentor persona — what the mentee sees on the cert. The cert never
   *  shows the mentor's real account name; only `mentorDisplayName`. */
  mentorName: string;
  mentorTitle: string;
  /** No https://, e.g. "forge-ab.vercel.app/verify/cert/xyz" */
  verifyUrl: string;
  cohort: string;
  curriculumYear: string;
  cryptoHash: string;
  preview?: boolean;
}

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=Dancing+Script:wght@700&family=Inter:wght@300;400;500;600&display=swap');

.cert-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 0;
  width: 100%;
}

.cert-container {
  width: 100%;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  /* Design unit. Set initially as a sane fallback; the React effect below
     measures the actual rendered width via ResizeObserver and overwrites
     --u to (width / 100)px every time it changes. This is bulletproof
     across browsers — container queries had inconsistent resolution in
     Firefox + nested flex containers, which was deforming the seal. */
  --u: 9px;
}

#cert-card {
  width: 100%;
  max-width: 900px;       /* belt-and-suspenders with .cert-container — never exceed design width on screen */
  aspect-ratio: 1.415 / 1;
  background: #FDFBF5;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: calc(5.33 * var(--u)) calc(7.55 * var(--u)) calc(4.22 * var(--u));
  box-sizing: border-box;
  font-family: 'Cormorant Garamond', serif;
  margin-left: auto;
  margin-right: auto;
}

/* ── Double border ── */
.cert-b1 {
  position: absolute;
  inset: calc(1.11 * var(--u));
  border: max(0.5px, calc(0.17 * var(--u))) solid #BF9A30;
  pointer-events: none;
}
.cert-b2 {
  position: absolute;
  inset: calc(1.78 * var(--u));
  border: max(0.4px, calc(0.06 * var(--u))) solid #BF9A30;
  opacity: 0.4;
  pointer-events: none;
}

/* ── Corner brackets ── */
.cert-corner { position: absolute; width: calc(3.56 * var(--u)); height: calc(3.56 * var(--u)); pointer-events: none; }
.cert-corner svg { width: 100%; height: 100%; }
.cert-tl { top: calc(0.44 * var(--u)); left: calc(0.44 * var(--u)); }
.cert-tr { top: calc(0.44 * var(--u)); right: calc(0.44 * var(--u)); transform: scaleX(-1); }
.cert-bl { bottom: calc(0.44 * var(--u)); left: calc(0.44 * var(--u)); transform: scaleY(-1); }
.cert-br { bottom: calc(0.44 * var(--u)); right: calc(0.44 * var(--u)); transform: scale(-1, -1); }

/* ── Header ── */
.cert-top { display: flex; flex-direction: column; align-items: center; gap: calc(0.56 * var(--u)); width: 100%; }
.cert-wordmark {
  font-family: 'Inter', sans-serif;
  font-size: calc(1.06 * var(--u));
  font-weight: 500;
  letter-spacing: 0.4em;
  color: #7A5C10;
  text-transform: uppercase;
  margin: 0;
}
.cert-rule { display: flex; align-items: center; gap: calc(1.33 * var(--u)); width: 100%; justify-content: center; }
.cert-rule-line {
  height: max(0.4px, calc(0.06 * var(--u)));
  flex: 1;
  max-width: calc(11.11 * var(--u));
  background: #BF9A30;
  opacity: 0.5;
}
.cert-rule-diamond {
  width: calc(0.56 * var(--u));
  height: calc(0.56 * var(--u));
  background: #BF9A30;
  transform: rotate(45deg);
}
.cert-rule-line-sm { max-width: calc(5.33 * var(--u)); }
.cert-rule-diamond-sm { width: calc(0.44 * var(--u)); height: calc(0.44 * var(--u)); opacity: 0.6; }
.cert-title {
  font-size: calc(3.33 * var(--u));
  font-weight: 400;
  font-style: italic;
  color: #1A1208;
  margin: 0;
  letter-spacing: 0.02em;
}

/* ── Body ── */
.cert-mid { display: flex; flex-direction: column; align-items: center; gap: calc(0.89 * var(--u)); width: 100%; }
.cert-bikt {
  font-family: 'Inter', sans-serif;
  font-size: calc(0.83 * var(--u));
  font-weight: 400;
  letter-spacing: 0.32em;
  color: #9B8050;
  text-transform: uppercase;
  margin: 0;
}
.cert-name {
  font-size: calc(6.89 * var(--u));
  font-weight: 700;
  color: #0D0800;
  margin: 0;
  line-height: 1;
  letter-spacing: -0.01em;
  text-align: center;
  word-break: break-word;
}
.cert-stmt {
  font-size: calc(1.44 * var(--u));
  font-weight: 300;
  font-style: italic;
  color: #5C4820;
  margin: 0;
  letter-spacing: 0.01em;
  text-align: center;
}
.cert-prog {
  font-size: calc(3.33 * var(--u));
  font-weight: 600;
  font-style: italic;
  color: #8B6410;
  margin: 0;
  letter-spacing: 0.02em;
  text-align: center;
}
.cert-curr {
  font-family: 'Inter', sans-serif;
  font-size: calc(0.83 * var(--u));
  font-weight: 400;
  letter-spacing: 0.3em;
  color: #9B8050;
  text-transform: uppercase;
  margin: 0;
}

/* ── Footer ── */
.cert-foot {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
  width: 100%;
  gap: calc(2.67 * var(--u));
}
.cert-fl { display: flex; flex-direction: column; gap: calc(0.56 * var(--u)); }
.cert-fdate {
  font-size: calc(1.67 * var(--u));
  font-weight: 400;
  color: #1A1208;
  margin: 0;
  padding-bottom: calc(0.67 * var(--u));
  border-bottom: max(0.4px, calc(0.06 * var(--u))) solid #BF9A30;
}
.cert-flbl {
  font-family: 'Inter', sans-serif;
  font-size: calc(0.78 * var(--u));
  font-weight: 400;
  letter-spacing: 0.25em;
  color: #9B8050;
  text-transform: uppercase;
  margin: 0;
}
.cert-fr { display: flex; flex-direction: column; align-items: flex-end; gap: calc(0.56 * var(--u)); }
.cert-fsig {
  font-family: 'Dancing Script', cursive;
  font-size: calc(2.89 * var(--u));
  font-weight: 700;
  color: #1A1208;
  margin: 0;
  padding-bottom: calc(0.44 * var(--u));
  border-bottom: max(0.4px, calc(0.06 * var(--u))) solid #BF9A30;
  min-width: calc(17.78 * var(--u));
  text-align: right;
  line-height: 1.1;
}
.cert-fname {
  font-family: 'Inter', sans-serif;
  font-size: calc(0.78 * var(--u));
  font-weight: 500;
  letter-spacing: 0.2em;
  color: #5C4820;
  text-transform: uppercase;
  margin: 0;
  text-align: right;
}

/* ── Seal ── */
.cert-seal { width: calc(10.67 * var(--u)); height: calc(10.67 * var(--u)); }

/* ── Base strip ── */
.cert-base {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: max(0.4px, calc(0.06 * var(--u))) solid rgba(191,154,48,0.25);
  padding-top: calc(0.89 * var(--u));
  margin-top: calc(0.22 * var(--u));
  gap: calc(1.33 * var(--u));
}
.cert-bid {
  display: flex;
  align-items: center;
  gap: calc(0.56 * var(--u));
  font-family: 'Inter', sans-serif;
  font-size: calc(0.78 * var(--u));
  font-weight: 500;
  letter-spacing: 0.15em;
  color: #8B6410;
}
.cert-bid svg { width: calc(1 * var(--u)); height: calc(1.22 * var(--u)); flex-shrink: 0; }
.cert-bv {
  font-family: 'Inter', sans-serif;
  font-size: calc(0.72 * var(--u));
  color: #9B8050;
  letter-spacing: 0.06em;
}
.cert-bc {
  font-family: 'Inter', sans-serif;
  font-size: calc(0.72 * var(--u));
  color: #9B8050;
  letter-spacing: 0.06em;
  display: flex;
  align-items: center;
  gap: calc(0.44 * var(--u));
}
.cert-bc svg { width: calc(0.89 * var(--u)); height: calc(0.89 * var(--u)); flex-shrink: 0; }

/* ── Preview stamp ── */
.cert-preview-stamp {
  position: absolute;
  top: calc(3.11 * var(--u));
  right: calc(3.33 * var(--u));
  transform: rotate(-9deg);
  font-family: 'Inter', sans-serif;
  font-size: calc(1.11 * var(--u));
  font-weight: 800;
  color: rgba(180,30,30,0.55);
  letter-spacing: 0.32em;
  border: max(0.5px, calc(0.17 * var(--u))) solid rgba(180,30,30,0.45);
  padding: calc(0.56 * var(--u)) calc(1.33 * var(--u));
  border-radius: calc(0.33 * var(--u));
  pointer-events: none;
  background: rgba(180,30,30,0.04);
  z-index: 3;
}

/* ── Print override (A4 landscape) ── */
@media print {
  @page { size: A4 landscape; margin: 0; }
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
  }
  body * { visibility: hidden !important; }
  .cert-wrap, .cert-wrap * { visibility: visible !important; }
  .cert-wrap {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    display: block !important;
  }
  .cert-container {
    max-width: none !important;
    width: 297mm !important;
    height: 210mm !important;
    /* Swap the unit base: 1u = 2.97mm = 1% of A4 landscape width.
       Overrides the JS-measured value during print rendering. */
    --u: 2.97mm !important;
  }
  #cert-card {
    width: 297mm !important;
    height: 210mm !important;
    aspect-ratio: unset !important;
    box-shadow: none !important;
    page-break-inside: avoid;
  }
}
`;

// ─── Flame mark used inside the seal ──────────────────────────────────────────

function FlameMark() {
  return (
    <g transform="translate(48 32)">
      <path
        d="M 0 -8
           C 5 -4, 9 1, 9 7
           C 9 13, 5 17, 0 17
           C -5 17, -9 13, -9 7
           C -9 1, -5 -4, 0 -8 Z"
        fill="#BF9A30"
        opacity="0.95"
      />
      <path
        d="M 0 -2
           C 3 1, 5 5, 5 9
           C 5 12, 3 14, 0 14
           C -3 14, -5 12, -5 9
           C -5 5, -3 1, 0 -2 Z"
        fill="#FDFBF5"
        opacity="0.5"
      />
    </g>
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
  const showCohort = cohort.trim().length > 0;
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure the actual rendered width and write 1% of it back as the --u
  // CSS variable. This is the single source of truth for every dimension
  // on the cert — text, padding, borders, seal, corners. Updates on every
  // resize. Cleaned up on unmount.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) el.style.setProperty("--u", `${w / 100}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="cert-wrap">
        <div className="cert-container" ref={containerRef}>
          <div id="cert-card">

            {/* Borders */}
            <div className="cert-b1" />
            <div className="cert-b2" />

            {/* Corners */}
            {(["tl", "tr", "bl", "br"] as const).map((pos) => (
              <div key={pos} className={`cert-corner cert-${pos}`}>
                <svg viewBox="0 0 32 32" fill="none">
                  <path d="M3 29L3 3L29 3" stroke="#BF9A30" strokeWidth="1.2" />
                  <path d="M7 25L7 7L25 7" stroke="#BF9A30" strokeWidth="0.5" opacity="0.45" />
                  <circle cx="3" cy="3" r="1.8" fill="#BF9A30" />
                  <circle cx="7" cy="7" r="1" fill="#BF9A30" opacity="0.5" />
                </svg>
              </div>
            ))}

            {/* Header */}
            <div className="cert-top">
              <p className="cert-wordmark">The Forge</p>
              <div className="cert-rule">
                <div className="cert-rule-line" />
                <div className="cert-rule-diamond" />
                <div className="cert-rule-line" />
              </div>
              <p className="cert-title">Certificate of Completion</p>
              <div className="cert-rule" style={{ marginTop: "calc(0.22 * var(--u))" }}>
                <div className="cert-rule-line cert-rule-line-sm" />
                <div className="cert-rule-diamond cert-rule-diamond-sm" />
                <div className="cert-rule-line cert-rule-line-sm" />
              </div>
            </div>

            {/* Body */}
            <div className="cert-mid">
              <p className="cert-bikt">This is to certify that</p>
              <p className="cert-name">{learnerName}</p>
              <p className="cert-stmt">
                has, through rigorous mentorship and demonstrated work, completed the programme in
              </p>
              <p className="cert-prog">{programName}</p>
              <p className="cert-curr">
                {curriculumYear} Curriculum{showCohort && <> &nbsp;·&nbsp; {cohort}</>}
              </p>
            </div>

            {/* Footer */}
            <div className="cert-foot">
              <div className="cert-fl">
                <p className="cert-fdate">{issueDate}</p>
                <p className="cert-flbl">Date of Issue</p>
              </div>

              {/* Seal */}
              <svg className="cert-seal" viewBox="0 0 96 96" fill="none">
                {/* Rings */}
                <circle cx="48" cy="48" r="45" stroke="#BF9A30" strokeWidth="1" />
                <circle cx="48" cy="48" r="38" stroke="#BF9A30" strokeWidth="0.5" opacity="0.4" />

                {/* Decorative ticks around the band */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
                  const r1 = 40, r2 = 43;
                  const x1 = 48 + r1 * Math.cos(a);
                  const y1 = 48 + r1 * Math.sin(a);
                  const x2 = 48 + r2 * Math.cos(a);
                  const y2 = 48 + r2 * Math.sin(a);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="#BF9A30" strokeWidth="0.6" opacity="0.55" />;
                })}

                {/* Circular text — clockwise path from W; 25% offset = top of
                    ring where the text reads right-side-up. Sized so the
                    string fits comfortably across the top arc only (no
                    bleeding into the bottom where letters would invert). */}
                <defs>
                  <path id="rp" d="M48,48 m-32,0 a32,32 0 1,1 64,0 a32,32 0 1,1 -64,0" />
                </defs>
                <text fontFamily="Inter,sans-serif" fontSize="4.6" fontWeight="600" letterSpacing="2" fill="#8B6410">
                  <textPath href="#rp" startOffset="25%" textAnchor="middle">
                    THE FORGE  ·  VERIFIED
                  </textPath>
                </text>

                {/* Flame mark */}
                <FlameMark />

                {/* Twin rules under the flame */}
                <line x1="33" y1="55" x2="63" y2="55" stroke="#BF9A30" strokeWidth="0.75" />
                <line x1="38" y1="58" x2="58" y2="58" stroke="#BF9A30" strokeWidth="0.4" opacity="0.5" />

                {/* EST. MMXXVI */}
                <text x="48" y="69" fontFamily="Inter,sans-serif" fontSize="6" fontWeight="500" letterSpacing="2" fill="#9B8050" textAnchor="middle">
                  EST. MMXXVI
                </text>
              </svg>

              <div className="cert-fr">
                <p className="cert-fsig">{mentorName}</p>
                <p className="cert-flbl" style={{ textAlign: "right" }}>{mentorTitle}</p>
              </div>
            </div>

            {/* Base strip */}
            <div className="cert-base">
              <div className="cert-bid">
                <svg viewBox="0 0 9 11" fill="none">
                  <rect x="1" y="4" width="7" height="6.5" rx="1" stroke="#8B6410" strokeWidth="0.8" />
                  <path d="M3 4V2.8a1.5 1.5 0 013 0V4" stroke="#8B6410" strokeWidth="0.8" />
                  <circle cx="4.5" cy="7.5" r=".8" fill="#8B6410" />
                </svg>
                {certId}
              </div>
              <p className="cert-bv">{verifyUrl}</p>
              <div className="cert-bc">
                <svg viewBox="0 0 8 8" fill="none">
                  <circle cx="4" cy="4" r="3.5" stroke="#9B8050" strokeWidth="0.6" />
                  <path d="M2.5 4l1 1 2-2" stroke="#9B8050" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Signed · {cryptoHash}
              </div>
            </div>

            {/* PREVIEW stamp — only when the cert hasn't been released yet */}
            {preview && (
              <div className="cert-preview-stamp">PREVIEW</div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

// ─── Companion exports ────────────────────────────────────────────────────────

export function CertificatePrintStyles() {
  return <style dangerouslySetInnerHTML={{ __html: STYLES }} />;
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
        background: "#BF9A30",
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

/**
 * Derive display fields from a Certificate DB row.
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
  const cryptoHash = cert.signature
    ? cert.signature.slice(0, 7) + "…" + cert.signature.slice(-4)
    : "—";
  const verifyUrl = `forge-ab.vercel.app/verify/cert/${cert.verifyCode}`;

  return {
    programName: cert.title,
    issueDate: issuedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    certId,
    mentorName: cert.signedBy ?? "The Forge",
    mentorTitle: "Programme Director, The Forge",
    verifyUrl,
    cohort: cert.cohort ?? "",
    curriculumYear: String(year),
    cryptoHash,
  };
}
