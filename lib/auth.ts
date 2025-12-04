import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/next-auth";
import { prisma } from "@/lib/prisma";
import { getClaimedRoles } from "./role";

export type AppUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  claims?: {
    roles: string[];
    userIdDb?: string;
  };
};

export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?error=unauthenticated");
  }
  return session.user as AppUser;
});

async function getUserRecord(user: AppUser) {
  if (user.claims?.userIdDb) {
    return { id: user.claims.userIdDb };
  }

  if (user.email) {
    const byEmail = await prisma.user.findUnique({
      where: { email: user.email.toLowerCase() },
      select: { id: true },
    });
    if (byEmail) {
      return byEmail;
    }
  }

  const record = await prisma.user.findFirst({
    where: { id: user.id },
    select: { id: true },
  });

  if (!record) {
    throw Object.assign(new Error("User not found"), { status: 401 });
  }

  return record;
}

export async function ensureUserInDB() {
  const user = await getCurrentUser();
  const roles = getClaimedRoles(user);
  const record = await getUserRecord(user);

  if (roles.includes("OWNER")) {
    return record.id;
  }

  const ownerRecord = await prisma.user.findFirst({
    where: {
      roles: {
        some: {
          role: {
            name: "OWNER",
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  return ownerRecord?.id ?? record.id;
}

export async function getAuthenticatedUserRecordId() {
  const user = await getCurrentUser();
  const record = await getUserRecord(user);
  return record.id;
}

export function getSessionRoles(user: AppUser) {
  const claimed = getClaimedRoles(user);
  if (claimed.length > 0) {
    return claimed;
  }
  return [];
}
