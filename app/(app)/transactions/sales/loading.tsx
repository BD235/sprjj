import Topbar from "@/components/topbar";
import { Skeleton } from "@/components/ui/skeleton";

// Konfigurasi kolom skeleton - mudah ditambah/diubah
const skeletonColumns = [
  { key: "name", headerWidth: "w-32", type: "double" },      // Nama Transaksi (2 baris)
  { key: "date", headerWidth: "w-20", type: "single" },      // Tanggal
  { key: "note", headerWidth: "w-24", type: "single" },      // Catatan
  { key: "actions", headerWidth: "w-12", type: "action" },   // Aksi
];

const tableRows = Array.from({ length: 5 });

export default function SalesTransactionsLoading() {
  return (
    <>
      <Topbar title="Penjualan" />
      <div className="h-6" />
      <div className="space-y-6">
        {/* Search & Buttons */}
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Skeleton className="h-12 w-full flex-1 rounded-full" />
            <div className="flex w-full flex-col gap-2 sm:ml-4 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
              <Skeleton className="h-12 w-full rounded-xl sm:w-24" />
              <Skeleton className="h-12 w-full rounded-xl sm:w-28" />
            </div>
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
                  <tr key={`sales-skeleton-row-${rowIndex}`} className="transition">
                    {skeletonColumns.map((col) => (
                      <td key={`${rowIndex}-${col.key}`} className="px-6 py-4">
                        {col.type === "double" && (
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        )}
                        {col.type === "single" && (
                          <Skeleton className="h-4 w-28" />
                        )}
                        {col.type === "action" && (
                          <Skeleton className="h-9 w-9 rounded-2xl" />
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

