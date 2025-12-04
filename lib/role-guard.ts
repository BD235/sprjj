// lib/role-guard.ts
import { getAuthenticatedUserRecordId, getCurrentUser } from "./auth";
import { getClaimedRoles, getUserRolesFromDB } from "./role";

export class ForbiddenError extends Error {
  status = 403 as const;
  constructor(msg = "Forbidden") { super(msg); }
}

export async function requireAnyRole(roles: ("OWNER" | "PEGAWAI")[]) {
  const user = await getCurrentUser();
  const claimedRoles = getClaimedRoles(user);

  const hasClaimedRole = roles.some((role) => claimedRoles.includes(role));
  if (hasClaimedRole) return;

  const userIdDb = await getAuthenticatedUserRecordId();
  const dbRoles = await getUserRolesFromDB(userIdDb);
  const ok = roles.some((role) => dbRoles.includes(role));
  if (!ok) throw new ForbiddenError();
}
