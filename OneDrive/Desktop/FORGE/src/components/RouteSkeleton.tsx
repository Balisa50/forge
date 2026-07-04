/**
 * RouteSkeleton — shared instant-feedback skeleton for dashboard routes.
 *
 * Rendered by per-segment loading.tsx files so every sidebar click paints
 * SOMETHING within a frame, even when the server render is stuck behind a
 * Neon cold start or a slow connection. Server component, zero client JS.
 */

function Block({ height, width = "100%", delay = 0, style }: { height: number | string; width?: number | string; delay?: number; style?: React.CSSProperties }) {
 return (
 <div
 style={{
 height,
 width,
 background: "var(--bg-panel)",
 border: "1px solid var(--border)",
 borderRadius: 8,
 animation: "forge-skeleton 1.5s ease-in-out infinite",
 animationDelay: `${delay}s`,
 ...style,
 }}
 />
 );
}

export default function RouteSkeleton({ rows = 3, statStrip = false }: { rows?: number; statStrip?: boolean }) {
 return (
 <div>
 {/* Page title */}
 <div style={{ marginBottom: "2rem" }}>
 <Block height="2.5rem" width={280} style={{ border: "none", marginBottom: "0.5rem" }} />
 <Block height="1rem" width={200} style={{ border: "none" }} />
 </div>

 {statStrip && <Block height={46} delay={0.1} style={{ marginBottom: "1.5rem" }} />}

 <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
 {Array.from({ length: rows }, (_, i) => (
 <Block key={i} height={150} delay={0.15 + i * 0.08} />
 ))}
 </div>

 <style>{`
 @keyframes forge-skeleton {
 0%, 100% { opacity: 0.4; }
 50% { opacity: 0.75; }
 }
 `}</style>
 </div>
 );
}
