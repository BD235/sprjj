"use client";

import { Bar, BarChart, XAxis, YAxis, Tooltip } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart";

type StockUsageDatum = {
  name: string;
  value: number;
  fill: string;
};

const FALLBACK_COLORS = ["#bcd9ff", "#8dc1ff", "#5ea6ff", "#3a88ff", "#1b68e2"];

interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    payload?: {
      productName?: string;
      visitors?: number;
    };
  }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-slate-900">{data.productName}</p>
      <p className="text-xs text-slate-600">
        Used: <span className="font-medium">{data.visitors?.toLocaleString("id-ID")}</span>
      </p>
    </div>
  );
}

export function DashboardStockRadialChart({
  data,
  totalUsage,
  timeframeLabel,
}: {
  data: StockUsageDatum[];
  totalUsage: number;
  timeframeLabel: string;
}) {
  const hasData = data.length > 0;
  const chartItems = data.slice(0, 5).map((item, index) => {
    const key = `stock-${index + 1}`;
    const color = FALLBACK_COLORS[index % FALLBACK_COLORS.length];
    return {
      key,
      label: item.name,
      value: item.value,
      color,
    };
  });

  const chartConfig = chartItems.reduce<ChartConfig>(
    (config, item) => {
      config[item.key] = { label: item.label, color: item.color };
      return config;
    },
    { visitors: { label: "Jumlah pakai" } },
  );

  const chartData = chartItems.map((item) => ({
    browser: item.key,
    productName: item.label,
    visitors: item.value,
    fill: `var(--color-${item.key})`,
  }));

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-col space-y-1.5 pb-4">
        <CardTitle className="text-lg font-semibold leading-tight">Top 5 Most Used Products</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Showing most used stocks in the {timeframeLabel}.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-6">
        {hasData ? (
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{
                left: 0,
                right: 12,
                top: 8,
                bottom: 8,
              }}
            >
              <YAxis
                dataKey="browser"
                type="category"
                tickLine={false}
                tickMargin={8}
                axisLine={false}
                width={75}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const label = chartConfig[value as keyof typeof chartConfig]?.label ?? value;
                  return label.length > 9 ? `${label.slice(0, 9)}...` : label;
                }}
              />
              <XAxis dataKey="visitors" type="number" hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
              <Bar dataKey="visitors" radius={5} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm font-medium text-slate-500">
            No outbound transactions yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

