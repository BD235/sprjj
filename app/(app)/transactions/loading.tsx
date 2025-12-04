import Topbar from "@/components/topbar";
import { Skeleton } from "@/components/ui/skeleton";

const tableHeadings = [
  { key: "name", label: "Transaction Name", width: "w-48" },
  { key: "date", label: "Transaction Date", width: "w-36" },
  { key: "qty", label: "Quantity", width: "w-20" },
  { key: "supplier", label: "Supplier", width: "w-36" },
  { key: "price", label: "Total Price", width: "w-32" },
  { key: "payment", label: "Payment Method", width: "w-32" },
  { key: "status", label: "Status", width: "w-24" },
  { key: "actions", label: "Actions", width: "w-32" },
];

const tableRows = Array.from({ length: 5 });

export default function TransactionsLoading() {
  return (
    <>
      <Topbar />
      <div className="h-6" />
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-xl dark:border-[#38BDF8]/20 dark:bg-[#1E293B] dark:shadow-black/40">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-12 w-full flex-1 rounded-2xl" />
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-36" />
            </div>
            <Skeleton className="h-3 w-48" />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-[#38BDF8]/20 dark:bg-[#1E293B] dark:shadow-black/40">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm text-gray-700 dark:text-gray-200">
              <thead className="bg-gray-200 text-left font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-300">
                <tr>
                  {tableHeadings.map((column) => (
                    <th key={column.key} className="px-6 py-3">
                      <Skeleton className={`h-4 ${column.width}`} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white dark:divide-white/5 dark:bg-[#1E293B]">
                {tableRows.map((_, rowIndex) => (
                  <tr key={`transactions-skeleton-row-${rowIndex}`}>
                    {tableHeadings.map((column) => {
                      if (column.key === "name") {
                        return (
                          <td key={`${rowIndex}-${column.key}`} className="px-6 py-4">
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-48" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </td>
                        );
                      }

                      if (column.key === "supplier") {
                        return (
                          <td key={`${rowIndex}-${column.key}`} className="px-6 py-4">
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-36" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </td>
                        );
                      }

                      if (column.key === "price") {
                        return (
                          <td key={`${rowIndex}-${column.key}`} className="px-6 py-4">
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-28" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                          </td>
                        );
                      }

                      if (column.key === "status") {
                        return (
                          <td key={`${rowIndex}-${column.key}`} className="px-6 py-4">
                            <Skeleton className="h-6 w-24 rounded-full" />
                          </td>
                        );
                      }

                      if (column.key === "actions") {
                        return (
                          <td key={`${rowIndex}-${column.key}`} className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-8 w-8 rounded-full" />
                              <Skeleton className="h-8 w-8 rounded-full" />
                              <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={`${rowIndex}-${column.key}`} className="px-6 py-4">
                          <div className="space-y-2">
                            <Skeleton className={`h-4 ${column.width}`} />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
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
