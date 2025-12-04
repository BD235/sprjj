import Topbar from "@/components/topbar";
import { updateSupplier } from "@/lib/actions/suppliers";
import { ensureUserInDB, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAnyRole } from "@/lib/role-guard";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EditSupplierPageProps {
  params: {
    supplierId: string;
  };
}

export default async function EditSupplierPage({ params }: EditSupplierPageProps) {
  await requireAnyRole(["OWNER"]);

  await getCurrentUser();
  const dbUserId = await ensureUserInDB();

  const supplier = await prisma.supplier.findFirst({
    where: { id: params.supplierId, userId: dbUserId },
  });

  if (!supplier) {
    notFound();
  }

  return (
    <>
      <Topbar />
      <div className="h-4" />

      <section className="max-w-3xl">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm">
          <form className="space-y-6" action={updateSupplier}>
            <input type="hidden" name="id" value={supplier.id} />

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Supplier Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={supplier.name}
                placeholder="Enter supplier name"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="whatsappNumber" className="text-sm font-medium text-gray-700">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    id="whatsappNumber"
                    name="whatsappNumber"
                    defaultValue={supplier.whatsappNumber ?? ""}
                    placeholder="e.g. 628123456789"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium text-gray-700">
                    Category Seller *
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    required
                    defaultValue={supplier.category ?? ""}
                    placeholder="Enter category"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Location
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  defaultValue={supplier.address ?? ""}
                  placeholder="Enter supplier location"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  defaultValue={supplier.status}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-purple-700"
                >
                  Update supplier
                </button>
                <Link
                  href="/supplier"
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
