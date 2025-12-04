// app/inventory/page.tsx
import Topbar from "@/components/topbar";
import { ensureUserInDB, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAnyRole } from "@/lib/role-guard";
import { getClaimedRoles, getIsOwner } from "@/lib/role";
import InventoryClient from "./inventory-client";

export default async function InventoryPage() {
  await requireAnyRole(["PEGAWAI", "OWNER"]);

  const MIN_SKELETON_DELAY_MS = 800;
  await new Promise((resolve) => setTimeout(resolve, MIN_SKELETON_DELAY_MS));

  const user = await getCurrentUser();
  const dbUserId = await ensureUserInDB();
  const claimedRoles = getClaimedRoles(user);
  const userRecordId = user.claims?.userIdDb ?? user.id;
  const isOwner = await getIsOwner(user.id, user.email, claimedRoles, userRecordId);

  const [products, suppliers] = await Promise.all([
    prisma.product.findMany({
      where: { userId: dbUserId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.supplier.findMany({
      where: { userId: dbUserId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const items = products.map((product) => ({
    id: product.id,
    stockName: product.stockName,
    category: product.category ?? null,
    price: Math.round(Number(product.price)),
    priceValue: Number(product.price),
    quantity: product.quantity,
    lowStock: product.lowStock,
    supplier: product.supplier ?? null,
    unit: product.unit,
    supplierId: product.supplierId ?? null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }));

  return (
    <>
      <Topbar />
      <div className="h-6" />
      <InventoryClient items={items} pageSize={7} canDelete={isOwner} suppliers={suppliers} />
    </>
  );
}
