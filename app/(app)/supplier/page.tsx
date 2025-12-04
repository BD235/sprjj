import Topbar from "@/components/topbar";
import { ensureUserInDB, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAnyRole } from "@/lib/role-guard";
import { getClaimedRoles, getIsOwner } from "@/lib/role";
import SupplierClient from "./supplier-client";

export default async function SupplierPage() {
  await requireAnyRole(["OWNER"]);

  const MIN_SKELETON_DELAY_MS = 800;
  await new Promise((resolve) => setTimeout(resolve, MIN_SKELETON_DELAY_MS));

  const user = await getCurrentUser();
  const dbUserId = await ensureUserInDB();
  const claimedRoles = getClaimedRoles(user);
  const userRecordId = user.claims?.userIdDb ?? user.id;
  const isOwner = await getIsOwner(user.id, user.email, claimedRoles, userRecordId);

  const suppliers = await prisma.supplier.findMany({
    where: { userId: dbUserId },
    orderBy: { createdAt: "desc" },
  });

  const items = suppliers.map((supplier) => ({
    id: supplier.id,
    name: supplier.name,
    whatsappNumber: supplier.whatsappNumber ?? null,
    address: supplier.address ?? null,
    category: supplier.category ?? null,
    status: supplier.status,
    createdAt: supplier.createdAt.toISOString(),
    updatedAt: supplier.updatedAt.toISOString(),
  }));

  return (
    <>
      <Topbar />
      <div className="h-6" />
      <SupplierClient items={items} pageSize={8} canDelete={isOwner} />
    </>
  );
}
