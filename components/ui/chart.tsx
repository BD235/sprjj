"use client";

import * as React from "react";
import clsx from "clsx";
import { ResponsiveContainer, Tooltip, type TooltipProps } from "recharts";

const DEFAULT_COLORS = ["#2563eb", "#16a34a", "#9333ea", "#f97316", "#ec4899", "#0ea5e9"];

export type ChartConfig = Record<
  string,
  {
    label?: string;
    color?: string;
  }
>;

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config?: ChartConfig;
  children: React.ReactElement;
}

export function ChartContainer({ config = {}, className, children }: ChartContainerProps) {
  const colorVars = React.useMemo<React.CSSProperties>(() => {
    const entries = Object.entries(config);
    if (entries.length === 0) return {};

    return entries.reduce((acc, [key, value], index) => {
      const fallback = DEFAULT_COLORS[index % DEFAULT_COLORS.length];
      const color = value.color ?? fallback;
      (acc as Record<string, string>)[`--color-${key}`] = color;
      (acc as Record<string, string>)[`--chart-${index + 1}`] = color;
      return acc;
    }, {} as React.CSSProperties);
  }, [config]);

  return (
    <div className={clsx("h-[300px] w-full", className)} style={colorVars}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export function ChartTooltip(props: TooltipProps<number, string>) {
  return <Tooltip {...props} wrapperStyle={{ outline: "none" }} />;
}

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: {
    value?: number;
    name?: string;
    dataKey?: string;
    color?: string;
  }[];
  label?: string;
  indicator?: "dot" | "line" | "dashed";
  labelFormatter?: (value: string) => React.ReactNode;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  indicator = "dot",
  labelFormatter,
}: ChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;
  const formatLabel = label && labelFormatter ? labelFormatter(label) : label;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-xs text-slate-900 shadow-lg backdrop-blur">
      {formatLabel && (
        <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-slate-500">
          {formatLabel}
        </p>
      )}
      <div className="mt-2 space-y-1 text-sm">
        {payload.map((item) => {
          const key = item.dataKey ?? item.name ?? "value";
          const color = item.color ?? "currentColor";
          // Map dataKey to user-friendly labels
          const labelMap: Record<string, string> = {
            stockIn: "Stock In",
            stockOut: "Stock Out",
          };
          const displayLabel = labelMap[key] ?? item.name ?? key;
          const indicatorClass =
            indicator === "line"
              ? "h-0.5 w-4 rounded-full"
              : indicator === "dashed"
                ? "h-0.5 w-4 border-t-2 border-dashed"
                : "h-2 w-2 rounded-full";
          const indicatorStyle =
            indicator === "dashed"
              ? { borderColor: color }
              : {
                backgroundColor: color,
              };

          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-slate-500">
                <span className={indicatorClass} style={indicatorStyle} />
                {displayLabel}
              </span>
              <span className="font-semibold text-slate-900">
                {item.value?.toLocaleString("id-ID")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
