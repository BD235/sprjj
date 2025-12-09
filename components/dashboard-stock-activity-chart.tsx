"use client";

import { ChangeEvent, useEffect, useMemo, useState, useTransition } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

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
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { getMonthlyStockActivity, type MonthlyStockData } from "@/lib/actions/dashboard";

interface DashboardStockActivityChartProps {
    initialData: MonthlyStockData[];
    availableYears: number[];
    userId: string;
}

const chartConfig = {
    desktop: {
        label: "Stock Masuk",
        color: "#a8cfff",
    },
    mobile: {
        label: "Stock Keluar",
        color: "#5c9dff",
    },
} satisfies ChartConfig;

export function DashboardStockActivityChart({
    initialData,
    availableYears,
    userId,
}: DashboardStockActivityChartProps) {
    const [windowWidth, setWindowWidth] = useState<number | null>(null);
    const [selectedYear, setSelectedYear] = useState<number>(
        availableYears[0] ?? new Date().getFullYear()
    );
    const [chartData, setChartData] = useState(
        initialData.map((item) => ({
            month: item.month,
            desktop: item.stockIn,
            mobile: item.stockOut,
        }))
    );
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const updateWidth = () => {
            if (typeof window === "undefined") return;
            setWindowWidth(window.innerWidth);
        };
        updateWidth();
        if (typeof window === "undefined") return;
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    const visibleMonths = useMemo(() => {
        if (windowWidth === null) return 12;
        if (windowWidth < 640) return 3;
        if (windowWidth < 1024) return 6;
        return 12;
    }, [windowWidth]);

    const scrollWidthPercent = useMemo(() => {
        const multiplier = chartData.length / Math.max(visibleMonths, 1);
        return `${Math.max(multiplier, 1) * 100}%`;
    }, [chartData.length, visibleMonths]);

    const handleYearChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const year = Number(event.target.value);
        setSelectedYear(year);

        startTransition(async () => {
            const data = await getMonthlyStockActivity(userId, year);
            setChartData(
                data.map((item) => ({
                    month: item.month,
                    desktop: item.stockIn,
                    mobile: item.stockOut,
                }))
            );
        });
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <CardTitle>Stock In vs Stock Out</CardTitle>
                        <CardDescription>Last 12 months of stock activity.</CardDescription>
                    </div>
                    <select
                        id="stock-activity-year"
                        value={selectedYear}
                        onChange={handleYearChange}
                        disabled={isPending}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {availableYears.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto pb-2">
                    <div className="min-w-full" style={{ minWidth: scrollWidthPercent }}>
                        <ChartContainer config={chartConfig}>
                            <AreaChart
                                accessibilityLayer
                                data={chartData}
                                margin={{
                                    left: 12,
                                    right: 12,
                                }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    interval={0}
                                    minTickGap={12}
                                    tickFormatter={(value) => value.slice(0, 3)}
                                />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <defs>
                                    <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#d9e8ff" stopOpacity={0.95} />
                                        <stop offset="95%" stopColor="#f1f6ff" stopOpacity={0.25} />
                                    </linearGradient>
                                    <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#bcd9ff" stopOpacity={0.95} />
                                        <stop offset="95%" stopColor="#e6f0ff" stopOpacity={0.25} />
                                    </linearGradient>
                                </defs>
                                <Area
                                    dataKey="mobile"
                                    type="natural"
                                    fill="url(#fillMobile)"
                                    fillOpacity={0.9}
                                    stroke="var(--color-mobile)"
                                    stackId="a"
                                    strokeWidth={2}
                                />
                                <Area
                                    dataKey="desktop"
                                    type="natural"
                                    fill="url(#fillDesktop)"
                                    fillOpacity={0.9}
                                    stroke="var(--color-desktop)"
                                    stackId="a"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ChartContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
