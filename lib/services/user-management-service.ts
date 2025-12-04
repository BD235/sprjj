import { prisma } from "@/lib/prisma";

export type ManagedUser = {
  id: string;
  name: string | null;
  email: string;
  roles: string[];
  createdAt: string;
};

export async function getUsersWithRoles(): Promise<ManagedUser[]> {
  const rows = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      roles: {
        select: {
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.createdAt.toISOString(),
    roles: row.roles.map((entry) => entry.role.name),
  }));
}
