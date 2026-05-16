import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import OrgNavTabs from "@/components/OrgNavTabs";

export default async function OrgLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const membership = await prisma.orgMembership.findFirst({
    where: { userId: session.user.id },
    include: { org: true },
  });

  // If not in an org, show create/join page (no redirect)
  if (!membership) {
    return <div>{children}</div>;
  }

  const isStaff = ["owner", "admin", "instructor", "mentor"].includes(membership.role);

  return (
    <div>
      {/* Org header */}
      <div style={{ marginBottom: "2rem" }}>
        <div className="flex items-center gap-3 mb-1">
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-headline)",
            fontSize: "1rem",
            color: "var(--accent)",
          }}>
            {membership.org.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "1.75rem", letterSpacing: "0.05em" }}>
              {membership.org.name}
            </h1>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {membership.role}
            </div>
          </div>
        </div>
      </div>

      {/* Org nav tabs */}
      {isStaff && <OrgNavTabs />}

      {children}
    </div>
  );
}
