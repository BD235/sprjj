"use client";

import { useMemo, useState } from "react";

type StockStatus = "out" | "critical" | "warning" | "ok";

type StockTableItem = {
  id: string;
  stockName: string;
  lowStock: number;
  quantity: number;
  updatedAt: string;
  status: StockStatus;
};

type StatusMeta = Record<StockStatus, { bg: string; text: string; label: string }>;

export function DashboardStockLevelsTable({
  items,
  statusMeta,
}: {
  items: StockTableItem[];
  statusMeta: StatusMeta;
}) {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    if (!search) return items;
    return items.filter((item) => item.stockName.toLowerCase().includes(search.toLowerCase()));
  }, [items, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
              <path d="M11 11l5 5m-3-7a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari produk..."
            className="w-full rounded-2xl border border-gray-200 bg-gray-50/80 py-2.5 pl-10 pr-4 text-sm text-gray-600 shadow-inner focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="text-sm text-gray-500">
          Menampilkan {filteredItems.length} dari {items.length} produk.
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        {filteredItems.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            Tidak ada produk yang cocok dengan pencarian.
          </div>
        ) : (
          <div className="max-h-[28rem] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50 text-left font-semibold text-gray-500">
                <tr>
                  <th className="px-5 py-3">Produk</th>
                  <th className="px-5 py-3">Update Terakhir</th>
                  <th className="px-5 py-3 text-center">Stok / Target</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => {
                  const meta = statusMeta[item.status];
                  const threshold = item.lowStock > 0 ? item.lowStock : null;
                  const lastUpdated = new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "medium",
                  }).format(new Date(item.updatedAt));
                  const ratio = threshold !== null ? `${item.quantity}/${threshold}` : `${item.quantity}`;

                  return (
                    <tr key={item.id} className="bg-white text-gray-900">
                      <td className="px-5 py-4">
                        <div className="font-semibold">{item.stockName}</div>
                        <div className="text-xs text-gray-500">
                          Low stock: {threshold !== null ? threshold.toLocaleString("id-ID") : "—"}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{lastUpdated}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                          {ratio}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold uppercase tracking-wide">
                        <span className={meta.text}>{meta.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
