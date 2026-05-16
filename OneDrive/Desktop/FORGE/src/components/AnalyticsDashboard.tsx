"use client";

import { useMemo } from "react";
import {
  BarChart3,
  Target,
  TrendingUp,
  Clock,
  Shield,
  CheckCircle2,
  Brain,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CheckinData {
  id: string;
  status: string;
  createdAt: string;
  interrogation: {
    overallScore: number;
    passed: boolean;
  } | null;
}

interface IntegrityLogData {
  id: string;
  event: string;
  description: string;
  delta: number;
  scoreAfter: number;
  createdAt: string;
}

interface Props {
  checkins: CheckinData[];
  integrityScore: number;
  integrityLogs: IntegrityLogData[];
  verifiedTasks: number;
  totalTasks: number;
  totalStudyHours: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function scoreColor(score: number): string {
  if (score >= 7) return "var(--green)";
  if (score >= 5) return "var(--yellow)";
  return "var(--red)";
}

function statusColor(status: string): string {
  switch (status) {
    case "passed":   return "var(--green)";
    case "failed":   return "var(--red)";
    case "grace":    return "var(--yellow)";
    case "respite":  return "var(--blue)";
    default:         return "#1a1d2a";
  }
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ------------------------------------------------------------------ */
/*  SVG Line Chart                                                     */
/* ------------------------------------------------------------------ */

function ScoreTrendChart({
  points,
}: {
  points: { date: string; score: number }[];
}) {
  if (points.length === 0) {
    return (
      <div
        style={{
          height: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-dim)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.8125rem",
        }}
      >
        No interrogation data yet
      </div>
    );
  }

  const W = 600;
  const H = 220;
  const PX = 48;
  const PY = 24;
  const chartW = W - PX * 2;
  const chartH = H - PY * 2;

  const maxPts = points.length;
  const xStep = maxPts > 1 ? chartW / (maxPts - 1) : 0;

  const coords = points.map((p, i) => ({
    x: PX + i * xStep,
    y: PY + chartH - (p.score / 10) * chartH,
    score: p.score,
    date: p.date,
  }));

  const segments: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];
  for (let i = 0; i < coords.length - 1; i++) {
    const avgScore = (coords[i].score + coords[i + 1].score) / 2;
    segments.push({
      x1: coords[i].x,
      y1: coords[i].y,
      x2: coords[i + 1].x,
      y2: coords[i + 1].y,
      color: scoreColor(avgScore),
    });
  }

  const yLabels = [0, 2, 4, 6, 8, 10];
  const labelStep = Math.max(1, Math.floor(maxPts / 8));
  const xLabels = coords.filter((_, i) => i % labelStep === 0 || i === maxPts - 1);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: "auto" }}
      preserveAspectRatio="xMidYMid meet"
    >
      {yLabels.map((v) => {
        const y = PY + chartH - (v / 10) * chartH;
        return (
          <g key={v}>
            <line x1={PX} y1={y} x2={W - PX} y2={y} stroke="var(--border)" strokeWidth={0.5} />
            <text x={PX - 8} y={y + 3} textAnchor="end" fill="var(--text-dim)" fontFamily="var(--font-mono)" fontSize={9}>{v}</text>
          </g>
        );
      })}

      {/* Pass zone highlight */}
      <rect x={PX} y={PY} width={chartW} height={(3 / 10) * chartH} fill="rgba(34,197,94,0.04)" />
      <rect x={PX} y={PY + (3 / 10) * chartH} width={chartW} height={(2 / 10) * chartH} fill="rgba(234,179,8,0.04)" />
      <rect x={PX} y={PY + (5 / 10) * chartH} width={chartW} height={(5 / 10) * chartH} fill="rgba(239,68,68,0.03)" />

      {segments.map((s, i) => (
        <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={s.color} strokeWidth={2} strokeLinecap="round" />
      ))}
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={3} fill={scoreColor(c.score)} stroke="var(--bg-panel)" strokeWidth={1.5} />
      ))}
      {xLabels.map((c, i) => (
        <text key={i} x={c.x} y={H - 4} textAnchor="middle" fill="var(--text-dim)" fontFamily="var(--font-mono)" fontSize={8}>{c.date}</text>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Year Heatmap                                                       */
/* ------------------------------------------------------------------ */

function YearHeatmap({
  checkinMap,
}: {
  checkinMap: Map<string, string>;
}) {
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  oneYearAgo.setDate(oneYearAgo.getDate() + 1);

  const startDate = new Date(oneYearAgo);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const weeks: { date: Date; key: string; status: string | null }[][] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= today) {
    const week: { date: Date; key: string; status: string | null }[] = [];
    for (let d = 0; d < 7; d++) {
      const key = currentDate.toISOString().slice(0, 10);
      const inRange = currentDate >= oneYearAgo && currentDate <= today;
      week.push({ date: new Date(currentDate), key, status: inRange ? (checkinMap.get(key) ?? null) : null });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push(week);
  }

  const cellSize = 11;
  const gap = 2;
  const totalW = weeks.length * (cellSize + gap);
  const totalH = 7 * (cellSize + gap);
  const labelW = 22;
  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  const monthLabels: { label: string; x: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const firstDay = week.find((d) => d.date >= oneYearAgo && d.date <= today);
    if (firstDay) {
      const m = firstDay.date.getMonth();
      if (m !== lastMonth) {
        lastMonth = m;
        monthLabels.push({ label: firstDay.date.toLocaleString("en-US", { month: "short" }), x: labelW + wi * (cellSize + gap) });
      }
    }
  });

  return (
    <div style={{ overflowX: "auto", paddingBottom: 4 }}>
      <svg viewBox={`0 0 ${labelW + totalW + 8} ${totalH + 28}`} style={{ width: "100%", minWidth: 680, height: "auto" }} preserveAspectRatio="xMinYMid meet">
        {monthLabels.map((m, i) => (
          <text key={i} x={m.x} y={10} fill="var(--text-dim)" fontFamily="var(--font-mono)" fontSize={8}>{m.label}</text>
        ))}
        {dayLabels.map((label, di) => (
          <text key={di} x={0} y={20 + di * (cellSize + gap) + cellSize - 2} fill="var(--text-dim)" fontFamily="var(--font-mono)" fontSize={7}>
            {di % 2 === 1 ? label : ""}
          </text>
        ))}
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            const inRange = day.date >= oneYearAgo && day.date <= today;
            return (
              <rect
                key={`${wi}-${di}`}
                x={labelW + wi * (cellSize + gap)}
                y={18 + di * (cellSize + gap)}
                width={cellSize}
                height={cellSize}
                rx={2}
                fill={inRange ? (day.status ? statusColor(day.status) : "#1a1d2a") : "transparent"}
                opacity={inRange ? (day.status ? 0.9 : 0.3) : 0}
              >
                <title>{day.key}: {day.status ?? "no check-in"}</title>
              </rect>
            );
          })
        )}
      </svg>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "0.5rem", flexWrap: "wrap" }}>
        {[
          { label: "Passed",  color: "var(--green)" },
          { label: "Failed",  color: "var(--red)" },
          { label: "Grace",   color: "var(--yellow)" },
          { label: "Respite", color: "var(--blue)" },
          { label: "None",    color: "#1a1d2a" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color, opacity: item.label === "None" ? 0.3 : 0.9 }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({ icon, label, value, unit, color }: { icon: React.ReactNode; label: string; value: string | number; unit?: string; color: string }) {
  return (
    <div className="forge-card" style={{ padding: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <div style={{ color }}>{icon}</div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.15em", textTransform: "uppercase" }}>{label}</span>
      </div>
      <div style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", lineHeight: 1, color }}>
        {value}
        {unit && <span style={{ fontSize: "0.8125rem", color: "var(--text-dim)", marginLeft: "0.25rem", fontFamily: "var(--font-mono)" }}>{unit}</span>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function AnalyticsDashboard({
  checkins,
  integrityScore,
  integrityLogs,
  verifiedTasks,
  totalTasks,
  totalStudyHours,
}: Props) {
  const scoreTrendPoints = useMemo(
    () =>
      checkins
        .filter((c) => c.interrogation)
        .map((c) => ({
          date: formatShortDate(c.createdAt),
          score: c.interrogation!.overallScore,
        })),
    [checkins]
  );

  const checkinMap = useMemo(() => {
    const map = new Map<string, string>();
    checkins.forEach((c) => {
      const dateKey = c.createdAt.slice(0, 10);
      const existing = map.get(dateKey);
      const priority: Record<string, number> = { passed: 4, grace: 3, respite: 2, failed: 1 };
      if (!existing || (priority[c.status] ?? 0) > (priority[existing] ?? 0)) {
        map.set(dateKey, c.status);
      }
    });
    return map;
  }, [checkins]);

  const totalCheckins = checkins.length;
  const passedCheckins = checkins.filter((c) => c.status === "passed").length;
  const passRate = totalCheckins > 0 ? Math.round((passedCheckins / totalCheckins) * 100) : 0;
  const avgScore = useMemo(() => {
    const scored = checkins.filter((c) => c.interrogation);
    if (scored.length === 0) return 0;
    const sum = scored.reduce((s, c) => s + c.interrogation!.overallScore, 0);
    return Math.round((sum / scored.length) * 10) / 10;
  }, [checkins]);

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2.5rem", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Analytics</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>Your performance data across all roadmaps</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4" style={{ marginBottom: "2rem" }}>
        <StatCard icon={<BarChart3 size={16} strokeWidth={1.5} />} label="Total Check-ins" value={totalCheckins} color="var(--accent)" />
        <StatCard icon={<Target size={16} strokeWidth={1.5} />} label="Pass Rate" value={passRate} unit="%" color={passRate >= 70 ? "var(--green)" : passRate >= 50 ? "var(--yellow)" : "var(--red)"} />
        <StatCard icon={<Brain size={16} strokeWidth={1.5} />} label="Avg Score" value={avgScore} unit="/10" color={scoreColor(avgScore)} />
        <StatCard icon={<Shield size={16} strokeWidth={1.5} />} label="Integrity" value={integrityScore} color={integrityScore >= 20 ? "var(--green)" : "var(--yellow)"} />
        <StatCard icon={<CheckCircle2 size={16} strokeWidth={1.5} />} label="Tasks Done" value={`${verifiedTasks}/${totalTasks}`} color="var(--blue)" />
        <StatCard icon={<Clock size={16} strokeWidth={1.5} />} label="Study Hours" value={Math.round(totalStudyHours * 10) / 10} unit="hrs" color="var(--purple)" />
      </div>

      {/* Score Trend */}
      <div className="forge-panel" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", letterSpacing: "0.05em", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <TrendingUp size={18} strokeWidth={1.5} color="var(--accent)" />
          Score Trends
        </h2>
        <ScoreTrendChart points={scoreTrendPoints} />
      </div>

      {/* Year Heatmap */}
      <div className="forge-panel" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", letterSpacing: "0.05em", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <BarChart3 size={18} strokeWidth={1.5} color="var(--accent)" />
          Year Activity
        </h2>
        <YearHeatmap checkinMap={checkinMap} />
      </div>

      {/* Integrity Log */}
      {integrityLogs.length > 0 && (
        <div className="forge-panel" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.25rem", letterSpacing: "0.05em", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Shield size={18} strokeWidth={1.5} color="var(--accent)" />
            Integrity Log
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {integrityLogs.map((log) => (
              <div key={log.id} className="forge-card" style={{ padding: "0.75rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)", marginBottom: "0.125rem" }}>{log.description}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
                    {new Date(log.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", fontWeight: 600, color: log.delta >= 0 ? "var(--green)" : "var(--red)", whiteSpace: "nowrap" }}>
                  {log.delta >= 0 ? "+" : ""}{log.delta}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)", whiteSpace: "nowrap" }}>
                  {log.scoreAfter} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
