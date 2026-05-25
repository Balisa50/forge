export default function Loading() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg-base)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.25rem",
        zIndex: 9999,
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          overflow: "hidden",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "forge-pulse 1.8s ease-in-out infinite",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="The Forge"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Loading bar */}
      <div
        style={{
          width: 120,
          height: 2,
          background: "var(--border)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: "var(--accent)",
            borderRadius: 2,
            animation: "forge-bar 1.8s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes forge-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(245,158,11,0); }
          50%       { opacity: 0.85; box-shadow: 0 0 0 8px rgba(245,158,11,0.15); }
        }
        @keyframes forge-bar {
          0%   { width: 0%; margin-left: 0; }
          50%  { width: 100%; margin-left: 0; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
