import Link from "next/link";
import { Flame, ArrowLeft } from "lucide-react";

export default function NotFound() {
 return (
 <div
 style={{
 background: "var(--bg-base)",
 minHeight: "100vh",
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 padding: "2rem",
 color: "var(--text-primary)",
 }}
 >
 <div style={{ textAlign: "center", maxWidth: "480px" }}>
 <div style={{ color: "var(--accent)", marginBottom: "1.5rem", display: "flex", justifyContent: "center" }}>
 <Flame size={56} strokeWidth={1.5} />
 </div>

 <h1
 style={{
 fontFamily: "var(--font-headline)",
 fontSize: "clamp(5rem, 15vw, 10rem)",
 lineHeight: 0.9,
 fontWeight: 700,
 color: "var(--text-dim)",
 marginBottom: "1rem",
 }}
 >
 404
 </h1>

 <h2
 style={{
 fontFamily: "var(--font-headline)",
 fontSize: "1.75rem",
 letterSpacing: "0.05em",
 marginBottom: "0.75rem",
 }}
 >
 Page Not Found
 </h2>

 <p
 style={{
 color: "var(--text-secondary)",
 fontSize: "0.9375rem",
 lineHeight: 1.6,
 marginBottom: "2.5rem",
 }}
 >
 This path doesn&apos;t exist in The Forge. Maybe it was wiped. Maybe it never was.
 </p>

 <div className="flex flex-col sm:flex-row gap-3 justify-center">
 <Link
 href="/"
 className="forge-btn forge-btn-primary"
 style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem" }}
 >
 <ArrowLeft size={16} /> Back Home
 </Link>
 <Link
 href="/dashboard"
 className="forge-btn forge-btn-ghost"
 style={{ padding: "0.75rem 1.5rem" }}
 >
 Go to Dashboard
 </Link>
 </div>
 </div>
 </div>
 );
}
