import Topbar from "@/components/topbar";
import { ensureUserInDB, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAnyRole } from "@/lib/role-guard";
import type { SupplierOption } from "@/types/supplier";
import { NewTransactionForm } from "./new-transaction-form";

function toDatetimeLocal(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export default async function NewTransactionPage() {
  await requireAnyRole(["OWNER"]);

  const user = await getCurrentUser();
  const dbUserId = await ensureUserInDB();

  const supplierOptionsPromise = prisma.supplier.findMany({
    where: { userId: dbUserId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  }) as Promise<SupplierOption[]>;

  const [products, suppliers] = await Promise.all([
    prisma.product
      .findMany({
        where: { OR: [{ userId: user.id }, { userId: dbUserId }] },
        orderBy: { stockName: "asc" },
      })
      .then((rows: { id: string; stockName: string; price: unknown; unit: string }[]) =>
        rows.map((p: { id: string; stockName: string; price: unknown; unit: string }) => ({
          id: p.id,
          name: p.stockName,
          price: Number(p.price),
          unit: p.unit,
        })),
      ),
    supplierOptionsPromise,
  ]);

  const hasProducts = products.length > 0;
  const defaultDate = toDatetimeLocal(new Date());

  return (
    <>
      <Topbar title="Add Transaction" />
      <div className="h-4" />

      <section className="max-w-3xl">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm">
          {!hasProducts && (
            <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              You need at least one product before recording a transaction. Please add an inventory item
              first.
            </div>
          )}

          <NewTransactionForm
            products={products}
            suppliers={suppliers}
            defaultDate={defaultDate}
            hasProducts={hasProducts}
          />
        </div>
      </section>
    </>
  );
}
