import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ApplyLinkCard from "@/components/ApplyLinkCard";
import MentorInvitesPanel from "@/components/MentorInvitesPanel";
import ApplicationsQueue from "@/components/ApplicationsQueue";

/**
 * Add mentees — the one place a mentor grows their roster.
 *
 * Three ways in, one page:
 * 1. Share the public apply link (inbound funnel).
 * 2. Review applications that came through it.
 * 3. Invite someone directly by name (outbound).
 */
export default async function AddMenteesPage() {
 const session = await auth();
 if (!session?.user?.id) redirect("/login");

 return (
 <div style={{ paddingBottom: "4rem" }}>
 <Link
 href="/dashboard/mentor"
 className="inline-flex items-center gap-1.5 text-xs mb-4"
 style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}
 >
 <ArrowLeft size={12} /> mentor overview
 </Link>

 <div style={{ marginBottom: "1.25rem" }}>
 <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
 Add mentees
 </h1>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", maxWidth: 680, lineHeight: 1.55 }}>
 Share your apply link, review the applications it brings in, or invite someone directly by name.
 </p>
 </div>

 <ApplyLinkCard mentorId={session.user.id} />

 <MentorInvitesPanel />

 <ApplicationsQueue />
 </div>
 );
}
