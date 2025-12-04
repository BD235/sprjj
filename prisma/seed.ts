// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function ensureBaseRoles() {
  const roles = ["OWNER", "PEGAWAI"] as const;
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      create: { name: role, status: "active" },
      update: {},
    });
  }
  console.log("✅ Roles siap: OWNER, PEGAWAI");
}

async function ensureOwnerAccount() {
  const email = process.env.SEED_OWNER_EMAIL ?? "owner@example.com";
  const password = process.env.SEED_OWNER_PASSWORD ?? "owner12345";
  const name = process.env.SEED_OWNER_NAME ?? "Owner";
  const username =
    process.env.SEED_OWNER_USERNAME ?? email.split("@")[0]?.replace(/\W+/g, "") ?? "owner";

  const hashedPassword = await bcrypt.hash(password, 12);

  const owner = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      username,
      name,
      password: hashedPassword,
    },
    update: {},
    select: { id: true },
  });

  const ownerRole = await prisma.role.findUnique({ where: { name: "OWNER" } });
  if (!ownerRole) {
    throw new Error("Role OWNER belum tersedia.");
  }

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: owner.id, roleId: ownerRole.id } },
    create: { userId: owner.id, roleId: ownerRole.id },
    update: {},
  });

  console.log(`✅ Owner default siap (${email}). Pastikan ganti password setelah deploy.`);
}

async function main() {
  await ensureBaseRoles();
  await ensureOwnerAccount();
}

main()
  .catch((e) => {
    console.error("❌ Seed gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
