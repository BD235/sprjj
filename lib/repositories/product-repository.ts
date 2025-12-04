import { prisma } from "@/lib/prisma";

export async function findProductsForLowStock(userId: string) {
  return prisma.product.findMany({
    where: { userId },
    select: { id: true, stockName: true, quantity: true, lowStock: true },
    orderBy: { updatedAt: "desc" },
  });
}
