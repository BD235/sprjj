// app/(app)/inventory/[productId]/page.tsx

import Topbar from "@/components/topbar";
import { ensureUserInDB, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAnyRole } from "@/lib/role-guard";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ViewProductPageProps {
  params: {
    productId: string;
  };
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/\u00a0/g, " ");
}

export default async function ViewProductPage({ params }: ViewProductPageProps) {
  await requireAnyRole(["PEGAWAI", "OWNER"]);

  await getCurrentUser();
  const dbUserId = await ensureUserInDB();
  const product = await prisma.product.findFirst({
    where: { id: params.productId, userId: dbUserId },
  });

  if (!product) {
    notFound();
  }

  const price = formatPrice(product.price.toNumber());
  const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" });
  const timeFormatter = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const dateAdded = dateFormatter.format(product.createdAt);
  const timeAdded = timeFormatter.format(product.createdAt);

  return (
    <>
      <Topbar />
      <div className="h-4" />

      <section className="max-w-3xl">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Stock Name *</label>
              <input
                type="text"
                readOnly
                value={product.stockName}
                className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 shadow-inner focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category *</label>
              <input
                type="text"
                readOnly
                value={product.category ?? "-"}
                className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 shadow-inner focus:outline-none"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Quantity *</label>
                <input
                  type="text"
                  readOnly
                  value={String(product.quantity)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 shadow-inner focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Price (Rp) *</label>
                <input
                  type="text"
                  readOnly
                  value={price}
                  className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 shadow-inner focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Low Stock *</label>
              <input
                type="text"
                readOnly
                value={
                  product.lowStock === null || product.lowStock === undefined
                    ? "-"
                    : String(product.lowStock)
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 shadow-inner focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Supplier *</label>
              <input
                type="text"
                readOnly
                value={product.supplier ?? "-"}
                className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 shadow-inner focus:outline-none"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date added *</label>
                <input
                  type="text"
                  readOnly
                  value={dateAdded}
                  className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 shadow-inner focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Time added *</label>
                <input
                  type="text"
                  readOnly
                  value={timeAdded}
                  className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 shadow-inner focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/inventory"
                className="rounded-xl bg-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 shadow hover:bg-gray-300"
              >
                Back to inventory
              </Link>
              <Link
                href={`/inventory/${product.id}/edit`}
                className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-purple-700"
              >
                Edit stock
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
