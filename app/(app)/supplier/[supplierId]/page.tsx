import Topbar from "@/components/topbar";
import { ensureUserInDB, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAnyRole } from "@/lib/role-guard";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ViewSupplierPageProps {
  params: {
    supplierId: string;
  };
}

function formatStatus(status: string) {
  const lower = status.toLowerCase();
  return lower.replace(/\b\w/g, (char) => char.toUpperCase());
}

function getWhatsappLink(number: string | null) {
  if (!number) return null;
  const digits = number.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

export default async function ViewSupplierPage({ params }: ViewSupplierPageProps) {
  await requireAnyRole(["OWNER"]);

  await getCurrentUser();
  const dbUserId = await ensureUserInDB();
  const supplier = await prisma.supplier.findFirst({
    where: { id: params.supplierId, userId: dbUserId },
  });

  if (!supplier) {
    notFound();
  }

  const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" });
  const timeFormatter = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const dateAdded = dateFormatter.format(supplier.createdAt);
  const timeAdded = timeFormatter.format(supplier.createdAt);
  const whatsappLink = getWhatsappLink(supplier.whatsappNumber);

  return (
    <>
      <Topbar />
      <div className="h-4" />

      <section className="max-w-3xl">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Supplier Name *</label>
              <input
                type="text"
                readOnly
                value={supplier.name}
                className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 shadow-inner focus:outline-none"
              />
            </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">WhatsApp Number</label>
                  <input
                    type="text"
                    readOnly
                    value={supplier.whatsappNumber ?? "-"}
                    className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 shadow-inner focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Category Seller *</label>
                  <input
                    type="text"
                    readOnly
                    value={supplier.category ?? "-"}
                    className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 shadow-inner focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Location</label>
                <textarea
                  readOnly
                  value={supplier.address ?? "-"}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 shadow-inner focus:outline-none"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Status *</label>
                  <input
                    type="text"
                    readOnly
                    value={formatStatus(supplier.status)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 shadow-inner focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">WhatsApp Link</label>
                  {whatsappLink ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        readOnly
                        value={whatsappLink}
                        className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 shadow-inner focus:outline-none"
                      />
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow hover:bg-emerald-700"
                      >
                        Open WhatsApp
                      </a>
                    </div>
                  ) : (
                    <input
                      type="text"
                      readOnly
                      value="-"
                      className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-800 shadow-inner focus:outline-none"
                    />
                  )}
                </div>
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
                  href="/supplier"
                  className="rounded-xl bg-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 shadow hover:bg-gray-300"
                >
                  Back to suppliers
                </Link>
                <Link
                  href={`/supplier/${supplier.id}/edit`}
                  className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-purple-700"
                >
                  Edit supplier
                </Link>
              </div>
            </div>
          </div>
        </section>
    </>
  );
}
