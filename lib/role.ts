// lib/role.ts
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export function getClaimedRoles(user: unknown): string[] {
  const roles = (user as { claims?: { roles?: unknown } })?.claims?.roles;
  if (!Array.isArray(roles)) return [];
  return roles.filter((role): role is string => typeof role === "string");
}

export const getUserRolesFromDB = cache(async (userId: string) => {
  const rows = await prisma.userRole.findMany({
    where: { userId },
    select: { role: { select: { name: true } } },
  });
  return rows.map((row) => row.role.name);
});

/**
 * Cek apakah user adalah OWNER.
 * Urutan: claims (cepat & stabil) → DB (ground truth).
 */
export async function getIsOwner(
  userId: string,
  email?: string | null,
  claimedRoles?: string[],
  userIdDb?: string,
) {
  // 1) Fallback cepat dari session claims (kalau tersedia)
  if (claimedRoles?.includes("OWNER")) return true;

  if (userIdDb) {
    const roles = await getUserRolesFromDB(userIdDb);
    return roles.includes("OWNER");
  }

  // 2) Cek DB (by email → fallback id)
  const emailLc = (email ?? "").toLowerCase();

  const byEmail = emailLc
    ? await prisma.user.findUnique({
        where: { email: emailLc },
        include: { roles: { include: { role: true } } },
      })
    : null;

  const dbUser =
    byEmail ??
    (await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } },
    }));

  return !!dbUser?.roles.some((r) => r.role.name === "OWNER");
}
