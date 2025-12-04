import Topbar from "@/components/topbar";
import { ensureUserInDB, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAnyRole } from "@/lib/role-guard";
import Link from "next/link";
import { notFound } from "next/navigation";

interface TransactionDetailPageProps {
  params: {
    transactionId: string;
  };
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\u00a0/g, " ");
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function TransactionDetailPage({ params }: TransactionDetailPageProps) {
  await requireAnyRole(["OWNER"]);

  await getCurrentUser();
  const dbUserId = await ensureUserInDB();
  const transaction = await prisma.stockInTransaction.findFirst({
    where: { id: params.transactionId, userId: dbUserId },
    include: {
      product: true,
      supplier: true,
    },
  });

  if (!transaction) {
    notFound();
  }

  const formattedAmount = formatCurrency(transaction.totalAmount.toNumber());
  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(transaction.transactionDate);

  return (
    <>
      <Topbar title="Transaction Detail" />
      <div className="h-4" />

      <section className="max-w-3xl">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Transaction Name</label>
              <input
                type="text"
                readOnly
                value={transaction.transactionName}
                className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 shadow-inner focus:outline-none"
              />
            </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Transaction Date</label>
                  <input
                    type="text"
                    readOnly
                    value={formattedDate}
                    className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 shadow-inner focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="text"
                    readOnly
                    value={String(transaction.quantity)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 shadow-inner focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Supplier</label>
                <input
                  type="text"
                  readOnly
                  value={transaction.supplier?.name ?? "-"}
                  className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 shadow-inner focus:outline-none"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Total Price</label>
                  <input
                    type="text"
                    readOnly
                    value={formattedAmount}
                    className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 shadow-inner focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Payment Method</label>
                  <input
                    type="text"
                    readOnly
                    value={formatLabel(transaction.paymentMethod)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 shadow-inner focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <input
                    type="text"
                    readOnly
                    value={formatLabel(transaction.status)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 shadow-inner focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Product</label>
                  <input
                    type="text"
                    readOnly
                    value={transaction.product.stockName}
                    className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 shadow-inner focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/transactions"
                  className="rounded-xl bg-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 shadow hover:bg-gray-300"
                >
                  Back to transactions
                </Link>
                <Link
                  href={`/transactions/${transaction.id}/edit`}
                  className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-purple-700"
                >
                  Edit transaction
                </Link>
              </div>
            </div>
          </div>
        </section>
    </>
  );
}
