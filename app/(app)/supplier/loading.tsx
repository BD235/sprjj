import Topbar from "@/components/topbar";
import { Skeleton } from "@/components/ui/skeleton";

const tableColumns = [
  { key: "name", width: "w-48" },
  { key: "whatsapp", width: "w-32" },
  { key: "location", width: "w-40" },
  { key: "category", width: "w-32" },
  { key: "status", width: "w-20" },
  { key: "actions", width: "w-28" },
];

const tableRows = Array.from({ length: 5 });

export default function SupplierLoading() {
  return (
    <>
      <Topbar />
      <div className="h-6" />
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-xl dark:border-[#38BDF8]/20 dark:bg-[#1E293B] dark:shadow-black/40">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-12 w-full flex-1 rounded-2xl" />
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-36" />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-[#38BDF8]/20 dark:bg-[#1E293B] dark:shadow-black/40">
          <div className="hidden border-b border-gray-100 px-6 py-4 text-sm font-semibold text-gray-500 dark:border-white/10 dark:text-gray-400 md:block">
            <div className="grid grid-cols-6 gap-4">
              {tableColumns.map((column) => (
                <Skeleton key={column.key} className={`h-4 ${column.width}`} />
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {tableRows.map((_, rowIndex) => (
              <div
                key={`supplier-skeleton-row-${rowIndex}`}
                className="grid grid-cols-1 gap-4 px-6 py-4 text-sm md:grid-cols-6"
              >
                {tableColumns.map((column) => {
                  if (column.key === "status") {
                    return (
                      <div key={`${rowIndex}-${column.key}`} className="flex items-center">
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </div>
                    );
                  }

                  if (column.key === "actions") {
                    return (
                      <div key={`${rowIndex}-${column.key}`} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
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
