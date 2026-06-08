"use client";

/**
 * ExamDiagrams — clean, self-contained SVG diagrams for actuarial probability
 * concepts. No image uploads, no chart library: every figure is hand-drawn SVG
 * with a viewBox so it scales crisply on any screen. Colours use Forge tokens
 * (--accent gold, --blue) so they sit in the dark theme.
 *
 * Render one via the <Diagram kind=… /> dispatcher (keys match DiagramKind).
 */

import type { DiagramKind } from "@/lib/examPaths";

const GOLD = "#D4AF37";
const BLUE = "#60a5fa";
const GREEN = "#22c55e";
const DIM = "rgba(255,255,255,0.45)";
const STROKE = "rgba(255,255,255,0.65)";

function Frame({ vb, children }: { vb: string; children: React.ReactNode }) {
  return (
    <svg viewBox={vb} role="img" style={{ width: "100%", height: "auto", maxWidth: 460, display: "block", margin: "0 auto" }}>
      {children}
    </svg>
  );
}

/** Conditional probability: P(A|B) = shaded overlap ÷ B. */
function VennConditional() {
  return (
    <Frame vb="0 0 300 180">
      <rect x="4" y="4" width="292" height="172" rx="8" fill="none" stroke={DIM} strokeDasharray="4 4" />
      <text x="14" y="22" fill={DIM} fontSize="11" fontFamily="monospace">S</text>
      {/* B then A∩B shaded on top */}
      <circle cx="120" cy="92" r="68" fill={`${BLUE}22`} stroke={BLUE} strokeWidth="1.5" />
      <circle cx="190" cy="92" r="62" fill="none" stroke={GOLD} strokeWidth="1.5" />
      {/* overlap via clip */}
      <defs>
        <clipPath id="ovl"><circle cx="190" cy="92" r="62" /></clipPath>
      </defs>
      <circle cx="120" cy="92" r="68" fill={`${GOLD}55`} clipPath="url(#ovl)" />
      <text x="78" y="96" fill={BLUE} fontSize="16" fontWeight="700">B</text>
      <text x="226" y="96" fill={GOLD} fontSize="16" fontWeight="700">A</text>
      <text x="150" y="150" fill={GOLD} fontSize="11" fontFamily="monospace" textAnchor="middle">A∩B</text>
    </Frame>
  );
}

/** 2-level probability tree. */
function Tree() {
  return (
    <Frame vb="0 0 320 200">
      <circle cx="30" cy="100" r="5" fill={GOLD} />
      {/* level 1 */}
      <line x1="35" y1="100" x2="140" y2="50" stroke={STROKE} />
      <line x1="35" y1="100" x2="140" y2="150" stroke={STROKE} />
      <text x="78" y="64" fill={DIM} fontSize="11" fontFamily="monospace">P(A)</text>
      <text x="78" y="142" fill={DIM} fontSize="11" fontFamily="monospace">P(A′)</text>
      <circle cx="145" cy="50" r="5" fill={BLUE} />
      <circle cx="145" cy="150" r="5" fill={BLUE} />
      {/* level 2 */}
      {[[50, 25], [50, 80], [150, 125], [150, 180]].map(([y0, y1], i) => (
        <line key={i} x1="150" y1={y0} x2="250" y2={y1} stroke={STROKE} />
      ))}
      {[25, 80, 125, 180].map((y, i) => (
        <circle key={i} cx="255" cy={y} r="5" fill={GREEN} />
      ))}
      {["B|A", "B′|A", "B|A′", "B′|A′"].map((t, i) => (
        <text key={i} x="268" y={[29, 84, 129, 184][i]} fill={DIM} fontSize="10" fontFamily="monospace">{t}</text>
      ))}
    </Frame>
  );
}

/** Law of total probability: sample space partitioned into boxes, event A across. */
function Partition() {
  const parts = [["B₁", BLUE], ["B₂", GOLD], ["B₃", GREEN]] as const;
  return (
    <Frame vb="0 0 300 160">
      {parts.map(([label, c], i) => (
        <g key={i}>
          <rect x={10 + i * 95} y="20" width="90" height="120" fill={`${c}1f`} stroke={c} strokeWidth="1.5" />
          <text x={55 + i * 95} y="38" fill={c} fontSize="13" fontWeight="700" textAnchor="middle">{label}</text>
        </g>
      ))}
      {/* event A — a horizontal band crossing all partitions */}
      <rect x="10" y="84" width="285" height="34" fill={`${GOLD}44`} stroke={GOLD} strokeDasharray="4 3" />
      <text x="152" y="106" fill={GOLD} fontSize="12" fontWeight="700" textAnchor="middle">A = Σ A∩Bᵢ</text>
    </Frame>
  );
}

/** Normal curve with ±1σ/±2σ/±3σ shaded tails. */
function Bell() {
  const W = 320, H = 170, x0 = 10, x1 = 310, mid = (x0 + x1) / 2, base = 150;
  const sigma = (x1 - x0) / 8; // 4σ each side
  const peak = 120;
  const y = (x: number) => base - peak * Math.exp(-0.5 * ((x - mid) / sigma) ** 2);
  const pts: string[] = [];
  for (let x = x0; x <= x1; x += 3) pts.push(`${x},${y(x).toFixed(1)}`);
  const tick = (k: number) => mid + k * sigma;
  return (
    <Frame vb={`0 0 ${W} ${H}`}>
      {/* axis */}
      <line x1={x0} y1={base} x2={x1} y2={base} stroke={DIM} />
      {/* sigma bands */}
      {[1, 2, 3].map((k) => (
        <g key={k}>
          <line x1={tick(k)} y1={base} x2={tick(k)} y2={y(tick(k))} stroke={DIM} strokeDasharray="3 3" />
          <line x1={tick(-k)} y1={base} x2={tick(-k)} y2={y(tick(-k))} stroke={DIM} strokeDasharray="3 3" />
          <text x={tick(k)} y={base + 13} fill={DIM} fontSize="9" fontFamily="monospace" textAnchor="middle">{`+${k}σ`}</text>
          <text x={tick(-k)} y={base + 13} fill={DIM} fontSize="9" fontFamily="monospace" textAnchor="middle">{`-${k}σ`}</text>
        </g>
      ))}
      <polyline points={pts.join(" ")} fill="none" stroke={GOLD} strokeWidth="2" />
      <polygon points={`${x0},${base} ${pts.join(" ")} ${x1},${base}`} fill={`${GOLD}14`} />
      <line x1={mid} y1={base} x2={mid} y2={y(mid)} stroke={BLUE} strokeWidth="1.5" />
      <text x={mid} y={base + 13} fill={BLUE} fontSize="9" fontFamily="monospace" textAnchor="middle">μ</text>
      <text x={mid + 4} y={y(mid) - 4} fill={DIM} fontSize="9" fontFamily="monospace">68% · 95% · 99.7%</text>
    </Frame>
  );
}

/** Discrete PMF as bars. */
function PmfBars() {
  const probs = [0.1, 0.25, 0.3, 0.2, 0.1, 0.05];
  const W = 300, base = 140, bw = 38, gap = 8, x0 = 20, scale = 360;
  return (
    <Frame vb={`0 0 ${W} 160`}>
      <line x1={x0 - 4} y1={base} x2={W - 6} y2={base} stroke={DIM} />
      {probs.map((p, i) => {
        const h = p * scale;
        const x = x0 + i * (bw + gap);
        return (
          <g key={i}>
            <rect x={x} y={base - h} width={bw} height={h} fill={`${GOLD}55`} stroke={GOLD} />
            <text x={x + bw / 2} y={base + 13} fill={DIM} fontSize="10" fontFamily="monospace" textAnchor="middle">{i}</text>
          </g>
        );
      })}
      <text x={x0} y="16" fill={DIM} fontSize="10" fontFamily="monospace">P(X = x)</text>
    </Frame>
  );
}

/** Poisson process: events as dots on a timeline. */
function PoissonTimeline() {
  const dots = [40, 70, 120, 135, 200, 250, 262, 300];
  return (
    <Frame vb="0 0 340 90">
      <line x1="14" y1="50" x2="326" y2="50" stroke={STROKE} markerEnd="" />
      <polygon points="326,50 318,46 318,54" fill={STROKE} />
      {dots.map((x, i) => (
        <g key={i}>
          <line x1={x} y1="44" x2={x} y2="56" stroke={GOLD} strokeWidth="2" />
          <circle cx={x} cy="50" r="4" fill={GOLD} />
        </g>
      ))}
      <text x="14" y="74" fill={DIM} fontSize="10" fontFamily="monospace">t = 0</text>
      <text x="300" y="74" fill={DIM} fontSize="10" fontFamily="monospace">time →</text>
      <text x="14" y="26" fill={DIM} fontSize="10" fontFamily="monospace">events ~ rate λ</text>
    </Frame>
  );
}

/** Exponential decay curve (memoryless). */
function Exponential() {
  const W = 300, H = 160, x0 = 16, x1 = 290, base = 138, peak = 110, lam = 0.018;
  const y = (x: number) => base - peak * Math.exp(-lam * (x - x0));
  const pts: string[] = [];
  for (let x = x0; x <= x1; x += 3) pts.push(`${x},${y(x).toFixed(1)}`);
  return (
    <Frame vb={`0 0 ${W} ${H}`}>
      <line x1={x0} y1={base} x2={x1} y2={base} stroke={DIM} />
      <line x1={x0} y1="20" x2={x0} y2={base} stroke={DIM} />
      <polygon points={`${x0},${base} ${pts.join(" ")} ${x1},${base}`} fill={`${BLUE}14`} />
      <polyline points={pts.join(" ")} fill="none" stroke={BLUE} strokeWidth="2" />
      <text x={x0 + 6} y="30" fill={DIM} fontSize="10" fontFamily="monospace">f(x) = λe^(−λx)</text>
      <text x={x1 - 10} y={base + 14} fill={DIM} fontSize="10" fontFamily="monospace" textAnchor="end">x →</text>
    </Frame>
  );
}

const REGISTRY: Record<DiagramKind, () => React.ReactElement> = {
  "venn-conditional": VennConditional,
  "tree": Tree,
  "partition": Partition,
  "bell": Bell,
  "pmf-bars": PmfBars,
  "poisson-timeline": PoissonTimeline,
  "exponential": Exponential,
};

export default function Diagram({ kind }: { kind: DiagramKind }) {
  const Cmp = REGISTRY[kind];
  if (!Cmp) return null;
  return (
    <div style={{ padding: "0.5rem 0" }}>
      <Cmp />
    </div>
  );
}
