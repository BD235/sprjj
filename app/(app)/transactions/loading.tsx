import Topbar from "@/components/topbar";
import { Skeleton } from "@/components/ui/skeleton";

// Konfigurasi kolom skeleton - mudah ditambah/diubah
const skeletonColumns = [
  { key: "name", headerWidth: "w-36", type: "single" },        // Transaction Name
  { key: "date", headerWidth: "w-32", type: "single" },        // Transaction Date
  { key: "qty", headerWidth: "w-20", type: "single" },         // Quantity
  { key: "supplier", headerWidth: "w-24", type: "single" },    // Supplier
  { key: "price", headerWidth: "w-28", type: "single" },       // Total Price
  { key: "payment", headerWidth: "w-32", type: "single" },     // Payment Method
  { key: "status", headerWidth: "w-20", type: "badge" },       // Status
  { key: "actions", headerWidth: "w-20", type: "actions" },    // Actions (3 buttons)
];

const tableRows = Array.from({ length: 5 });

export default function TransactionsLoading() {
  return (
    <>
      <Topbar title="Pembelian" />
      <div className="h-6" />
      <div className="space-y-6">
        {/* Search & Button */}
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Skeleton className="h-12 w-full flex-1 rounded-full" />
            <Skeleton className="h-12 w-full rounded-xl sm:w-44" />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-hidden">
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  {skeletonColumns.map((col) => (
                    <th key={col.key} className="px-6 py-3 text-left font-semibold">
                      <Skeleton className={`h-4 ${col.headerWidth}`} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {tableRows.map((_, rowIndex) => (
                  <tr key={`transactions-skeleton-row-${rowIndex}`} className="transition">
                    {skeletonColumns.map((col) => (
                      <td key={`${rowIndex}-${col.key}`} className="px-6 py-4">
                        {col.type === "single" && (
                          <Skeleton className="h-4 w-24" />
                        )}
                        {col.type === "badge" && (
                          <Skeleton className="h-6 w-20 rounded-full" />
                        )}
                        {col.type === "actions" && (
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-9 w-9 rounded-2xl" />
                            <Skeleton className="h-9 w-9 rounded-2xl" />
                            <Skeleton className="h-9 w-9 rounded-2xl" />
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2">
          <Skeleton className="h-10 w-16 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-16 rounded-lg" />
        </div>
      </div>
    </>
  );
}

