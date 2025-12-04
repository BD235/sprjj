import Topbar from "@/components/topbar";
import PriceInput from "@/components/price-input";
import { createTransaction } from "@/lib/actions/transactions";
import { ensureUserInDB, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAnyRole } from "@/lib/role-guard";
import Link from "next/link";

const PAYMENT_METHOD_OPTIONS = [
  { value: "CASH", label: "Cash" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "OTHER", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

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

  const [products, suppliers] = await Promise.all([
    prisma.product.findMany({
      where: { OR: [{ userId: user.id }, { userId: dbUserId }] },
      orderBy: { stockName: "asc" },
    }),
    prisma.supplier.findMany({
      where: { userId: dbUserId },
      orderBy: { name: "asc" },
    }),
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

          <form className="space-y-6" action={createTransaction}>
            <div className="space-y-2">
              <label htmlFor="transactionName" className="text-sm font-medium text-gray-700">
                Transaction Name *
              </label>
              <input
                type="text"
                id="transactionName"
                name="transactionName"
                required
                placeholder="Enter transaction name"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  disabled={!hasProducts}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="productId" className="text-sm font-medium text-gray-700">
                    Product *
                  </label>
                  <select
                    id="productId"
                    name="productId"
                    required
                    defaultValue=""
                    disabled={!hasProducts}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  >
                    <option value="" disabled>
                      Select product
                    </option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.stockName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="supplierId" className="text-sm font-medium text-gray-700">
                    Supplier
                  </label>
                  <select
                    id="supplierId"
                    name="supplierId"
                    defaultValue=""
                    disabled={!hasProducts}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  >
                    <option value="">No supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    required
                    min={0}
                    placeholder="0"
                    disabled={!hasProducts}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="totalAmount" className="text-sm font-medium text-gray-700">
                    Total Price (Rp) *
                  </label>
                  <PriceInput
                    id="totalAmount"
                    name="totalAmount"
                    min={0}
                    required
                    placeholder="0"
                    className="w-full"
                    disabled={!hasProducts}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="transactionDate" className="text-sm font-medium text-gray-700">
                    Transaction Date *
                  </label>
                  <input
                    type="datetime-local"
                    id="transactionDate"
                    name="transactionDate"
                    required
                    defaultValue={defaultDate}
                    disabled={!hasProducts}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="paymentMethod" className="text-sm font-medium text-gray-700">
                    Payment Method *
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    required
                    defaultValue="CASH"
                    disabled={!hasProducts}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  >
                    {PAYMENT_METHOD_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  defaultValue="COMPLETED"
                  disabled={!hasProducts}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  type="submit"
                  disabled={!hasProducts}
                  className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  + Add transaction
                </button>
                <Link
                  href="/transactions"
                  className="rounded-xl bg-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 shadow hover:bg-gray-300"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </section>
      </>
  );
}
