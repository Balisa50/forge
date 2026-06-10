"use client";

/**
 * ExamDiagrams — data-driven SVG diagrams for actuarial study.
 *
 * Every diagram now accepts a `labels` prop (Record<string, string|number>)
 * that the question generator populates with the ACTUAL values from that
 * specific question.  Each component uses labels when present and falls back
 * to sensible generic defaults so questions without labels still render.
 *
 * This means the Venn diagram shows the real P(A), P(B), P(A∩B) from the
 * question; the tree shows the exact branch probabilities; the bell curve
 * places the arrow at the specific value being asked about; and so on.
 * The diagram is now a worked visual for THAT question, not a generic icon.
 */

import type { DiagramKind } from "@/lib/examPaths";

// ── Design tokens ──────────────────────────────────────────────────────────
const GOLD   = "#D4AF37";
const BLUE   = "#60a5fa";
const GREEN  = "#22c55e";
const RED    = "#f87171";
const DIM    = "rgba(255,255,255,0.45)";
const STROKE = "rgba(255,255,255,0.65)";

// ── Helpers ────────────────────────────────────────────────────────────────
type Labels = Record<string, string | number | undefined> | undefined;
const g  = (L: Labels, k: string, def: number)  => (L && L[k] !== undefined ? Number(L[k])  : def);
const gs = (L: Labels, k: string, def: string)  => (L && L[k] !== undefined ? String(L[k]) : def);
const fmt4 = (n: number) => Number(n.toFixed(4)).toString();

function Frame({ vb, children }: { vb: string; children: React.ReactNode }) {
  return (
    <svg viewBox={vb} role="img"
      style={{ width: "100%", height: "auto", maxWidth: 460, display: "block", margin: "0 auto" }}>
      {children}
    </svg>
  );
}

// ── 1. Venn — conditional probability ──────────────────────────────────────
/**
 * labels: pA, pB, pAB, labelA?, labelB?
 * Shows the exact probability values inside each region.
 * Overlap region is shaded and labelled P(A∩B) = <value>.
 * Derived P(A|B) is shown at the bottom.
 */
function VennConditional({ L }: { L: Labels }) {
  const pA  = g(L, "pA",  0.40);
  const pB  = g(L, "pB",  0.30);
  const pAB = g(L, "pAB", 0.12);
  const lA  = gs(L, "labelA", "A");
  const lB  = gs(L, "labelB", "B");
  const pAgivB = pB > 0 ? fmt4(pAB / pB) : "—";
  const pAonly = fmt4(Math.max(0, pA - pAB));
  const pBonly = fmt4(Math.max(0, pB - pAB));

  return (
    <Frame vb="0 0 310 200">
      {/* sample space border */}
      <rect x="4" y="4" width="302" height="192" rx="8"
        fill="none" stroke={DIM} strokeDasharray="4 4" />
      <text x="14" y="22" fill={DIM} fontSize="11" fontFamily="monospace">S</text>

      {/* B circle (left, blue) */}
      <circle cx="120" cy="96" r="70" fill={`${BLUE}22`} stroke={BLUE} strokeWidth="1.5" />
      {/* A circle (right, gold) */}
      <circle cx="196" cy="96" r="64" fill="none" stroke={GOLD} strokeWidth="1.5" />

      {/* Overlap fill via clip */}
      <defs>
        <clipPath id="venn-clip"><circle cx="196" cy="96" r="64" /></clipPath>
      </defs>
      <circle cx="120" cy="96" r="70" fill={`${GOLD}55`} clipPath="url(#venn-clip)" />

      {/* Event labels */}
      <text x="76" y="92" fill={BLUE}  fontSize="15" fontWeight="700">{lB}</text>
      <text x="234" y="92" fill={GOLD} fontSize="15" fontWeight="700">{lA}</text>

      {/* Probability values in each region */}
      <text x="76" y="112" fill={BLUE}  fontSize="10" fontFamily="monospace" textAnchor="middle">{pBonly}</text>
      <text x="155" y="99" fill={GOLD}  fontSize="10" fontFamily="monospace" textAnchor="middle">{fmt4(pAB)}</text>
      <text x="234" y="112" fill={GOLD} fontSize="10" fontFamily="monospace" textAnchor="middle">{pAonly}</text>

      {/* P(A∩B) label at bottom of overlap */}
      <text x="155" y="118" fill={GOLD} fontSize="9" fontFamily="monospace" textAnchor="middle">A∩B</text>

      {/* Derived conditional at foot */}
      <text x="155" y="178" fill={DIM} fontSize="10" fontFamily="monospace" textAnchor="middle">
        {`P(${lA}|${lB}) = ${fmt4(pAB)} / ${fmt4(pB)} = ${pAgivB}`}
      </text>
    </Frame>
  );
}

// ── 2. Probability tree ────────────────────────────────────────────────────
/**
 * labels: p1, l1, p11, l11, p12, l12, p21, l21, p22, l22
 * Shows actual branch probabilities and joint products at each leaf.
 */
function Tree({ L }: { L: Labels }) {
  const p1  = g(L, "p1",  0.70);
  const p2  = fmt4(1 - p1);
  const p11 = g(L, "p11", 0.80);
  const p12 = fmt4(1 - p11);
  const p21 = g(L, "p21", 0.40);
  const p22 = fmt4(1 - p21);
  const l1  = gs(L, "l1",  "A");
  const l2  = gs(L, "l2",  "A'");
  const l11 = gs(L, "l11", "B|A");
  const l12 = gs(L, "l12", "B'|A");
  const l21 = gs(L, "l21", "B|A'");
  const l22 = gs(L, "l22", "B'|A'");
  // joint products
  const j11 = fmt4(p1 * p11);
  const j12 = fmt4(p1 * Number(p12));
  const j21 = fmt4((1-p1) * p21);
  const j22 = fmt4((1-p1) * Number(p22));

  return (
    <Frame vb="0 0 340 220">
      {/* root */}
      <circle cx="28" cy="110" r="6" fill={GOLD} />

      {/* level 1 branches */}
      <line x1="34" y1="110" x2="140" y2="55"  stroke={STROKE} strokeWidth="1.5" />
      <line x1="34" y1="110" x2="140" y2="165" stroke={STROKE} strokeWidth="1.5" />
      <text x="70" y="72"  fill={GOLD} fontSize="10" fontFamily="monospace">{fmt4(p1)}</text>
      <text x="70" y="148" fill={GOLD} fontSize="10" fontFamily="monospace">{p2}</text>
      <text x="143" y="51"  fill={BLUE} fontSize="11" fontWeight="700">{l1}</text>
      <text x="143" y="169" fill={BLUE} fontSize="11" fontWeight="700">{l2}</text>
      <circle cx="140" cy="55"  r="5" fill={BLUE} />
      <circle cx="140" cy="165" r="5" fill={BLUE} />

      {/* level 2 — upper subtree */}
      <line x1="145" y1="55"  x2="245" y2="20"  stroke={STROKE} />
      <line x1="145" y1="55"  x2="245" y2="90"  stroke={STROKE} />
      <text x="180" y="28"  fill={DIM} fontSize="9" fontFamily="monospace">{fmt4(p11)}</text>
      <text x="180" y="78"  fill={DIM} fontSize="9" fontFamily="monospace">{p12}</text>
      <circle cx="248" cy="20"  r="4" fill={GREEN} />
      <circle cx="248" cy="90"  r="4" fill={GREEN} />
      <text x="256" y="23"  fill={DIM} fontSize="9" fontFamily="monospace">{l11}</text>
      <text x="256" y="93"  fill={DIM} fontSize="9" fontFamily="monospace">{l12}</text>
      <text x="256" y="35"  fill={GREEN} fontSize="8" fontFamily="monospace">={j11}</text>
      <text x="256" y="105" fill={GREEN} fontSize="8" fontFamily="monospace">={j12}</text>

      {/* level 2 — lower subtree */}
      <line x1="145" y1="165" x2="245" y2="130" stroke={STROKE} />
      <line x1="145" y1="165" x2="245" y2="200" stroke={STROKE} />
      <text x="180" y="138" fill={DIM} fontSize="9" fontFamily="monospace">{fmt4(p21)}</text>
      <text x="180" y="188" fill={DIM} fontSize="9" fontFamily="monospace">{p22}</text>
      <circle cx="248" cy="130" r="4" fill={GREEN} />
      <circle cx="248" cy="200" r="4" fill={GREEN} />
      <text x="256" y="133" fill={DIM} fontSize="9" fontFamily="monospace">{l21}</text>
      <text x="256" y="203" fill={DIM} fontSize="9" fontFamily="monospace">{l22}</text>
      <text x="256" y="145" fill={GREEN} fontSize="8" fontFamily="monospace">={j21}</text>
      <text x="256" y="215" fill={GREEN} fontSize="8" fontFamily="monospace">={j22}</text>
    </Frame>
  );
}

// ── 3. Partition — law of total probability ────────────────────────────────
function Partition({ L }: { L: Labels }) {
  const labels = [gs(L, "l1", "B₁"), gs(L, "l2", "B₂"), gs(L, "l3", "B₃")];
  const colors = [BLUE, GOLD, GREEN] as const;
  return (
    <Frame vb="0 0 300 160">
      {labels.map((lbl, i) => (
        <g key={i}>
          <rect x={10 + i * 95} y="20" width="90" height="120"
            fill={`${colors[i]}1f`} stroke={colors[i]} strokeWidth="1.5" />
          <text x={55 + i * 95} y="38" fill={colors[i]} fontSize="13" fontWeight="700"
            textAnchor="middle">{lbl}</text>
        </g>
      ))}
      <rect x="10" y="84" width="285" height="34"
        fill={`${GOLD}44`} stroke={GOLD} strokeDasharray="4 3" />
      <text x="152" y="106" fill={GOLD} fontSize="12" fontWeight="700" textAnchor="middle">
        A = Σ A∩Bᵢ
      </text>
    </Frame>
  );
}

// ── 4. Bell curve — normal distribution ───────────────────────────────────
/**
 * labels: mu, sigma, x1?
 * Shows labelled μ value, σ ticks with actual numbers, and if x1 is
 * provided, draws a vertical marker and shades the relevant tail.
 */
function Bell({ L }: { L: Labels }) {
  const mu    = g(L, "mu",    0);
  const sigma = g(L, "sigma", 1);
  const x1raw = L?.x1 !== undefined ? Number(L.x1) : undefined;

  const W = 320, H = 170, x0 = 10, x1 = 310, mid = (x0 + x1) / 2, base = 150;
  const sig = (x1 - x0) / 8;   // pixel width per σ
  const peak = 118;
  const toPixel = (v: number) => mid + ((v - mu) / sigma) * sig;
  const yAt    = (px: number) => base - peak * Math.exp(-0.5 * ((px - mid) / sig) ** 2);

  const pts: string[] = [];
  for (let x = x0; x <= x1; x += 3) pts.push(`${x},${yAt(x).toFixed(1)}`);

  const tick = (k: number) => mid + k * sig;
  const xLabel = (v: number) => {
    const raw = mu + v * sigma;
    return Number(raw.toFixed(2)).toString();
  };

  // If x1 is given, shade from x1 rightward (P(X > x1) region)
  const markerPx = x1raw !== undefined ? toPixel(x1raw) : undefined;

  return (
    <Frame vb={`0 0 ${W} ${H}`}>
      {/* axis */}
      <line x1={x0} y1={base} x2={x1} y2={base} stroke={DIM} />

      {/* σ bands */}
      {[1, 2, 3].map((k) => (
        <g key={k}>
          <line x1={tick(k)}  y1={base} x2={tick(k)}  y2={yAt(tick(k))}  stroke={DIM} strokeDasharray="3 3" />
          <line x1={tick(-k)} y1={base} x2={tick(-k)} y2={yAt(tick(-k))} stroke={DIM} strokeDasharray="3 3" />
          <text x={tick(k)}  y={base+14} fill={DIM} fontSize="8" fontFamily="monospace" textAnchor="middle">{xLabel(k)}</text>
          <text x={tick(-k)} y={base+14} fill={DIM} fontSize="8" fontFamily="monospace" textAnchor="middle">{xLabel(-k)}</text>
        </g>
      ))}

      {/* curve fill */}
      <polygon points={`${x0},${base} ${pts.join(" ")} ${x1},${base}`} fill={`${GOLD}14`} />
      <polyline points={pts.join(" ")} fill="none" stroke={GOLD} strokeWidth="2" />

      {/* mean line */}
      <line x1={mid} y1={base} x2={mid} y2={yAt(mid)} stroke={BLUE} strokeWidth="1.5" />
      <text x={mid} y={base+14} fill={BLUE} fontSize="9" fontFamily="monospace" textAnchor="middle">
        μ={Number(mu.toFixed(2)).toString()}
      </text>

      {/* x1 marker */}
      {markerPx !== undefined && (
        <>
          {/* shade right tail */}
          {(() => {
            const tailPts = pts.filter(p => parseFloat(p.split(",")[0]) >= markerPx);
            const polyPts = `${markerPx},${base} ${tailPts.join(" ")} ${x1},${base}`;
            return <polygon points={polyPts} fill={`${RED}44`} />;
          })()}
          <line x1={markerPx} y1={base} x2={markerPx} y2={yAt(markerPx)} stroke={RED} strokeWidth="2" />
          <text x={markerPx} y={base+14} fill={RED} fontSize="9" fontFamily="monospace" textAnchor="middle">
            {Number(x1raw!.toFixed(2)).toString()}
          </text>
          <text x={markerPx+6} y={yAt(markerPx)-8} fill={RED} fontSize="8" fontFamily="monospace">
            Z={(((x1raw! - mu) / sigma).toFixed(2))}
          </text>
        </>
      )}

      <text x={mid+4} y={yAt(mid)-6} fill={DIM} fontSize="8" fontFamily="monospace">
        σ={Number(sigma.toFixed(2)).toString()}  68·95·99.7
      </text>
    </Frame>
  );
}

// ── 5. Discrete PMF bars ───────────────────────────────────────────────────
/**
 * labels: ps (comma-sep probs e.g. "0.1,0.3,0.4,0.2"), xs? (x labels), highlight?
 */
function PmfBars({ L }: { L: Labels }) {
  const psRaw = gs(L, "ps", "0.10,0.25,0.30,0.20,0.10,0.05");
  const probs = psRaw.split(",").map(Number).filter(v => !isNaN(v));
  const xsRaw = gs(L, "xs", "");
  const xLabels = xsRaw ? xsRaw.split(",") : probs.map((_, i) => String(i));
  const highlight = L?.highlight !== undefined ? Number(L.highlight) : -1;

  const W = 300, base = 140, bw = Math.max(20, Math.floor(260 / probs.length) - 6);
  const gap = Math.max(4, Math.floor(40 / probs.length));
  const x0 = 24, scale = 340;

  return (
    <Frame vb={`0 0 ${W} 165`}>
      <line x1={x0 - 4} y1={base} x2={W - 6} y2={base} stroke={DIM} />
      <text x={x0} y="14" fill={DIM} fontSize="10" fontFamily="monospace">P(X = x)</text>
      {probs.map((p, i) => {
        const h = p * scale;
        const x = x0 + i * (bw + gap);
        const isHigh = i === highlight;
        const fill = isHigh ? `${GREEN}88` : `${GOLD}55`;
        const strokeC = isHigh ? GREEN : GOLD;
        return (
          <g key={i}>
            <rect x={x} y={base - h} width={bw} height={h}
              fill={fill} stroke={strokeC} strokeWidth={isHigh ? 2 : 1} />
            <text x={x + bw / 2} y={base + 13}
              fill={isHigh ? GREEN : DIM} fontSize="10" fontFamily="monospace"
              textAnchor="middle">{xLabels[i] ?? i}</text>
            {/* probability label above bar */}
            <text x={x + bw / 2} y={base - h - 3}
              fill={isHigh ? GREEN : DIM} fontSize="8" fontFamily="monospace"
              textAnchor="middle">{p.toFixed(2)}</text>
          </g>
        );
      })}
    </Frame>
  );
}

// ── 6. Poisson timeline ────────────────────────────────────────────────────
/**
 * labels: lambda, t, expected?
 * Shows the time window [0, t], rates λ and E[N]=λt.
 * Dots are spaced approximately at rate λ.
 */
function PoissonTimeline({ L }: { L: Labels }) {
  const lambda   = g(L, "lambda", 3);
  const t        = g(L, "t",      1);
  const expected = g(L, "expected", lambda * t);

  // Approximate dot positions (evenly spaced at λ per unit time)
  const n = Math.min(Math.round(lambda * t), 12);
  const w = 296;
  const dots = n > 0
    ? Array.from({ length: n }, (_, i) => 22 + Math.round((i + 0.5) * w / n))
    : [22 + w / 2];

  return (
    <Frame vb="0 0 340 120">
      {/* axis */}
      <line x1="18" y1="60" x2="324" y2="60" stroke={STROKE} />
      <polygon points="324,60 316,56 316,64" fill={STROKE} />

      {/* time window bracket */}
      <line x1="22" y1="44" x2="22" y2="76" stroke={GOLD} strokeWidth="1.5" />
      <line x1="318" y1="44" x2="318" y2="76" stroke={GOLD} strokeWidth="1.5" />

      {dots.map((x, i) => (
        <g key={i}>
          <line x1={x} y1="54" x2={x} y2="66" stroke={GOLD} strokeWidth="2" />
          <circle cx={x} cy="60" r="4.5" fill={GOLD} />
        </g>
      ))}

      <text x="22"  y="88" fill={DIM} fontSize="10" fontFamily="monospace">t = 0</text>
      <text x="302" y="88" fill={DIM} fontSize="10" fontFamily="monospace" textAnchor="end">t = {Number(t.toFixed(2))}</text>
      <text x="170" y="20" fill={GOLD} fontSize="11" fontFamily="monospace" textAnchor="middle">
        λ = {Number(lambda.toFixed(2))}
      </text>
      <text x="170" y="108" fill={DIM} fontSize="10" fontFamily="monospace" textAnchor="middle">
        E[N in (0,{Number(t.toFixed(2))})] = λt = {Number(expected.toFixed(4))}
      </text>
    </Frame>
  );
}

// ── 7. Exponential decay ───────────────────────────────────────────────────
/**
 * labels: lambda, x0?
 * Draws f(x)=λe^{−λx}. If x0 given, shows the shaded tail P(X > x0) = e^{−λx0}.
 */
function Exponential({ L }: { L: Labels }) {
  const lambda = g(L, "lambda", 0.5);
  const x0raw  = L?.x0 !== undefined ? Number(L.x0) : undefined;

  const W = 300, H = 160, px0 = 18, px1 = 282, base = 138, peak = 110;
  // Map domain [0, 6/lambda] to [px0, px1]
  const domain = 6 / lambda;
  const toPixel = (v: number) => px0 + (v / domain) * (px1 - px0);
  const yAt    = (px: number) => {
    const v = ((px - px0) / (px1 - px0)) * domain;
    return base - peak * lambda * Math.exp(-lambda * v) / lambda;
  };

  const pts: string[] = [];
  for (let x = px0; x <= px1; x += 3) {
    const v  = ((x - px0) / (px1 - px0)) * domain;
    const yv = base - peak * Math.exp(-lambda * v);
    pts.push(`${x},${yv.toFixed(1)}`);
  }

  const markerPx = x0raw !== undefined ? toPixel(x0raw) : undefined;
  const pGtX0    = x0raw !== undefined ? Math.exp(-lambda * x0raw) : undefined;

  return (
    <Frame vb={`0 0 ${W} ${H}`}>
      <line x1={px0} y1={base} x2={px1} y2={base} stroke={DIM} />
      <line x1={px0} y1="18"  x2={px0} y2={base}  stroke={DIM} />

      {/* shaded tail if x0 given */}
      {markerPx !== undefined && (
        (() => {
          const tailPts = pts.filter(p => parseFloat(p.split(",")[0]) >= markerPx!);
          const poly = `${markerPx},${base} ${tailPts.join(" ")} ${px1},${base}`;
          return <polygon points={poly} fill={`${GREEN}44`} />;
        })()
      )}

      <polygon points={`${px0},${base} ${pts.join(" ")} ${px1},${base}`} fill={`${BLUE}14`} />
      <polyline points={pts.join(" ")} fill="none" stroke={BLUE} strokeWidth="2.5" />

      {/* λ label */}
      <text x={px0 + 6} y="28" fill={DIM} fontSize="10" fontFamily="monospace">
        f(x) = {Number(lambda.toFixed(2))} · e^(−{Number(lambda.toFixed(2))}x)
      </text>
      <text x={px1 - 8} y={base + 14} fill={DIM} fontSize="10" fontFamily="monospace" textAnchor="end">x →</text>

      {/* x0 marker */}
      {markerPx !== undefined && x0raw !== undefined && pGtX0 !== undefined && (
        <>
          <line x1={markerPx} y1={base} x2={markerPx} y2={yAt(markerPx)} stroke={GREEN} strokeWidth="2" />
          <text x={markerPx} y={base + 14} fill={GREEN} fontSize="9" fontFamily="monospace" textAnchor="middle">
            {Number(x0raw.toFixed(2))}
          </text>
          <text x={markerPx + 4} y={yAt(markerPx) - 5} fill={GREEN} fontSize="9" fontFamily="monospace">
            P(&gt;{Number(x0raw.toFixed(2))}) = {pGtX0.toFixed(4)}
          </text>
        </>
      )}
    </Frame>
  );
}

// ── 8. Uniform distribution ────────────────────────────────────────────────
/**
 * labels: a, b, x1?, x2?
 * Shows the flat density on [a,b]. If x1/x2 given, shades P(x1 < X < x2).
 */
function Uniform({ L }: { L: Labels }) {
  const a  = g(L, "a",  0);
  const b  = g(L, "b",  10);
  const x1 = L?.x1 !== undefined ? Number(L.x1) : undefined;
  const x2 = L?.x2 !== undefined ? Number(L.x2) : undefined;

  const px0 = 28, px1 = 278, base = 130, top = 50;
  const toPixel = (v: number) => px0 + ((v - a) / (b - a)) * (px1 - px0);
  const density = 1 / (b - a);
  const height  = base - top;

  const shadeLeft  = x1 !== undefined ? toPixel(Math.max(a, x1)) : undefined;
  const shadeRight = x2 !== undefined ? toPixel(Math.min(b, x2)) : undefined;
  const prob = (x1 !== undefined && x2 !== undefined) ? (x2 - x1) / (b - a) : undefined;

  return (
    <Frame vb="0 0 308 168">
      {/* axes */}
      <line x1="12" y1={base} x2="292" y2={base} stroke={DIM} />
      <line x1="12" y1="28"   x2="12"  y2={base} stroke={DIM} />

      {/* shaded probability region */}
      {shadeLeft !== undefined && shadeRight !== undefined && (
        <rect x={shadeLeft} y={top} width={shadeRight - shadeLeft} height={height}
          fill={`${GREEN}55`} />
      )}

      {/* density rectangle */}
      <rect x={px0} y={top} width={px1 - px0} height={height}
        fill={`${GOLD}1f`} stroke={GOLD} strokeWidth="2" />
      <line x1={px0} y1={base} x2={px0} y2={top} stroke={GOLD} strokeDasharray="3 3" />
      <line x1={px1} y1={base} x2={px1} y2={top} stroke={GOLD} strokeDasharray="3 3" />

      {/* axis labels */}
      <text x={px0} y={base+14} fill={DIM} fontSize="11" fontFamily="monospace" textAnchor="middle">
        {Number(a.toFixed(2)).toString()}
      </text>
      <text x={px1} y={base+14} fill={DIM} fontSize="11" fontFamily="monospace" textAnchor="middle">
        {Number(b.toFixed(2)).toString()}
      </text>
      <text x={(px0+px1)/2} y={top-6} fill={DIM} fontSize="10" fontFamily="monospace" textAnchor="middle">
        f(x) = 1/({Number((b-a).toFixed(2))}) = {Number(density.toFixed(4))}
      </text>

      {/* x1/x2 markers */}
      {shadeLeft !== undefined && x1 !== undefined && (
        <>
          <line x1={shadeLeft} y1={base} x2={shadeLeft} y2={top} stroke={GREEN} strokeWidth="1.5" strokeDasharray="3 2" />
          <text x={shadeLeft} y={base+14} fill={GREEN} fontSize="9" fontFamily="monospace" textAnchor="middle">
            {Number(x1.toFixed(2))}
          </text>
        </>
      )}
      {shadeRight !== undefined && x2 !== undefined && (
        <>
          <line x1={shadeRight} y1={base} x2={shadeRight} y2={top} stroke={GREEN} strokeWidth="1.5" strokeDasharray="3 2" />
          <text x={shadeRight} y={base+14} fill={GREEN} fontSize="9" fontFamily="monospace" textAnchor="middle">
            {Number(x2.toFixed(2))}
          </text>
        </>
      )}
      {prob !== undefined && shadeLeft !== undefined && shadeRight !== undefined && (
        <text x={(shadeLeft+shadeRight)/2} y={top+height/2+5} fill={GREEN} fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="700">
          {prob.toFixed(4)}
        </text>
      )}
    </Frame>
  );
}

// ── 9. CLT — sampling distribution ────────────────────────────────────────
function Clt({ L }: { L: Labels }) {
  const W = 320, H = 165, mid = W / 2, base = 140;
  const curve = (sigma: number, peak: number, color: string, key: number) => {
    const pts: string[] = [];
    for (let x = 10; x <= W - 10; x += 4)
      pts.push(`${x},${(base - peak * Math.exp(-0.5 * ((x - mid) / sigma) ** 2)).toFixed(1)}`);
    return <polyline key={key} points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" opacity={0.4 + key * 0.2} />;
  };
  return (
    <Frame vb={`0 0 ${W} ${H}`}>
      <line x1="10" y1={base} x2={W - 10} y2={base} stroke={DIM} />
      {curve(48, 46, BLUE, 0)}
      {curve(30, 74, GOLD, 1)}
      {curve(16, 112, GREEN, 2)}
      <text x={mid} y={base + 14} fill={DIM} fontSize="9" fontFamily="monospace" textAnchor="middle">μ</text>
      <text x={W - 14} y="20" fill={GREEN} fontSize="9" fontFamily="monospace" textAnchor="end">large n →</text>
      <text x="14"    y="20" fill={BLUE}  fontSize="9" fontFamily="monospace">small n</text>
      <text x={mid}   y="14" fill={DIM}   fontSize="9" fontFamily="monospace" textAnchor="middle">as n ↑ the sampling dist tightens to normal</text>
    </Frame>
  );
}

// ── 10. Hypergeometric urn ──────────────────────────────────────────────────
/**
 * labels: N, K, n
 * Renders K gold balls + (N-K) blue balls in the urn, and n drawn balls outside.
 */
function Urn({ L }: { L: Labels }) {
  const N = Math.round(g(L, "N", 10));
  const K = Math.round(g(L, "K", 4));
  const n = Math.round(g(L, "n", 3));
  const rest = Math.max(0, N - K);

  // Urn interior: arrange balls in rows of 4
  const popBalls: {x:number; y:number; c:string}[] = [];
  for (let i = 0; i < Math.min(K, 12); i++)
    popBalls.push({ x: 210 + (i % 4) * 22, y: 48 + Math.floor(i / 4) * 22, c: GOLD });
  for (let i = 0; i < Math.min(rest, 8); i++)
    popBalls.push({ x: 210 + (i % 4) * 22, y: 48 + Math.floor((K + i) / 4) * 22, c: BLUE });

  // Drawn balls (outside urn)
  const drawnBalls = Array.from({ length: Math.min(n, 5) }, (_, i) => ({
    x: 38 + i * 26, c: i < K ? GOLD : BLUE,
  }));

  return (
    <Frame vb="0 0 320 150">
      {/* urn body */}
      <path d="M200 28 q-14 0 -14 18 l0 72 q0 14 14 14 l96 0 q14 0 14 -14 l0 -72 q0 -18 -14 -18 z"
        fill="rgba(255,255,255,0.03)" stroke={DIM} />
      {popBalls.map((b, i) =>
        <circle key={i} cx={b.x} cy={b.y} r="8" fill={`${b.c}55`} stroke={b.c} />)}
      <text x="248" y="144" fill={DIM} fontSize="9" fontFamily="monospace" textAnchor="middle">
        N={N} ({K} ⬤ gold, {rest} ⬤ blue)
      </text>

      {/* drawn balls */}
      {drawnBalls.map((b, i) =>
        <circle key={i} cx={b.x} cy="65" r="12" fill={`${b.c}77`} stroke={b.c} strokeWidth="2" />)}
      <text x="68"  y="98" fill={DIM} fontSize="9" fontFamily="monospace" textAnchor="middle">
        drawn n={n} (no replace)
      </text>
      <text x="162" y="68" fill={DIM} fontSize="18" textAnchor="middle">→</text>
    </Frame>
  );
}

// ── 11. FM cash-flow timeline ───────────────────────────────────────────────
/**
 * labels: n, pmt, rate, t0val?
 * Draws a proper timeline with:
 *   t=0: downward arrow = initial loan/purchase (t0val, negative = outflow)
 *   t=1..n: upward arrows = payments (pmt)
 *   interest rate shown above
 */
function Timeline({ L }: { L: Labels }) {
  const n     = Math.round(g(L, "n",    5));
  const pmt   = g(L, "pmt",  100);
  const rate  = g(L, "rate", 0.05);
  const t0val = L?.t0val !== undefined ? Number(L.t0val) : undefined;

  const periods = Math.min(n, 8);
  const W = 360, axisY = 70;
  const xs = Array.from({ length: periods + 1 }, (_, i) =>
    Math.round(20 + (i * (W - 40)) / periods));

  return (
    <Frame vb={`0 0 ${W} 120`}>
      {/* axis */}
      <line x1="16" y1={axisY} x2={W - 14} y2={axisY} stroke={STROKE} />
      <polygon points={`${W-14},${axisY} ${W-22},${axisY-4} ${W-22},${axisY+4}`} fill={STROKE} />

      {/* interest rate label */}
      <text x={W / 2} y="12" fill={DIM} fontSize="10" fontFamily="monospace" textAnchor="middle">
        i = {(rate * 100).toFixed(2)}%
      </text>

      {xs.map((x, i) => {
        const isT0 = i === 0;
        return (
          <g key={i}>
            {/* time tick */}
            <line x1={x} y1={axisY - 5} x2={x} y2={axisY + 5} stroke={DIM} />
            <text x={x} y={axisY + 17} fill={DIM} fontSize="9" fontFamily="monospace" textAnchor="middle">
              {i}
            </text>

            {/* t=0: initial outflow downward */}
            {isT0 && t0val !== undefined && (
              <>
                <line x1={x} y1={axisY} x2={x} y2={axisY + 35} stroke={RED} strokeWidth="2" />
                <polygon points={`${x},${axisY+35} ${x-4},${axisY+27} ${x+4},${axisY+27}`} fill={RED} />
                <text x={x} y={axisY + 50} fill={RED} fontSize="9" fontFamily="monospace" textAnchor="middle">
                  {Number(Math.abs(t0val).toFixed(2))}
                </text>
              </>
            )}

            {/* t>0: periodic payments upward */}
            {!isT0 && (
              <>
                <line x1={x} y1={axisY} x2={x} y2={axisY - 35} stroke={GOLD} strokeWidth="2" />
                <polygon points={`${x},${axisY-35} ${x-4},${axisY-27} ${x+4},${axisY-27}`} fill={GOLD} />
                <text x={x} y={axisY - 39} fill={GOLD} fontSize="8" fontFamily="monospace" textAnchor="middle">
                  {Number(pmt.toFixed(2))}
                </text>
              </>
            )}
          </g>
        );
      })}

      {n > 8 && (
        <text x={W / 2} y={axisY + 55} fill={DIM} fontSize="9" fontFamily="monospace" textAnchor="middle">
          (showing first 8 of {n} periods)
        </text>
      )}
    </Frame>
  );
}

// ── Registry & export ───────────────────────────────────────────────────────
type DiagramProps = { L: Labels };
const REGISTRY: Record<DiagramKind, React.FC<DiagramProps>> = {
  "venn-conditional": VennConditional,
  "tree":             Tree,
  "partition":        Partition,
  "bell":             Bell,
  "pmf-bars":         PmfBars,
  "poisson-timeline": PoissonTimeline,
  "exponential":      Exponential,
  "uniform":          Uniform,
  "clt":              Clt,
  "urn":              Urn,
  "timeline":         Timeline,
};

export default function Diagram({
  kind,
  labels,
}: {
  kind: DiagramKind;
  labels?: Record<string, string | number | undefined>;
}) {
  const Cmp = REGISTRY[kind];
  if (!Cmp) return null;
  return (
    <div style={{ padding: "0.5rem 0" }}>
      <Cmp L={labels} />
    </div>
  );
}
