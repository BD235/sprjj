import { prisma } from "@/lib/prisma";

export async function findUserByEmailOrUsername(email: string, username: string) {
  return prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
    select: { id: true, email: true, username: true },
  });
}

export async function createUserRecord(params: {
  username: string;
  email: string;
  password: string;
}) {
  return prisma.user.create({
    data: {
      username: params.username,
      email: params.email,
      password: params.password,
      name: params.username,
    },
    select: { id: true, email: true },
  });
}
