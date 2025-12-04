import Topbar from "@/components/topbar";
import { ensureUserInDB, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAnyRole } from "@/lib/role-guard";
import { getClaimedRoles, getIsOwner } from "@/lib/role";
import TransactionsClient from "./transactions-client";

export default async function TransactionsPage() {
  await requireAnyRole(["OWNER"]);

  const MIN_SKELETON_DELAY_MS = 800;
  await new Promise((resolve) => setTimeout(resolve, MIN_SKELETON_DELAY_MS));

  const user = await getCurrentUser();
  const dbUserId = await ensureUserInDB();
  const claimedRoles = getClaimedRoles(user);
  const userRecordId = user.claims?.userIdDb ?? user.id;
  const isOwner = await getIsOwner(user.id, user.email, claimedRoles, userRecordId);

  const [transactions, products, suppliers] = await Promise.all([
    prisma.stockInTransaction.findMany({
      where: { userId: dbUserId },
      include: {
        supplier: true,
        product: true,
      },
      orderBy: { transactionDate: "desc" },
    }),
    prisma.product.findMany({
      where: { OR: [{ userId: user.id }, { userId: dbUserId }] },
      orderBy: { stockName: "asc" },
    }),
    prisma.supplier.findMany({
      where: { userId: dbUserId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const items = transactions.map((transaction) => ({
    id: transaction.id,
    name: transaction.transactionName,
    transactionDate: transaction.transactionDate.toISOString(),
    quantity: transaction.quantity,
    supplier: transaction.supplier?.name ?? null,
    supplierId: transaction.supplierId ?? null,
    totalPrice: transaction.totalAmount.toNumber(),
    paymentMethod: transaction.paymentMethod,
    status: transaction.status,
    productId: transaction.productId,
    productName: transaction.product.stockName,
  }));

  const productOptions = products.map((product) => ({
    id: product.id,
    name: product.stockName,
  }));

  const supplierOptions = suppliers.map((supplier) => ({
    id: supplier.id,
    name: supplier.name,
  }));

  return (
    <>
      <Topbar />
      <div className="h-6" />
      <TransactionsClient
        items={items}
        products={productOptions}
        suppliers={supplierOptions}
        pageSize={8}
        canManage={isOwner}
      />
    </>
  );
}
