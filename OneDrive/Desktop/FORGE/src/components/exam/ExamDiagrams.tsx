"use client";

/**
 * ExamDiagrams — data-driven SVG diagrams for actuarial study.
 *
 * Every diagram component is paired with an ExplanationPanel that:
 *   1. Labels every visual element in plain English with the real question values
 *   2. States the formula being applied and WHY it applies
 *   3. Shows the arithmetic step-by-step
 *   4. Highlights the final result
 *
 * A student reading the diagram + panel should fully understand the question
 * without any external reference.
 */

import type { DiagramKind } from "@/lib/examPaths";

// ── Design tokens ──────────────────────────────────────────────────────────
const GOLD = "#D4AF37";
const BLUE = "#60a5fa";
const GREEN = "#22c55e";
const RED = "#f87171";
const DIM = "rgba(255,255,255,0.45)";
const STROKE = "rgba(255,255,255,0.65)";

// ── Helpers ────────────────────────────────────────────────────────────────
type Labels = Record<string, string | number | undefined> | undefined;
const g = (L: Labels, k: string, def: number) => (L && L[k] !== undefined ? Number(L[k]) : def);
const gs = (L: Labels, k: string, def: string) => (L && L[k] !== undefined ? String(L[k]) : def);
const fmt4 = (n: number) => Number(n.toFixed(4)).toString();
const fmt2 = (n: number) => Number(n.toFixed(2)).toString();

// ── Explanation panel ──────────────────────────────────────────────────────
type ExplRow =
  | { t: "head"; text: string }
  | { t: "bullet"; text: string }
  | { t: "formula"; text: string }
  | { t: "step"; text: string }
  | { t: "result"; text: string };

function ExplanationPanel({ rows }: { rows: ExplRow[] }) {
  return (
    <div style={{
      marginTop: "0.875rem",
      padding: "0.875rem 1rem",
      background: "rgba(255,255,255,0.025)",
      borderRadius: 8,
      border: "1px solid rgba(255,255,255,0.08)",
      fontSize: "0.8125rem",
      lineHeight: 1.7,
      fontFamily: "var(--font-mono)",
      color: "rgba(255,255,255,0.7)",
    }}>
      {rows.map((row, i) => {
        switch (row.t) {
          case "head":
            return (
              <div key={i} style={{
                color: "rgba(255,255,255,0.35)", fontSize: "0.5625rem", letterSpacing: "0.18em",
                textTransform: "uppercase", marginTop: i > 0 ? "0.875rem" : 0, marginBottom: "0.3rem",
              }}>
                {row.text}
              </div>
            );
          case "bullet":
            return (
              <div key={i} style={{ paddingLeft: "0.625rem", display: "flex", gap: "0.5rem", marginBottom: "0.1rem" }}>
                <span style={{ color: GOLD, flexShrink: 0 }}>•</span>
                <span>{row.text}</span>
              </div>
            );
          case "formula":
            return (
              <div key={i} style={{ color: BLUE, paddingLeft: "0.625rem", marginBottom: "0.1rem" }}>
                {row.text}
              </div>
            );
          case "step":
            return (
              <div key={i} style={{ color: "rgba(255,255,255,0.5)", paddingLeft: "1.5rem", marginBottom: "0.05rem" }}>
                {row.text}
              </div>
            );
          case "result":
            return (
              <div key={i} style={{
                marginTop: "0.625rem",
                padding: "0.375rem 0.75rem",
                background: "rgba(212,175,55,0.1)",
                borderLeft: `3px solid ${GOLD}`,
                borderRadius: "0 4px 4px 0",
                color: GOLD,
                fontWeight: 700,
                fontSize: "0.875rem",
              }}>
                {row.text}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

// ── SVG frame ──────────────────────────────────────────────────────────────
function Frame({ vb, children }: { vb: string; children: React.ReactNode }) {
  return (
    <svg viewBox={vb} role="img"
      style={{ width: "100%", height: "auto", maxWidth: 460, display: "block", margin: "0 auto" }}>
      {children}
    </svg>
  );
}

// ── 1. Venn, conditional probability ──────────────────────────────────────
function VennConditional({ L }: { L: Labels }) {
  const pA = g(L, "pA", 0.40);
  const pB = g(L, "pB", 0.30);
  const pAB = g(L, "pAB", 0.12);
  const lA = gs(L, "labelA", "A");
  const lB = gs(L, "labelB", "B");
  const pAgivB = pB > 0 ? fmt4(pAB / pB) : "n/a";
  const pAonly = fmt4(Math.max(0, pA - pAB));
  const pBonly = fmt4(Math.max(0, pB - pAB));

  return (
    <Frame vb="0 0 310 200">
      <rect x="4" y="4" width="302" height="192" rx="8"
        fill="none" stroke={DIM} strokeDasharray="4 4" />
      <text x="14" y="22" fill={DIM} fontSize="11" fontFamily="monospace">S</text>
      <circle cx="120" cy="96" r="70" fill={`${BLUE}22`} stroke={BLUE} strokeWidth="1.5" />
      <circle cx="196" cy="96" r="64" fill="none" stroke={GOLD} strokeWidth="1.5" />
      <defs>
        <clipPath id="venn-clip"><circle cx="196" cy="96" r="64" /></clipPath>
      </defs>
      <circle cx="120" cy="96" r="70" fill={`${GOLD}55`} clipPath="url(#venn-clip)" />
      <text x="76" y="92" fill={BLUE} fontSize="15" fontWeight="700">{lB}</text>
      <text x="234" y="92" fill={GOLD} fontSize="15" fontWeight="700">{lA}</text>
      <text x="76" y="112" fill={BLUE} fontSize="10" fontFamily="monospace" textAnchor="middle">{pBonly}</text>
      <text x="155" y="99" fill={GOLD} fontSize="10" fontFamily="monospace" textAnchor="middle">{fmt4(pAB)}</text>
      <text x="234" y="112" fill={GOLD} fontSize="10" fontFamily="monospace" textAnchor="middle">{pAonly}</text>
      <text x="155" y="118" fill={GOLD} fontSize="9" fontFamily="monospace" textAnchor="middle">{lA}∩{lB}</text>
      <text x="155" y="178" fill={DIM} fontSize="10" fontFamily="monospace" textAnchor="middle">
        {`P(${lA}|${lB}) = ${fmt4(pAB)} / ${fmt4(pB)} = ${pAgivB}`}
      </text>
    </Frame>
  );
}

// ── 2. Probability tree ────────────────────────────────────────────────────
function Tree({ L }: { L: Labels }) {
  const p1 = g(L, "p1", 0.70);
  const p2 = fmt4(1 - p1);
  const p11 = g(L, "p11", 0.80);
  const p12 = fmt4(1 - p11);
  const p21 = g(L, "p21", 0.40);
  const p22 = fmt4(1 - p21);
  const l1 = gs(L, "l1", "A");
  const l2 = gs(L, "l2", "A′");
  const l11 = gs(L, "l11", "B|A");
  const l12 = gs(L, "l12", "B′|A");
  const l21 = gs(L, "l21", "B|A′");
  const l22 = gs(L, "l22", "B′|A′");
  const j11 = fmt4(p1 * p11);
  const j12 = fmt4(p1 * Number(p12));
  const j21 = fmt4((1 - p1) * p21);
  const j22 = fmt4((1 - p1) * Number(p22));

  return (
    <Frame vb="0 0 340 220">
      <circle cx="28" cy="110" r="6" fill={GOLD} />
      <line x1="34" y1="110" x2="140" y2="55" stroke={STROKE} strokeWidth="1.5" />
      <line x1="34" y1="110" x2="140" y2="165" stroke={STROKE} strokeWidth="1.5" />
      <text x="70" y="72" fill={GOLD} fontSize="10" fontFamily="monospace">{fmt4(p1)}</text>
      <text x="70" y="148" fill={GOLD} fontSize="10" fontFamily="monospace">{p2}</text>
      <text x="143" y="51" fill={BLUE} fontSize="11" fontWeight="700">{l1}</text>
      <text x="143" y="169" fill={BLUE} fontSize="11" fontWeight="700">{l2}</text>
      <circle cx="140" cy="55" r="5" fill={BLUE} />
      <circle cx="140" cy="165" r="5" fill={BLUE} />
      <line x1="145" y1="55" x2="245" y2="20" stroke={STROKE} />
      <line x1="145" y1="55" x2="245" y2="90" stroke={STROKE} />
      <text x="180" y="28" fill={DIM} fontSize="9" fontFamily="monospace">{fmt4(p11)}</text>
      <text x="180" y="78" fill={DIM} fontSize="9" fontFamily="monospace">{p12}</text>
      <circle cx="248" cy="20" r="4" fill={GREEN} />
      <circle cx="248" cy="90" r="4" fill={GREEN} />
      <text x="256" y="23" fill={DIM} fontSize="9" fontFamily="monospace">{l11}</text>
      <text x="256" y="93" fill={DIM} fontSize="9" fontFamily="monospace">{l12}</text>
      <text x="256" y="35" fill={GREEN} fontSize="8" fontFamily="monospace">={j11}</text>
      <text x="256" y="105" fill={GREEN} fontSize="8" fontFamily="monospace">={j12}</text>
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

// ── 3. Partition, law of total probability ────────────────────────────────
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

// ── 4. Bell curve, normal distribution ────────────────────────────────────
function Bell({ L }: { L: Labels }) {
  const mu = g(L, "mu", 0);
  const sigma = g(L, "sigma", 1);
  const x1raw = L?.x1 !== undefined ? Number(L.x1) : undefined;

  const W = 320, H = 170, x0 = 10, x1 = 310, mid = (x0 + x1) / 2, base = 150;
  const sig = (x1 - x0) / 8;
  const peak = 118;
  const toPixel = (v: number) => mid + ((v - mu) / sigma) * sig;
  const yAt = (px: number) => base - peak * Math.exp(-0.5 * ((px - mid) / sig) ** 2);

  const pts: string[] = [];
  for (let x = x0; x <= x1; x += 3) pts.push(`${x},${yAt(x).toFixed(1)}`);

  const tick = (k: number) => mid + k * sig;
  const xLabel = (v: number) => Number((mu + v * sigma).toFixed(2)).toString();
  const markerPx = x1raw !== undefined ? toPixel(x1raw) : undefined;

  return (
    <Frame vb={`0 0 ${W} ${H}`}>
      <line x1={x0} y1={base} x2={x1} y2={base} stroke={DIM} />
      {[1, 2, 3].map((k) => (
        <g key={k}>
          <line x1={tick(k)} y1={base} x2={tick(k)} y2={yAt(tick(k))} stroke={DIM} strokeDasharray="3 3" />
          <line x1={tick(-k)} y1={base} x2={tick(-k)} y2={yAt(tick(-k))} stroke={DIM} strokeDasharray="3 3" />
          <text x={tick(k)} y={base + 14} fill={DIM} fontSize="8" fontFamily="monospace" textAnchor="middle">{xLabel(k)}</text>
          <text x={tick(-k)} y={base + 14} fill={DIM} fontSize="8" fontFamily="monospace" textAnchor="middle">{xLabel(-k)}</text>
        </g>
      ))}
      <polygon points={`${x0},${base} ${pts.join(" ")} ${x1},${base}`} fill={`${GOLD}14`} />
      <polyline points={pts.join(" ")} fill="none" stroke={GOLD} strokeWidth="2" />
      <line x1={mid} y1={base} x2={mid} y2={yAt(mid)} stroke={BLUE} strokeWidth="1.5" />
      <text x={mid} y={base + 14} fill={BLUE} fontSize="9" fontFamily="monospace" textAnchor="middle">
        μ={Number(mu.toFixed(2)).toString()}
      </text>
      {markerPx !== undefined && (
        <>
          {(() => {
            const tailPts = pts.filter(p => parseFloat(p.split(",")[0]) >= markerPx!);
            const polyPts = `${markerPx},${base} ${tailPts.join(" ")} ${x1},${base}`;
            return <polygon points={polyPts} fill={`${RED}44`} />;
          })()}
          <line x1={markerPx} y1={base} x2={markerPx} y2={yAt(markerPx)} stroke={RED} strokeWidth="2" />
          <text x={markerPx} y={base + 14} fill={RED} fontSize="9" fontFamily="monospace" textAnchor="middle">
            {Number(x1raw!.toFixed(2)).toString()}
          </text>
          <text x={markerPx + 6} y={yAt(markerPx) - 8} fill={RED} fontSize="8" fontFamily="monospace">
            Z={(((x1raw! - mu) / sigma).toFixed(2))}
          </text>
        </>
      )}
      <text x={mid + 4} y={yAt(mid) - 6} fill={DIM} fontSize="8" fontFamily="monospace">
        σ={Number(sigma.toFixed(2)).toString()} 68·95·99.7
      </text>
    </Frame>
  );
}

// ── 5. Discrete PMF bars ───────────────────────────────────────────────────
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
        return (
          <g key={i}>
            <rect x={x} y={base - h} width={bw} height={h}
              fill={isHigh ? `${GREEN}88` : `${GOLD}55`}
              stroke={isHigh ? GREEN : GOLD} strokeWidth={isHigh ? 2 : 1} />
            <text x={x + bw / 2} y={base + 13}
              fill={isHigh ? GREEN : DIM} fontSize="10" fontFamily="monospace"
              textAnchor="middle">{xLabels[i] ?? i}</text>
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
function PoissonTimeline({ L }: { L: Labels }) {
  const lambda = g(L, "lambda", 3);
  const t = g(L, "t", 1);
  const expected = g(L, "expected", lambda * t);
  const n = Math.min(Math.round(lambda * t), 12);
  const w = 296;
  const dots = n > 0
    ? Array.from({ length: n }, (_, i) => 22 + Math.round((i + 0.5) * w / n))
    : [22 + w / 2];

  return (
    <Frame vb="0 0 340 120">
      <line x1="18" y1="60" x2="324" y2="60" stroke={STROKE} />
      <polygon points="324,60 316,56 316,64" fill={STROKE} />
      <line x1="22" y1="44" x2="22" y2="76" stroke={GOLD} strokeWidth="1.5" />
      <line x1="318" y1="44" x2="318" y2="76" stroke={GOLD} strokeWidth="1.5" />
      {dots.map((x, i) => (
        <g key={i}>
          <line x1={x} y1="54" x2={x} y2="66" stroke={GOLD} strokeWidth="2" />
          <circle cx={x} cy="60" r="4.5" fill={GOLD} />
        </g>
      ))}
      <text x="22" y="88" fill={DIM} fontSize="10" fontFamily="monospace">t = 0</text>
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
function Exponential({ L }: { L: Labels }) {
  const lambda = g(L, "lambda", 0.5);
  const x0raw = L?.x0 !== undefined ? Number(L.x0) : undefined;

  const W = 300, H = 160, px0 = 18, px1 = 282, base = 138, peak = 110;
  const domain = 6 / lambda;
  const toPixel = (v: number) => px0 + (v / domain) * (px1 - px0);
  const yAt = (px: number) => {
    const v = ((px - px0) / (px1 - px0)) * domain;
    return base - peak * lambda * Math.exp(-lambda * v) / lambda;
  };

  const pts: string[] = [];
  for (let x = px0; x <= px1; x += 3) {
    const v = ((x - px0) / (px1 - px0)) * domain;
    const yv = base - peak * Math.exp(-lambda * v);
    pts.push(`${x},${yv.toFixed(1)}`);
  }

  const markerPx = x0raw !== undefined ? toPixel(x0raw) : undefined;
  const pGtX0 = x0raw !== undefined ? Math.exp(-lambda * x0raw) : undefined;

  return (
    <Frame vb={`0 0 ${W} ${H}`}>
      <line x1={px0} y1={base} x2={px1} y2={base} stroke={DIM} />
      <line x1={px0} y1="18" x2={px0} y2={base} stroke={DIM} />
      {markerPx !== undefined && (
        (() => {
          const tailPts = pts.filter(p => parseFloat(p.split(",")[0]) >= markerPx!);
          const poly = `${markerPx},${base} ${tailPts.join(" ")} ${px1},${base}`;
          return <polygon points={poly} fill={`${GREEN}44`} />;
        })()
      )}
      <polygon points={`${px0},${base} ${pts.join(" ")} ${px1},${base}`} fill={`${BLUE}14`} />
      <polyline points={pts.join(" ")} fill="none" stroke={BLUE} strokeWidth="2.5" />
      <text x={px0 + 6} y="28" fill={DIM} fontSize="10" fontFamily="monospace">
        f(x) = {Number(lambda.toFixed(2))} · e^(−{Number(lambda.toFixed(2))}x)
      </text>
      <text x={px1 - 8} y={base + 14} fill={DIM} fontSize="10" fontFamily="monospace" textAnchor="end">x →</text>
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
function Uniform({ L }: { L: Labels }) {
  const a = g(L, "a", 0);
  const b = g(L, "b", 10);
  const x1 = L?.x1 !== undefined ? Number(L.x1) : undefined;
  const x2 = L?.x2 !== undefined ? Number(L.x2) : undefined;

  const px0 = 28, px1 = 278, base = 130, top = 50;
  const toPixel = (v: number) => px0 + ((v - a) / (b - a)) * (px1 - px0);
  const density = 1 / (b - a);
  const height = base - top;

  const shadeLeft = x1 !== undefined ? toPixel(Math.max(a, x1)) : undefined;
  const shadeRight = x2 !== undefined ? toPixel(Math.min(b, x2)) : undefined;
  const prob = (x1 !== undefined && x2 !== undefined) ? (x2 - x1) / (b - a) : undefined;

  return (
    <Frame vb="0 0 308 168">
      <line x1="12" y1={base} x2="292" y2={base} stroke={DIM} />
      <line x1="12" y1="28" x2="12" y2={base} stroke={DIM} />
      {shadeLeft !== undefined && shadeRight !== undefined && (
        <rect x={shadeLeft} y={top} width={shadeRight - shadeLeft} height={height} fill={`${GREEN}55`} />
      )}
      <rect x={px0} y={top} width={px1 - px0} height={height}
        fill={`${GOLD}1f`} stroke={GOLD} strokeWidth="2" />
      <line x1={px0} y1={base} x2={px0} y2={top} stroke={GOLD} strokeDasharray="3 3" />
      <line x1={px1} y1={base} x2={px1} y2={top} stroke={GOLD} strokeDasharray="3 3" />
      <text x={px0} y={base + 14} fill={DIM} fontSize="11" fontFamily="monospace" textAnchor="middle">
        {Number(a.toFixed(2)).toString()}
      </text>
      <text x={px1} y={base + 14} fill={DIM} fontSize="11" fontFamily="monospace" textAnchor="middle">
        {Number(b.toFixed(2)).toString()}
      </text>
      <text x={(px0 + px1) / 2} y={top - 6} fill={DIM} fontSize="10" fontFamily="monospace" textAnchor="middle">
        f(x) = 1/({Number((b - a).toFixed(2))}) = {Number(density.toFixed(4))}
      </text>
      {shadeLeft !== undefined && x1 !== undefined && (
        <>
          <line x1={shadeLeft} y1={base} x2={shadeLeft} y2={top} stroke={GREEN} strokeWidth="1.5" strokeDasharray="3 2" />
          <text x={shadeLeft} y={base + 14} fill={GREEN} fontSize="9" fontFamily="monospace" textAnchor="middle">
            {Number(x1.toFixed(2))}
          </text>
        </>
      )}
      {shadeRight !== undefined && x2 !== undefined && (
        <>
          <line x1={shadeRight} y1={base} x2={shadeRight} y2={top} stroke={GREEN} strokeWidth="1.5" strokeDasharray="3 2" />
          <text x={shadeRight} y={base + 14} fill={GREEN} fontSize="9" fontFamily="monospace" textAnchor="middle">
            {Number(x2.toFixed(2))}
          </text>
        </>
      )}
      {prob !== undefined && shadeLeft !== undefined && shadeRight !== undefined && (
        <text x={(shadeLeft + shadeRight) / 2} y={top + height / 2 + 5}
          fill={GREEN} fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="700">
          {prob.toFixed(4)}
        </text>
      )}
    </Frame>
  );
}

// ── 9. CLT sampling distribution ──────────────────────────────────────────
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
      <text x="14" y="20" fill={BLUE} fontSize="9" fontFamily="monospace">small n</text>
      <text x={mid} y="14" fill={DIM} fontSize="9" fontFamily="monospace" textAnchor="middle">as n ↑ the sampling dist tightens to normal</text>
    </Frame>
  );
}

// ── 10. Hypergeometric urn ─────────────────────────────────────────────────
function Urn({ L }: { L: Labels }) {
  const N = Math.round(g(L, "N", 10));
  const K = Math.round(g(L, "K", 4));
  const n = Math.round(g(L, "n", 3));
  const rest = Math.max(0, N - K);

  const popBalls: { x: number; y: number; c: string }[] = [];
  for (let i = 0; i < Math.min(K, 12); i++)
    popBalls.push({ x: 210 + (i % 4) * 22, y: 48 + Math.floor(i / 4) * 22, c: GOLD });
  for (let i = 0; i < Math.min(rest, 8); i++)
    popBalls.push({ x: 210 + (i % 4) * 22, y: 48 + Math.floor((K + i) / 4) * 22, c: BLUE });

  const drawnBalls = Array.from({ length: Math.min(n, 5) }, (_, i) => ({
    x: 38 + i * 26, c: i < K ? GOLD : BLUE,
  }));

  return (
    <Frame vb="0 0 320 150">
      <path d="M200 28 q-14 0 -14 18 l0 72 q0 14 14 14 l96 0 q14 0 14 -14 l0 -72 q0 -18 -14 -18 z"
        fill="rgba(255,255,255,0.03)" stroke={DIM} />
      {popBalls.map((b, i) =>
        <circle key={i} cx={b.x} cy={b.y} r="8" fill={`${b.c}55`} stroke={b.c} />)}
      <text x="248" y="144" fill={DIM} fontSize="9" fontFamily="monospace" textAnchor="middle">
        N={N} ({K} gold, {rest} blue)
      </text>
      {drawnBalls.map((b, i) =>
        <circle key={i} cx={b.x} cy="65" r="12" fill={`${b.c}77`} stroke={b.c} strokeWidth="2" />)}
      <text x="68" y="98" fill={DIM} fontSize="9" fontFamily="monospace" textAnchor="middle">
        drawn n={n} (no replace)
      </text>
      <text x="162" y="68" fill={DIM} fontSize="18" textAnchor="middle">→</text>
    </Frame>
  );
}

// ── 11. FM cash-flow timeline ──────────────────────────────────────────────
function Timeline({ L }: { L: Labels }) {
  const n = Math.round(g(L, "n", 5));
  const pmt = g(L, "pmt", 100);
  const rate = g(L, "rate", 0.05);
  const t0val = L?.t0val !== undefined ? Number(L.t0val) : undefined;

  const periods = Math.min(n, 8);
  const W = 360, axisY = 70;
  const xs = Array.from({ length: periods + 1 }, (_, i) =>
    Math.round(20 + (i * (W - 40)) / periods));

  return (
    <Frame vb={`0 0 ${W} 120`}>
      <line x1="16" y1={axisY} x2={W - 14} y2={axisY} stroke={STROKE} />
      <polygon points={`${W - 14},${axisY} ${W - 22},${axisY - 4} ${W - 22},${axisY + 4}`} fill={STROKE} />
      <text x={W / 2} y="12" fill={DIM} fontSize="10" fontFamily="monospace" textAnchor="middle">
        i = {(rate * 100).toFixed(2)}%
      </text>
      {xs.map((x, i) => {
        const isT0 = i === 0;
        return (
          <g key={i}>
            <line x1={x} y1={axisY - 5} x2={x} y2={axisY + 5} stroke={DIM} />
            <text x={x} y={axisY + 17} fill={DIM} fontSize="9" fontFamily="monospace" textAnchor="middle">{i}</text>
            {isT0 && t0val !== undefined && (
              <>
                <line x1={x} y1={axisY} x2={x} y2={axisY + 35} stroke={RED} strokeWidth="2" />
                <polygon points={`${x},${axisY + 35} ${x - 4},${axisY + 27} ${x + 4},${axisY + 27}`} fill={RED} />
                <text x={x} y={axisY + 50} fill={RED} fontSize="9" fontFamily="monospace" textAnchor="middle">
                  {Number(Math.abs(t0val).toFixed(2))}
                </text>
              </>
            )}
            {!isT0 && (
              <>
                <line x1={x} y1={axisY} x2={x} y2={axisY - 35} stroke={GOLD} strokeWidth="2" />
                <polygon points={`${x},${axisY - 35} ${x - 4},${axisY - 27} ${x + 4},${axisY - 27}`} fill={GOLD} />
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

// ══════════════════════════════════════════════════════════════════════════
// EXPLANATION BUILDERS — one per diagram type
// Each returns a list of ExplRow entries that walk the student through:
//   1. What every visual element represents (using the real question values)
//   2. The formula being applied
//   3. The arithmetic, step-by-step
//   4. The final result
// ══════════════════════════════════════════════════════════════════════════

function explVenn(L: Labels): ExplRow[] {
  const pA = g(L, "pA", 0.40);
  const pB = g(L, "pB", 0.30);
  const pAB = g(L, "pAB", 0.12);
  const lA = gs(L, "labelA", "A");
  const lB = gs(L, "labelB", "B");
  const pAonly = Math.max(0, pA - pAB);
  const pBonly = Math.max(0, pB - pAB);
  const pAgivB = pB > 0 ? pAB / pB : 0;
  return [
    { t: "head", text: "What you see" },
    { t: "bullet", text: `Blue circle = event ${lB}: all outcomes where ${lB} occurs.  P(${lB}) = ${fmt4(pB)}` },
    { t: "bullet", text: `Gold ring = event ${lA}: all outcomes where ${lA} occurs.  P(${lA}) = ${fmt4(pA)}` },
    { t: "bullet", text: `Gold shaded overlap = BOTH ${lA} AND ${lB} occur at the same time.  P(${lA}∩${lB}) = ${fmt4(pAB)}` },
    { t: "bullet", text: `${lB} only (${lA} did NOT happen): P(${lB}) − P(${lA}∩${lB}) = ${fmt4(pB)} − ${fmt4(pAB)} = ${fmt4(pBonly)}` },
    { t: "bullet", text: `${lA} only (${lB} did NOT happen): P(${lA}) − P(${lA}∩${lB}) = ${fmt4(pA)} − ${fmt4(pAB)} = ${fmt4(pAonly)}` },
    { t: "head", text: "The formula — conditional probability" },
    { t: "formula", text: `P(${lA}|${lB})  =  P(${lA}∩${lB})  /  P(${lB})` },
    { t: "bullet", text: `Read as: "Given ${lB} already happened, what fraction of those outcomes also include ${lA}?"` },
    { t: "bullet", text: `You are zooming into just the ${lB} circle, then asking how much of it overlaps with ${lA}.` },
    { t: "head", text: "The calculation" },
    { t: "step", text: `P(${lA}|${lB})  =  P(${lA}∩${lB})  /  P(${lB})` },
    { t: "step", text: `              =  ${fmt4(pAB)}  /  ${fmt4(pB)}` },
    { t: "result", text: `P(${lA}|${lB}) = ${fmt4(pAgivB)}` },
  ];
}

function explTree(L: Labels): ExplRow[] {
  const p1 = g(L, "p1", 0.70);
  const p2 = 1 - p1;
  const p11 = g(L, "p11", 0.80);
  const p12 = 1 - p11;
  const p21 = g(L, "p21", 0.40);
  const p22 = 1 - p21;
  const l1 = gs(L, "l1", "A");
  const l2 = gs(L, "l2", "A′");
  const l11 = gs(L, "l11", "B|A");
  const l12 = gs(L, "l12", "B′|A");
  const l21 = gs(L, "l21", "B|A′");
  const l22 = gs(L, "l22", "B′|A′");
  const j11 = p1 * p11;
  const j12 = p1 * p12;
  const j21 = p2 * p21;
  const j22 = p2 * p22;
  const sumAll = j11 + j12 + j21 + j22;
  const pB = j11 + j21;
  return [
    { t: "head", text: "How to read this tree" },
    { t: "bullet", text: "Start at the gold root dot (left). Each branch shows a probability. MULTIPLY all branch values along a path to get the JOINT probability at the leaf." },
    { t: "bullet", text: `${l1} and ${l2} are complementary first-stage events: ${fmt4(p1)} + ${fmt4(p2)} = 1.0` },
    { t: "head", text: `Upper branch → ${l1}  [P(${l1}) = ${fmt4(p1)}]` },
    { t: "step", text: `${l1} → ${l11}:  ${fmt4(p1)} × ${fmt4(p11)} = ${fmt4(j11)}` },
    { t: "step", text: `${l1} → ${l12}:  ${fmt4(p1)} × ${fmt4(p12)} = ${fmt4(j12)}` },
    { t: "head", text: `Lower branch → ${l2}  [P(${l2}) = ${fmt4(p2)}]` },
    { t: "step", text: `${l2} → ${l21}:  ${fmt4(p2)} × ${fmt4(p21)} = ${fmt4(j21)}` },
    { t: "step", text: `${l2} → ${l22}:  ${fmt4(p2)} × ${fmt4(p22)} = ${fmt4(j22)}` },
    { t: "head", text: "Sanity check — all 4 leaves must sum to 1" },
    { t: "step", text: `${fmt4(j11)} + ${fmt4(j12)} + ${fmt4(j21)} + ${fmt4(j22)} = ${fmt4(sumAll)} ✓` },
    { t: "head", text: "Total probability of B — law of total probability" },
    { t: "formula", text: `P(B) = P(${l1})·P(B|${l1})  +  P(${l2})·P(B|${l2})` },
    { t: "step", text: `     = ${fmt4(j11)} + ${fmt4(j21)}` },
    { t: "result", text: `P(B) = ${fmt4(pB)}` },
  ];
}

function explPartition(L: Labels): ExplRow[] {
  const l1 = gs(L, "l1", "B₁");
  const l2 = gs(L, "l2", "B₂");
  const l3 = gs(L, "l3", "B₃");
  return [
    { t: "head", text: "What you see" },
    { t: "bullet", text: `Three rectangles (${l1}, ${l2}, ${l3}) tile the entire sample space exactly — they are mutually exclusive (no overlap between them) and exhaustive (together they cover every possible outcome).` },
    { t: "bullet", text: `The gold horizontal band = event A. It cuts across all three rectangles, splitting A into three non-overlapping pieces: A∩${l1}, A∩${l2}, A∩${l3}.` },
    { t: "bullet", text: "Every outcome in A must sit inside exactly one of the partitions. So adding the three pieces gives all of A." },
    { t: "head", text: "The formula — Law of Total Probability" },
    { t: "formula", text: `P(A) = P(A|${l1})P(${l1}) + P(A|${l2})P(${l2}) + P(A|${l3})P(${l3})` },
    { t: "head", text: "Why this works" },
    { t: "bullet", text: `P(A|Bᵢ) × P(Bᵢ) = P(A∩Bᵢ)  — this is just the conditional probability definition rearranged.` },
    { t: "bullet", text: `Summing over all i: P(A) = Σ P(A∩Bᵢ) because the three pieces don't overlap and together make up all of A.` },
    { t: "bullet", text: `This is the go-to formula when A can happen via multiple "routes" and you know the probability for each route.` },
  ];
}

function explBell(L: Labels): ExplRow[] {
  const mu = g(L, "mu", 0);
  const sigma = g(L, "sigma", 1);
  const x1raw = L?.x1 !== undefined ? Number(L.x1) : undefined;
  const z = x1raw !== undefined ? (x1raw - mu) / sigma : undefined;
  const rows: ExplRow[] = [
    { t: "head", text: "What you see" },
    { t: "bullet", text: `Bell curve = Normal distribution  N(μ = ${fmt2(mu)},  σ = ${fmt2(sigma)})` },
    { t: "bullet", text: `Blue vertical line at μ = ${fmt2(mu)} — the mean. Exactly 50% of outcomes fall on each side.` },
    { t: "bullet", text: `Dashed lines at ±1σ (${fmt2(mu - sigma)}, ${fmt2(mu + sigma)}), ±2σ (${fmt2(mu - 2 * sigma)}, ${fmt2(mu + 2 * sigma)}), ±3σ (${fmt2(mu - 3 * sigma)}, ${fmt2(mu + 3 * sigma)})` },
    { t: "bullet", text: `68-95-99.7 rule: 68% of outcomes fall within ±1σ, 95% within ±2σ, 99.7% within ±3σ` },
  ];
  if (x1raw !== undefined && z !== undefined) {
    rows.push(
      { t: "bullet", text: `Red vertical line at x = ${fmt2(x1raw)} — the specific value in this question` },
      { t: "bullet", text: `Red shaded region to the RIGHT = P(X > ${fmt2(x1raw)}) — the tail probability you are computing` },
      { t: "head", text: "The Z-score formula" },
      { t: "formula", text: `Z = (x − μ) / σ` },
      { t: "bullet", text: `A Z-score tells you how many standard deviations x is from the mean. Then you look up P(Z > z) in the standard normal table.` },
      { t: "head", text: "The calculation" },
      { t: "step", text: `Z = (${fmt2(x1raw)} − ${fmt2(mu)}) / ${fmt2(sigma)}` },
      { t: "step", text: `  = ${fmt2(x1raw - mu)} / ${fmt2(sigma)}` },
      { t: "result", text: `Z = ${z.toFixed(4)}   →   look up P(Z > ${z.toFixed(2)}) in the Z-table` },
    );
  } else {
    rows.push(
      { t: "head", text: "The Z-score formula" },
      { t: "formula", text: `Z = (x − μ) / σ` },
      { t: "bullet", text: "Standardise any x to a Z-score, then use the standard normal table to find the probability." },
      { t: "bullet", text: "P(X > x) = P(Z > z) = 1 − Φ(z)  where Φ is the standard normal CDF." },
    );
  }
  return rows;
}

function explPmf(L: Labels): ExplRow[] {
  const psRaw = gs(L, "ps", "0.10,0.25,0.30,0.20,0.10,0.05");
  const probs = psRaw.split(",").map(Number).filter(v => !isNaN(v));
  const xsRaw = gs(L, "xs", "");
  const xLabels = xsRaw ? xsRaw.split(",") : probs.map((_, i) => String(i));
  const highlight = L?.highlight !== undefined ? Number(L.highlight) : -1;
  const sum = probs.reduce((a, b) => a + b, 0);
  const ev = probs.reduce((acc, p, i) => acc + p * (Number(xLabels[i]) || i), 0);
  const rows: ExplRow[] = [
    { t: "head", text: "What you see" },
    { t: "bullet", text: "Each bar's HEIGHT = P(X = x) for that outcome x." },
    { t: "bullet", text: `All bars sum to ${fmt4(sum)} ✓  (must equal 1 for a valid PMF)` },
    { t: "bullet", text: `Expected value: E[X] = Σ x·P(X=x) ≈ ${fmt2(ev)}` },
  ];
  if (highlight >= 0 && highlight < probs.length) {
    rows.push(
      { t: "bullet", text: `Green bar = the outcome being asked about: x = ${xLabels[highlight] ?? highlight}` },
      { t: "head", text: "Reading the answer" },
      { t: "step", text: `P(X = ${xLabels[highlight] ?? highlight}) = height of green bar` },
      { t: "result", text: `P(X = ${xLabels[highlight] ?? highlight}) = ${fmt4(probs[highlight])}` },
    );
  } else {
    rows.push(
      { t: "head", text: "How to use this chart" },
      { t: "bullet", text: "P(X = k): read the height of the bar at x = k." },
      { t: "bullet", text: "P(X ≤ k): add all bar heights from x = 0 up through x = k  (running total from left)." },
      { t: "bullet", text: "P(a ≤ X ≤ b): add bar heights from x = a to x = b inclusive." },
    );
  }
  return rows;
}

function explPoisson(L: Labels): ExplRow[] {
  const lambda = g(L, "lambda", 3);
  const t = g(L, "t", 1);
  const mu = lambda * t;
  const eNegMu = Math.exp(-mu);
  return [
    { t: "head", text: "What you see" },
    { t: "bullet", text: `Gold dots on the timeline = events arriving at rate λ = ${fmt4(lambda)} per unit time` },
    { t: "bullet", text: `The timeline spans [0, ${fmt2(t)}] — the time window in this question` },
    { t: "bullet", text: "Dots are spaced to show the AVERAGE rate. Real Poisson events arrive randomly — they don't space out evenly in practice." },
    { t: "head", text: "Key Poisson facts" },
    { t: "formula", text: `Mean: E[N] = λt = ${fmt4(lambda)} × ${fmt2(t)} = ${fmt4(mu)}` },
    { t: "bullet", text: `Variance: Var[N] = λt = ${fmt4(mu)}  — mean equals variance, always, for any Poisson.` },
    { t: "bullet", text: `e^(−λt) = e^(−${fmt4(mu)}) = ${eNegMu.toFixed(6)}  — this constant appears in every Poisson calculation.` },
    { t: "head", text: "The formula — P(N = k)" },
    { t: "formula", text: `P(N = k) = e^(−λt) × (λt)^k / k!` },
    { t: "step", text: `       where λt = ${fmt4(mu)}  and  e^(−λt) = ${eNegMu.toFixed(6)}` },
    { t: "bullet", text: "Substitute your k value and compute: multiply e^(−λt) × (λt)^k, then divide by k! (factorial of k)." },
  ];
}

function explExp(L: Labels): ExplRow[] {
  const lambda = g(L, "lambda", 0.5);
  const x0raw = L?.x0 !== undefined ? Number(L.x0) : undefined;
  const mean = 1 / lambda;
  const rows: ExplRow[] = [
    { t: "head", text: "What you see" },
    { t: "bullet", text: `The curve = f(x) = λe^(−λx) = ${fmt4(lambda)}·e^(−${fmt4(lambda)}x) — the probability density of the waiting time X` },
    { t: "bullet", text: "Curve starts HIGH near x = 0 (events tend to happen quickly) and decays toward zero (long waits become less likely)." },
    { t: "bullet", text: `Mean waiting time: E[X] = 1/λ = 1/${fmt4(lambda)} = ${fmt4(mean)}` },
  ];
  if (x0raw !== undefined) {
    const pGt = Math.exp(-lambda * x0raw);
    const pLt = 1 - pGt;
    const exponent = lambda * x0raw;
    rows.push(
      { t: "bullet", text: `Green shaded region = P(X > ${fmt2(x0raw)}) — probability of waiting MORE than ${fmt2(x0raw)} units` },
      { t: "head", text: "The memoryless property" },
      { t: "bullet", text: "The exponential distribution has NO memory: knowing you've already waited a time a does not change the remaining wait. P(X > a+b | X > a) = P(X > b)." },
      { t: "head", text: "The formula" },
      { t: "formula", text: `P(X > x₀) = e^(−λx₀)` },
      { t: "head", text: "The calculation" },
      { t: "step", text: `P(X > ${fmt2(x0raw)}) = e^(−${fmt4(lambda)} × ${fmt2(x0raw)})` },
      { t: "step", text: `                = e^(−${fmt4(exponent)})` },
      { t: "result", text: `P(X > ${fmt2(x0raw)}) = ${pGt.toFixed(4)}` },
      { t: "bullet", text: `Complement: P(X ≤ ${fmt2(x0raw)}) = 1 − ${pGt.toFixed(4)} = ${pLt.toFixed(4)}` },
    );
  } else {
    rows.push(
      { t: "head", text: "Key formulas" },
      { t: "formula", text: `P(X > x₀)  =  e^(−λx₀)` },
      { t: "formula", text: `P(X ≤ x₀)  =  1 − e^(−λx₀)` },
      { t: "bullet", text: "The entire area under the curve = 1 (total probability)." },
      { t: "bullet", text: "If X ~ Exp(λ), then waiting time between Poisson events also follows Exp(λ)." },
    );
  }
  return rows;
}

function explUniform(L: Labels): ExplRow[] {
  const a = g(L, "a", 0);
  const b = g(L, "b", 10);
  const x1 = L?.x1 !== undefined ? Number(L.x1) : undefined;
  const x2 = L?.x2 !== undefined ? Number(L.x2) : undefined;
  const density = 1 / (b - a);
  const evX = (a + b) / 2;
  const varX = (b - a) * (b - a) / 12;
  const rows: ExplRow[] = [
    { t: "head", text: "What you see" },
    { t: "bullet", text: `Gold rectangle = Uniform distribution on [${fmt2(a)}, ${fmt2(b)}]` },
    { t: "bullet", text: `f(x) = 1/(b−a) = 1/${fmt2(b - a)} = ${fmt4(density)} everywhere inside — EVERY value between ${fmt2(a)} and ${fmt2(b)} is equally likely.` },
    { t: "bullet", text: `Outside [${fmt2(a)}, ${fmt2(b)}]: f(x) = 0 — those outcomes are impossible.` },
    { t: "head", text: "Key facts" },
    { t: "bullet", text: `Mean: E[X] = (a+b)/2 = (${fmt2(a)}+${fmt2(b)})/2 = ${fmt2(evX)}` },
    { t: "bullet", text: `Variance: Var[X] = (b−a)²/12 = ${fmt2(b - a)}²/12 = ${fmt4(varX)}` },
  ];
  if (x1 !== undefined && x2 !== undefined) {
    const prob = (x2 - x1) / (b - a);
    rows.push(
      { t: "bullet", text: `Green shaded region = the interval [${fmt2(x1)}, ${fmt2(x2)}] — the sub-range being asked about` },
      { t: "head", text: "The formula — probability of an interval" },
      { t: "formula", text: `P(x₁ < X < x₂)  =  (x₂ − x₁) / (b − a)` },
      { t: "bullet", text: "Probability = length of your interval / total length. It is just a ratio of widths — area of the green rectangle divided by area of the gold rectangle." },
      { t: "head", text: "The calculation" },
      { t: "step", text: `= (${fmt2(x2)} − ${fmt2(x1)}) / (${fmt2(b)} − ${fmt2(a)})` },
      { t: "step", text: `= ${fmt2(x2 - x1)} / ${fmt2(b - a)}` },
      { t: "result", text: `P(${fmt2(x1)} < X < ${fmt2(x2)}) = ${fmt4(prob)}` },
    );
  } else {
    rows.push(
      { t: "head", text: "The formula" },
      { t: "formula", text: `P(x₁ < X < x₂)  =  (x₂ − x₁) / (b − a)` },
      { t: "bullet", text: "Substitute your interval endpoints to find the probability." },
    );
  }
  return rows;
}

function explClt(L: Labels): ExplRow[] {
  const mu = g(L, "mu", 0);
  const sigma = g(L, "sigma", 1);
  return [
    { t: "head", text: "What you see" },
    { t: "bullet", text: "Three overlapping bell curves — each represents the SAMPLING DISTRIBUTION of X̄ (sample mean) at a different sample size n." },
    { t: "bullet", text: "Blue (flattest, widest): small n — X̄ is very spread out, individual samples give noisy estimates of μ." },
    { t: "bullet", text: "Gold (middle): moderate n — distribution tightens toward the true mean." },
    { t: "bullet", text: "Green (tallest, narrowest): large n — X̄ concentrates tightly around μ. Estimates become reliable." },
    { t: "head", text: "The Central Limit Theorem" },
    { t: "formula", text: `X̄ ~ N(μ, σ²/n)  as n → ∞` },
    { t: "bullet", text: `This holds for ANY original distribution shape (uniform, exponential, skewed…) as long as n is large enough (rule of thumb: n ≥ 30).` },
    { t: "head", text: "The standard error formula" },
    { t: "formula", text: `SE(X̄) = σ / √n` },
    { t: "bullet", text: `With μ = ${fmt2(mu)} and σ = ${fmt2(sigma)}: as n doubles, SE = ${fmt2(sigma)}/√n shrinks by factor 1/√2 ≈ 0.707.` },
    { t: "bullet", text: "To halve the error, you need 4× as much data. This is the curse of √n." },
    { t: "head", text: "Practical use" },
    { t: "bullet", text: "To compute P(X̄ > k):  find Z = (k − μ) / (σ/√n), then look up P(Z > z) in the standard normal table." },
  ];
}

function explUrn(L: Labels): ExplRow[] {
  const N = Math.round(g(L, "N", 10));
  const K = Math.round(g(L, "K", 4));
  const n = Math.round(g(L, "n", 3));
  const rest = N - K;

  const comb = (nn: number, kk: number): number => {
    if (kk < 0 || kk > nn) return 0;
    if (kk === 0 || kk === nn) return 1;
    let r = 1;
    for (let i = 0; i < Math.min(kk, nn - kk); i++) r = r * (nn - i) / (i + 1);
    return Math.round(r);
  };

  const denom = comb(N, n);
  const evX = n * K / N;

  return [
    { t: "head", text: "What you see" },
    { t: "bullet", text: `Urn (right side) = the full population: N = ${N} balls — ${K} gold (successes) and ${rest} blue (non-successes)` },
    { t: "bullet", text: `n = ${n} balls are drawn WITHOUT replacement — removing each ball changes what remains` },
    { t: "bullet", text: `Drawn balls (left side) show a sample. X = number of gold balls drawn = the random variable.` },
    { t: "head", text: "The formula — Hypergeometric distribution" },
    { t: "formula", text: `P(X = k) = C(${K}, k) × C(${rest}, ${n}−k) / C(${N}, ${n})` },
    { t: "head", text: "What each piece means" },
    { t: "bullet", text: `C(${K}, k) = ways to choose exactly k gold balls from the ${K} gold in the urn` },
    { t: "bullet", text: `C(${rest}, ${n}−k) = ways to fill the remaining ${n}−k draws from the ${rest} blue balls` },
    { t: "bullet", text: `C(${N}, ${n}) = C(${N}, ${n}) = ${denom} — total ways to draw any ${n} balls from ${N} (the denominator / sample space)` },
    { t: "head", text: "Key facts" },
    { t: "bullet", text: `E[X] = n × K/N = ${n} × ${K}/${N} = ${fmt4(evX)}` },
    { t: "bullet", text: `If drawn WITH replacement instead: X ~ Binomial(n, K/N). Without replacement → Hypergeometric.` },
  ];
}

function explTimeline(L: Labels): ExplRow[] {
  const n = Math.round(g(L, "n", 5));
  const pmt = g(L, "pmt", 100);
  const rate = g(L, "rate", 0.05);
  const t0val = L?.t0val !== undefined ? Number(L.t0val) : undefined;

  const vFactor = rate > 0 ? (1 - Math.pow(1 + rate, -n)) / rate : n;
  const pv = pmt * vFactor;
  const accFactor = rate > 0 ? (Math.pow(1 + rate, n) - 1) / rate : n;
  const fv = pmt * accFactor;
  const discountN = Math.pow(1 + rate, -n);

  const rows: ExplRow[] = [
    { t: "head", text: "What you see" },
    { t: "bullet", text: `Horizontal axis = time periods: 0, 1, 2, …, ${n}` },
  ];
  if (t0val !== undefined) {
    rows.push({ t: "bullet", text: `Red arrow at t = 0 (pointing DOWN): initial outflow = ${fmt2(Math.abs(t0val))} — money paid out now` });
  }
  rows.push(
    { t: "bullet", text: `Gold arrows at t = 1 through t = ${n} (pointing UP): you RECEIVE ${fmt2(pmt)} per period` },
    { t: "bullet", text: `Interest rate i = ${(rate * 100).toFixed(2)}% — money grows by this factor each period` },
    { t: "head", text: "The present value formula — ordinary annuity" },
    { t: "formula", text: `PV = PMT × [1 − (1+i)^(−n)] / i` },
    { t: "bullet", text: "PV = what the entire stream of future payments is worth RIGHT NOW (at t = 0)." },
    { t: "head", text: "The calculation" },
    { t: "step", text: `(1+i)^(−n) = (1+${fmt4(rate)})^(−${n}) = ${discountN.toFixed(6)}` },
    { t: "step", text: `Annuity factor = [1 − ${discountN.toFixed(6)}] / ${fmt4(rate)} = ${fmt4(vFactor)}` },
    { t: "step", text: `PV = ${fmt2(pmt)} × ${fmt4(vFactor)}` },
    { t: "result", text: `PV of annuity = ${fmt4(pv)}` },
    { t: "head", text: "Future value formula" },
    { t: "formula", text: `FV = PMT × [(1+i)^n − 1] / i` },
    { t: "step", text: `   = ${fmt2(pmt)} × ${fmt4(accFactor)}` },
    { t: "result", text: `FV of annuity = ${fmt4(fv)}` },
  );
  return rows;
}

// ── Explanation registry ────────────────────────────────────────────────────
const EXPLAIN: Record<DiagramKind, (L: Labels) => ExplRow[]> = {
  "venn-conditional": explVenn,
  "tree": explTree,
  "partition": explPartition,
  "bell": explBell,
  "pmf-bars": explPmf,
  "poisson-timeline": explPoisson,
  "exponential": explExp,
  "uniform": explUniform,
  "clt": explClt,
  "urn": explUrn,
  "timeline": explTimeline,
};

// ── SVG registry & export ───────────────────────────────────────────────────
type DiagramProps = { L: Labels };
const REGISTRY: Record<DiagramKind, React.FC<DiagramProps>> = {
  "venn-conditional": VennConditional,
  "tree": Tree,
  "partition": Partition,
  "bell": Bell,
  "pmf-bars": PmfBars,
  "poisson-timeline": PoissonTimeline,
  "exponential": Exponential,
  "uniform": Uniform,
  "clt": Clt,
  "urn": Urn,
  "timeline": Timeline,
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
  const rows = EXPLAIN[kind]?.(labels) ?? [];
  return (
    <div style={{ padding: "0.25rem 0" }}>
      <Cmp L={labels} />
      {rows.length > 0 && <ExplanationPanel rows={rows} />}
    </div>
  );
}
