import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MentorInvitesPanel from "@/components/MentorInvitesPanel";

export default function MentorInvitePage() {
 return (
 <div>
 <Link
 href="/dashboard/mentor"
 style={{
 display: "inline-flex",
 alignItems: "center",
 gap: "0.375rem",
 color: "var(--text-secondary)",
 fontSize: "0.8125rem",
 fontFamily: "var(--font-mono)",
 textDecoration: "none",
 marginBottom: "1rem",
 }}
 >
 <ArrowLeft size={14} /> Back to Overview
 </Link>

 <div style={{ marginBottom: "1rem" }}>
 <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
 Invite a mentee
 </h1>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", maxWidth: 680, lineHeight: 1.55 }}>
 Generate a name-locked invite. You&apos;ll get TWO codes to send privately to your mentee, a single-use join link
 and a permanent Personal ID. Manage all your active invites here.
 </p>
 </div>

 <MentorInvitesPanel />
 </div>
 );
}
