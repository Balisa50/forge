import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_LEARNING_STYLES = ["balanced", "hands_on", "theory_first", "spaced", "sprint"];

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { name, timezone, bio, github, linkedin, isPublic, learningStyle, mentorDisplayName } = body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Name must be at least 2 characters." }, { status: 400 });
  }

  const VALID_TIMEZONES = Intl.supportedValuesOf?.("timeZone") ?? [];
  if (timezone && VALID_TIMEZONES.length > 0 && !VALID_TIMEZONES.includes(timezone)) {
    return NextResponse.json({ error: "Invalid timezone." }, { status: 400 });
  }
  if (learningStyle && !VALID_LEARNING_STYLES.includes(learningStyle)) {
    return NextResponse.json({ error: "Invalid learning style." }, { status: 400 });
  }

  // All profile fields persist now - the old route silently dropped
  // bio/github/linkedin/isPublic/learningStyle, so they never saved.
  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name.trim(),
      ...(timezone ? { timezone } : {}),
      ...(typeof bio === "string" ? { bio: bio.trim().slice(0, 600) || null } : {}),
      ...(typeof github === "string" ? { github: github.trim().slice(0, 200) || null } : {}),
      ...(typeof linkedin === "string" ? { linkedin: linkedin.trim().slice(0, 200) || null } : {}),
      ...(typeof isPublic === "boolean" ? { isPublic } : {}),
      ...(learningStyle ? { learningStyle } : {}),
      // The persona name mentees see. Empty string clears it (falls back to name).
      ...(typeof mentorDisplayName === "string"
        ? { mentorDisplayName: mentorDisplayName.trim().slice(0, 80) || null }
        : {}),
    },
    select: { id: true, name: true, timezone: true, mentorDisplayName: true },
  });

  return NextResponse.json(updated);
}
