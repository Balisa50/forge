export default function PricingLoading() {
  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "48px", height: "48px", border: "3px solid var(--border)", borderTopColor: "var(--accent)",
          borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1.5rem",
        }} />
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Loading Plans...
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
