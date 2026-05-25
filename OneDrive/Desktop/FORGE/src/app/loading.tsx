export default function Loading() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#060608",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
        zIndex: 9999,
      }}
    >
      {/* Logo — SVG, no background box, glows naturally against dark */}
      <div style={{ position: "relative", width: 148, height: 148 }}>
        {/* Amber glow behind */}
        <div style={{
          position: "absolute",
          inset: -16,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)",
          animation: "forge-glow 2s ease-in-out infinite",
        }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icon.svg"
          alt="The Forge"
          style={{
            width: 148,
            height: 148,
            display: "block",
            position: "relative",
            zIndex: 1,
            borderRadius: 26,
          }}
        />
      </div>

      {/* Progress bar */}
      <div style={{
        width: 80,
        height: 2,
        background: "rgba(255,255,255,0.05)",
        borderRadius: 2,
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          background: "#f59e0b",
          borderRadius: 2,
          animation: "forge-bar 1.6s ease-in-out infinite",
        }} />
      </div>

      <style>{`
        @keyframes forge-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.08); }
        }
        @keyframes forge-bar {
          0%   { width: 0%;   margin-left: 0; }
          50%  { width: 100%; margin-left: 0; }
          100% { width: 0%;   margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
