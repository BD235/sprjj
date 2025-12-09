import Topbar from "@/components/topbar";
import { Skeleton } from "@/components/ui/skeleton";

const tableRows = Array.from({ length: 6 });
const tableColumns = [
  { className: "w-48" },
  { className: "w-32" },
  { className: "w-24" },
  { className: "w-24" },
  { className: "w-40" },
  { className: "w-32" },
];

export default function InventoryLoading() {
  return (
    <>
      <Topbar />
      <div className="h-6" />
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Skeleton className="h-12 w-full flex-1 rounded-full" />
            <Skeleton className="h-12 w-full rounded-xl sm:w-36" />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="hidden border-b border-gray-100 px-6 py-4 text-sm font-semibold text-gray-500 md:block">
            <div className="grid grid-cols-6 gap-4">
              {tableColumns.map((column, index) => (
                <Skeleton key={index} className={`h-4 ${column.className}`} />
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {tableRows.map((_, rowIndex) => (
              <div
                key={`inventory-skeleton-row-${rowIndex}`}
                className="grid grid-cols-1 gap-4 px-6 py-4 text-sm md:grid-cols-6"
              >
                {tableColumns.map((column, columnIndex) => (
                  <div key={`${rowIndex}-${columnIndex}`} className="flex flex-col gap-2">
                    <Skeleton className={`h-4 ${column.className}`} />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </>
  );
}
