import Topbar from "@/components/topbar";
import { Skeleton } from "@/components/ui/skeleton";

const tableColumns = [
  { key: "name", width: "w-56" },
  { key: "date", width: "w-36" },
  { key: "note", width: "w-48" },
  { key: "actions", width: "w-20" },
];

const tableRows = Array.from({ length: 5 });

export default function SalesTransactionsLoading() {
  return (
    <>
      <Topbar title="Penjualan" />
      <div className="h-6" />
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-xl dark:border-[#38BDF8]/20 dark:bg-[#1E293B] dark:shadow-black/40">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-12 w-full flex-1 rounded-2xl" />
            <Skeleton className="h-12 w-32" />
            <div className="ml-auto flex items-center gap-2">
              <Skeleton className="h-12 w-20" />
              <Skeleton className="h-12 w-28" />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-[#38BDF8]/20 dark:bg-[#1E293B] dark:shadow-black/40">
          <div className="hidden border-b border-gray-100 px-6 py-4 text-sm font-semibold text-gray-500 dark:border-white/10 dark:text-gray-400 md:block">
            <div className="grid grid-cols-4 gap-4">
              {tableColumns.map((column) => (
                <Skeleton key={column.key} className={`h-4 ${column.width}`} />
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {tableRows.map((_, rowIndex) => (
              <div
                key={`sales-skeleton-row-${rowIndex}`}
                className="grid grid-cols-1 gap-4 px-6 py-4 text-sm md:grid-cols-4"
              >
                {tableColumns.map((column) => {
                  if (column.key === "actions") {
                    return (
                      <div key={`${rowIndex}-${column.key}`} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    );
                  }

                  if (column.key === "name") {
                    return (
                      <div key={`${rowIndex}-${column.key}`} className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    );
                  }

                  if (column.key === "note") {
                    return (
                      <div key={`${rowIndex}-${column.key}`} className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    );
                  }

                  return (
                    <div key={`${rowIndex}-${column.key}`} className="space-y-2">
                      <Skeleton className={`h-4 ${column.width}`} />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  );
                })}
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
