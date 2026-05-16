export default function DashboardLoading() {
  return (
    <div style={{ padding: "2rem" }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            width: "280px",
            height: "2.5rem",
            background: "var(--bg-panel)",
            borderRadius: "6px",
            marginBottom: "0.5rem",
            animation: "shimmer 1.5s ease-in-out infinite",
          }}
        />
        <div
          style={{
            width: "200px",
            height: "1rem",
            background: "var(--bg-panel)",
            borderRadius: "4px",
            animation: "shimmer 1.5s ease-in-out infinite",
            animationDelay: "0.1s",
          }}
        />
      </div>

      {/* CTA skeleton */}
      <div
        style={{
          height: "80px",
          background: "var(--bg-panel)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          marginBottom: "1.5rem",
          animation: "shimmer 1.5s ease-in-out infinite",
          animationDelay: "0.2s",
        }}
      />

      {/* Stats row skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              height: "90px",
              background: "var(--bg-panel)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              animation: "shimmer 1.5s ease-in-out infinite",
              animationDelay: `${0.3 + i * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Content grid skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: "200px",
              background: "var(--bg-panel)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              animation: "shimmer 1.5s ease-in-out infinite",
              animationDelay: `${0.6 + i * 0.1}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
