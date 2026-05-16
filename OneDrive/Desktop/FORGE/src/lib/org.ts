import { prisma } from "./prisma";

/** Get the user's org membership + role, or null */
export async function getUserOrg(userId: string) {
  const membership = await prisma.orgMembership.findFirst({
    where: { userId },
    include: { org: true },
  });
  return membership;
}

/** Check if user has one of the allowed roles */
export function hasRole(role: string, allowed: string[]): boolean {
  return allowed.includes(role);
}

/** Admin roles that can manage the org */
export const ADMIN_ROLES = ["owner", "admin"];
export const STAFF_ROLES = ["owner", "admin", "instructor", "mentor"];
