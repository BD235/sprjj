import { NextResponse } from "next/server";
import { ensureUserInDB } from "@/lib/auth";
import { requireAnyRole } from "@/lib/role-guard";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { productId: string } },
) {
  await requireAnyRole(["PEGAWAI", "OWNER"]);
  const dbUserId = await ensureUserInDB();

  const product = await prisma.product.findFirst({
    where: { id: params.productId, userId: dbUserId },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({
    product: {
      id: product.id,
      stockName: product.stockName,
      category: product.category,
      unit: product.unit,
      quantity: Number(product.quantity),
      priceValue: Number(product.price),
      lowStock: product.lowStock === null || product.lowStock === undefined ? null : Number(product.lowStock),
      supplier: product.supplier,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    },
  });
}
