export default function SettingsLoading() {
 return (
 <div style={{ maxWidth: "600px" }}>
 <div style={{ width: "160px", height: "2.5rem", background: "var(--bg-panel)", borderRadius: "6px", marginBottom: "0.5rem", animation: "shimmer 1.5s ease-in-out infinite" }} />
 <div style={{ width: "320px", height: "1rem", background: "var(--bg-panel)", borderRadius: "4px", marginBottom: "2rem", animation: "shimmer 1.5s ease-in-out infinite", animationDelay: "0.1s" }} />

 {[0, 1, 2].map((i) => (
 <div key={i} style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "10px", padding: "1.25rem", marginBottom: "1rem", animation: "shimmer 1.5s ease-in-out infinite", animationDelay: `${0.2 + i * 0.15}s` }}>
 <div style={{ width: "120px", height: "0.875rem", background: "var(--border)", borderRadius: "4px", marginBottom: "1rem" }} />
 <div style={{ width: "100%", height: "40px", background: "var(--bg-card)", borderRadius: "6px", marginBottom: "0.75rem" }} />
 <div style={{ width: "100%", height: "40px", background: "var(--bg-card)", borderRadius: "6px" }} />
 </div>
 ))}

 <style>{`
 @keyframes shimmer {
 0%, 100% { opacity: 0.4; }
 50% { opacity: 0.7; }
 }
 `}</style>
 </div>
 );
}
