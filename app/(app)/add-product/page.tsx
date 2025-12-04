// app/add-product/page.tsx

import { createProduct } from "@/lib/actions/products";
import { ensureUserInDB, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAnyRole } from "@/lib/role-guard";
import { getClaimedRoles, getIsOwner } from "@/lib/role";
import Topbar from "@/components/topbar";
import Link from "next/link";
import PriceInput from "@/components/price-input";

const CATEGORY_OPTIONS = [
  "Daging Segar & Ikan",
  "Sayuran",
  "Bumbu & Rempah",
  "Sembako & Bahan Kering",
  "Kemasan",
  "Operasional",
];

const UNIT_OPTIONS = [
  { value: "GRAM", label: "Gram (g)" },
  { value: "KG", label: "Kilogram (kg)" },
  { value: "ML", label: "Mililiter (ml)" },
  { value: "PCS", label: "Pieces (pcs)" },
];

export default async function AddProductPage() {
  await requireAnyRole(["PEGAWAI", "OWNER"]);

  const user = await getCurrentUser();
  const dbUserId = await ensureUserInDB();
  const claimedRoles = getClaimedRoles(user);
  const userRecordId = user.claims?.userIdDb ?? user.id;
  const isOwner = await getIsOwner(user.id, user.email, claimedRoles, userRecordId);
  const suppliers = await prisma.supplier.findMany({
    where: { userId: dbUserId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <>
      <Topbar />
      <div className="h-4" />

      <section className="max-w-3xl">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm">
          <form className="space-y-6" action={createProduct}>
            <input type="hidden" name="redirectTo" value={isOwner ? "/inventory" : "/dashboard"} />
            <div className="space-y-2">
              <label htmlFor="stockName" className="text-sm font-medium text-gray-700">
                Stock Name *
              </label>
              <input
                type="text"
                id="stockName"
                name="stockName"
                required
                placeholder="Enter Stock Name"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  defaultValue=""
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                >
                  <option value="" disabled>
                    Select category
                    </option>
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="unit" className="text-sm font-medium text-gray-700">
                    Unit *
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    required
                    defaultValue="GRAM"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  >
                    {UNIT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
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
                    min="0"
                    required
                    placeholder="0"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium text-gray-700">
                    Price (Rp) *
                  </label>
                  <PriceInput id="price" name="price" min={0} required placeholder="0" className="w-full" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="lowStock" className="text-sm font-medium text-gray-700">
                  Low Stock *
                </label>
                <input
                  type="number"
                  id="lowStock"
                  name="lowStock"
                  min="0"
                  required
                  placeholder="Enter low stock threshold"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="supplierId" className="text-sm font-medium text-gray-700">
                  Supplier
                </label>
                <select
                  id="supplierId"
                  name="supplierId"
                  defaultValue=""
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                >
                  <option value="">No supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  Need a new supplier?{" "}
                  <Link href="/add-supplier" className="text-purple-600 hover:text-purple-700 underline">
                    Add it here
                  </Link>
                  .
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-purple-700"
                >
                  + Add stock
                </button>
                <Link
                  href={isOwner ? "/inventory" : "/dashboard"}
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
