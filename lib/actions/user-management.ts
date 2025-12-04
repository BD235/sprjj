"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ensureUserInDB, getCurrentUser } from "@/lib/auth";
import { requireAnyRole } from "@/lib/role-guard";

async function getRoleByName(name: "OWNER" | "PEGAWAI") {
  const role = await prisma.role.findUnique({ where: { name } });
  if (!role) {
    throw new Error(`Role ${name} tidak ditemukan`);
  }
  return role;
}

export async function updateUserRole(formData: FormData) {
  await requireAnyRole(["OWNER"]);
  const currentUser = await getCurrentUser();
  await ensureUserInDB();

  const targetUserId = String(formData.get("userId") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim().toUpperCase();

  if (!targetUserId) {
    throw new Error("User tidak valid");
  }
  if (role !== "OWNER" && role !== "PEGAWAI") {
    throw new Error("Role tidak dikenal");
  }

  if (targetUserId === currentUser.id && role !== "OWNER") {
    throw new Error("Tidak dapat menghapus role OWNER dari diri sendiri");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      email: true,
      name: true,
      roles: { select: { role: { select: { name: true }, }, }, },
    },
  });
  if (!targetUser) {
    throw new Error("User tidak ditemukan");
  }

  const ownerRole = await getRoleByName("OWNER");
  const pegawaiRole = await getRoleByName("PEGAWAI");

  const isCurrentlyOwner = targetUser.roles.some((entry) => entry.role.name === "OWNER");

  if (role === "PEGAWAI" && isCurrentlyOwner) {
    const remainingOwners = await prisma.userRole.count({
      where: {
        roleId: ownerRole.id,
        userId: { not: targetUserId },
      },
    });
    if (remainingOwners === 0) {
      throw new Error("Minimal harus ada satu OWNER aktif.");
    }
  }

  if (role === "OWNER") {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: targetUserId, roleId: ownerRole.id } },
      create: { userId: targetUserId, roleId: ownerRole.id },
      update: {},
    });
  } else {
    await prisma.userRole.deleteMany({
      where: { userId: targetUserId, roleId: ownerRole.id },
    });
  }

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: targetUserId, roleId: pegawaiRole.id } },
    create: { userId: targetUserId, roleId: pegawaiRole.id },
    update: {},
  });

  revalidatePath("/settings");
}
