/**
 * /apply/[mentorId] — mentor-scoped application page.
 *
 * When a mentor shares their personal apply link (from the Applications
 * dashboard), applicants land here. The application is tagged with the
 * mentor's ID so only they see it in their review queue. The mentor's
 * real identity is never revealed — only their display name is shown.
 */
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ApplyForm from "../ApplyForm";

interface Props {
  params: Promise<{ mentorId: string }>;
}

export default async function MentorApplyPage({ params }: Props) {
  const { mentorId } = await params;

  // Validate the mentor exists and is actually a mentor
  const mentor = await prisma.user.findUnique({
    where: { id: mentorId },
    select: { role: true, mentorDisplayName: true, name: true },
  });

  if (!mentor || mentor.role !== "mentor") {
    redirect("/apply");
  }

  // Use their display name (persona) — never the real name
  const displayName = mentor.mentorDisplayName ?? "your mentor";

  return <ApplyForm mentorId={mentorId} mentorName={displayName} />;
}
