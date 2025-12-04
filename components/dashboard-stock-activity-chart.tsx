"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type StockActivityPoint = {
  date: string;
  stockIn: number;
  stockOut: number;
};

const STOCK_IN_COLOR = "#22c55e";
const STOCK_OUT_COLOR = "#ef4444";

function formatDateLabel(value: string) {
  return new Date(value).toLocaleDateString("id-ID", { month: "short", day: "numeric" });
}

function StockTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0 || !label) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-900/95 dark:text-slate-100">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">{formatDateLabel(label)}</p>
      <div className="mt-2 space-y-1">
        {payload.map((item) => (
          <p key={item.dataKey} className="flex items-center justify-between gap-6">
            <span className="capitalize text-slate-500 dark:text-slate-400">
              {item.dataKey === "stockIn" ? "Stock In" : "Stock Out"}
            </span>
            <span className="font-semibold">{item.value?.toLocaleString("id-ID")}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

const timeRanges = [
  { label: "Last 7 days", value: "7d", days: 7 },
  { label: "Last 30 days", value: "30d", days: 30 },
  { label: "Last 3 months", value: "90d", days: 90 },
] as const;
type TimeRange = (typeof timeRanges)[number]["value"];

export function DashboardStockActivityChart({ data }: { data: StockActivityPoint[] }) {
  const [range, setRange] = useState<TimeRange>("30d");
  const filteredData = useMemo(() => {
    const days = timeRanges.find((option) => option.value === range)?.days ?? 30;
    return data.slice(-days);
  }, [data, range]);
  const rangeLabel = timeRanges.find((option) => option.value === range)?.label ?? "";

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-lg dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">Stock In vs Stock Out</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing stock movement for {rangeLabel.toLowerCase()}.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="hidden overflow-hidden rounded-full border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 shadow-inner sm:flex dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {timeRanges.map((option) => {
              const active = option.value === range;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRange(option.value)}
                  className={`px-4 py-2 transition ${
                    active
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                      : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/60"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <div className="relative sm:hidden">
            <select
              aria-label="Select date range"
              value={range}
              onChange={(event) => setRange(event.target.value as TimeRange)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {timeRanges.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500 dark:text-slate-400">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-6 dark:border-slate-800">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillStockIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={STOCK_IN_COLOR} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={STOCK_IN_COLOR} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="fillStockOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={STOCK_OUT_COLOR} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={STOCK_OUT_COLOR} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#E2E8F0" strokeOpacity={0.9} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={20}
                tickFormatter={formatDateLabel}
                stroke="#94a3b8"
              />
              <YAxis hide />
              <Tooltip content={<StockTooltip />} />
              <Area
                dataKey="stockIn"
                type="natural"
                fill="url(#fillStockIn)"
                stroke={STOCK_IN_COLOR}
                strokeWidth={1.2}
                name="Stock In"
              />
              <Area
                dataKey="stockOut"
                type="natural"
                fill="url(#fillStockOut)"
                stroke={STOCK_OUT_COLOR}
                strokeWidth={1.2}
                name="Stock Out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-300">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STOCK_OUT_COLOR }} />
            Stock Out
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STOCK_IN_COLOR }} />
            Stock In
          </span>
        </div>
      </div>
    </div>
  );
}
