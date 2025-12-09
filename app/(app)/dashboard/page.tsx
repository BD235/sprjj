// app/dashboard/page.tsx
import { DashboardMetricCounter } from "@/components/dashboard-metric-counter";
import { DashboardStockLevelsTable } from "@/components/dashboard-stock-levels-table";
import { DashboardStockActivityChart } from "@/components/dashboard-stock-activity-chart";
import { DashboardStockRadialChart } from "@/components/dashboard-stock-radial-chart";
import Topbar from "@/components/topbar";
import { CardFade } from "@/components/motion/card-fade";
import { ensureUserInDB, getCurrentUser } from "@/lib/auth";
import { requireAnyRole } from "@/lib/role-guard";
import { prisma } from "@/lib/prisma";
import { getMonthlyStockActivity, getAvailableTransactionYears } from "@/lib/actions/dashboard";
import clsx from "clsx";

type StockStatus = "out" | "critical" | "warning" | "ok";

function getStockStatus(quantity: number, threshold: number): StockStatus {
  if (quantity <= 0) {
    return "out";
  }

  if (threshold <= 0) {
    return "ok";
  }

  const halfThreshold = threshold / 2;

  if (quantity <= halfThreshold) {
    return "critical";
  }

  if (quantity < threshold) {
    return "warning";
  }

  return "ok";
}

const statusMeta: Record<StockStatus, { bg: string; text: string; label: string }> = {
  out: { bg: "bg-red-700", text: "text-red-700", label: "Out of stock" },
  critical: { bg: "bg-red-500", text: "text-red-600", label: "Critical low" },
  warning: { bg: "bg-yellow-500", text: "text-yellow-600", label: "Low stock" },
  ok: { bg: "bg-green-600", text: "text-green-600", label: "In stock" },
};

const unitDivisors = {
  GRAM: 1000,
  ML: 1000,
  PCS: 1,
} as const;

const STOCK_USAGE_LOOKBACK_DAYS = 30;
const usageColorPalette = ["#6366f1", "#0ea5e9", "#22c55e", "#f97316", "#ec4899"] as const;

function deriveProductValue(price: number, quantity: number, unit: keyof typeof unitDivisors) {
  const divisor = unitDivisors[unit] ?? 1;
  const normalizedQuantity = quantity / divisor;
  return price * normalizedQuantity;
}

export default async function DashboardPage() {
  await requireAnyRole(["PEGAWAI", "OWNER"]);
  await getCurrentUser();
  const dbUserId = await ensureUserInDB();

  const currentYear = new Date().getFullYear();

  const [totalProducts, allProducts, topUsedStocks, stockActivityData, availableYears] = await Promise.all([
    prisma.product.count({ where: { userId: dbUserId } }),
    prisma.product.findMany({
      where: { userId: dbUserId },
      select: {
        id: true,
        stockName: true,
        price: true,
        quantity: true,
        lowStock: true,
        createdAt: true,
        updatedAt: true,
        unit: true,
      },
    }),
    getTopUsedStocks(dbUserId),
    getMonthlyStockActivity(dbUserId, currentYear),
    getAvailableTransactionYears(dbUserId),
  ]);

  const totalValue = allProducts.reduce((sum: number, product: (typeof allProducts)[number]) => {
    const price = Number(product.price);
    const quantity = Number(product.quantity);
    if (!Number.isFinite(price) || !Number.isFinite(quantity)) return sum;
    const unit = (product.unit ?? "PCS") as keyof typeof unitDivisors;
    const value = deriveProductValue(price, quantity, unit);
    return sum + value;
  }, 0);
  const statusCounts = allProducts.reduce(
    (acc: Record<StockStatus, number>, product: (typeof allProducts)[number]) => {
      const quantity = Number(product.quantity);
      const threshold = Number(product.lowStock ?? 0);
      const status = getStockStatus(quantity, threshold);
      acc[status] += 1;
      return acc;
    },
    { out: 0, critical: 0, warning: 0, ok: 0 } as Record<StockStatus, number>,
  );
  const outOfStockCount = statusCounts.out;
  const lowStockCount = statusCounts.critical + statusCounts.warning;
  const inStockCount = statusCounts.ok;

  const pct = (n: number) => (totalProducts > 0 ? Math.round((n / totalProducts) * 100) : 0);
  const inStockPercentage = pct(inStockCount);
  const lowStockPercentage = pct(lowStockCount);
  const outOfStockPercentage = pct(outOfStockCount);

  const scoredProducts = [...allProducts].map((product: (typeof allProducts)[number]) => {
    const quantity = Number(product.quantity);
    const threshold = Number(product.lowStock ?? 0);
    const urgencyScore = threshold > 0 ? Math.max(0, 1 - quantity / threshold) : quantity <= 0 ? 1 : 0;
    return { ...product, urgencyScore };
  });

  const stockTableItems = scoredProducts
    .sort((a, b) => {
      if (b.urgencyScore !== a.urgencyScore) return b.urgencyScore - a.urgencyScore;
      if (a.lowStock === null) return 1;
      if (b.lowStock === null) return -1;
      if (a.lowStock !== b.lowStock) return Number(a.lowStock) - Number(b.lowStock);
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    })
    .map((product: (typeof scoredProducts)[number]) => ({
      id: product.id,
      stockName: product.stockName,
      lowStock: Number(product.lowStock ?? 0),
      updatedAt: product.updatedAt.toISOString(),
      quantity: Number(product.quantity),
      status: getStockStatus(Number(product.quantity), Number(product.lowStock ?? 0)),
    }));

  const metricCards = [
    {
      id: "value",
      title: "Inventory Value",
      value: totalValue,
      valueFormat: "currency" as const,
      badge: `+${inStockPercentage}%`,
      badgeTone: "positive" as const,
      headline: "Stock value growing",
      description: "Updated from all current SKUs.",
      background:
        "bg-gradient-to-br from-indigo-500/15 via-indigo-500/5 to-white/80",
    },
    {
      id: "products",
      title: "Total Products",
      value: totalProducts,
      valueFormat: "number" as const,
      badge: outOfStockPercentage > 0 ? `-${outOfStockPercentage}%` : "+0%",
      badgeTone: outOfStockPercentage > 0 ? ("negative" as const) : ("positive" as const),
      headline: "Active items tracked",
      description: `${totalProducts - outOfStockCount} ready for sale.`,
      background:
        "bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-white/80",
    },
    {
      id: "restock",
      title: "Low Stock Items",
      value: lowStockCount,
      valueFormat: "number" as const,
      badge: `-${lowStockPercentage}%`,
      badgeTone: "negative" as const,
      headline: "Need review soon",
      description: "Below the defined reorder point.",
      background:
        "bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-white/80",
    },
    {
      id: "healthy",
      title: "Healthy Stock",
      value: inStockPercentage,
      valueFormat: "percent" as const,
      badge: `+${Math.max(inStockPercentage - lowStockPercentage, 0)}%`,
      badgeTone: "positive" as const,
      headline: "Adequate coverage",
      description: `${totalProducts - lowStockCount} products on target.`,
      background:
        "bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-white/80",
    },
  ];
  const usageRadialData = topUsedStocks.map((item: { productId: string; stockName: string; quantity: number }, index: number) => ({
    name: item.stockName,
    value: item.quantity,
    fill: usageColorPalette[index % usageColorPalette.length],
  }));
  const totalUsageQuantity = topUsedStocks.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
  const usageTimeframeLabel = `${STOCK_USAGE_LOOKBACK_DAYS} hari terakhir`;

  return (
    <>
      <Topbar />
      <div className="h-6" />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => {
          const badgeClasses =
            card.badgeTone === "positive"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-600";
          return (
            <CardFade
              key={card.id}
              className="border-none bg-transparent p-0 shadow-none"
            >
              <div
                className={clsx(
                  "flex h-full flex-col justify-between rounded-2xl border border-white/70 p-5 shadow-xl backdrop-blur",
                  card.background,
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  </div>
                  <span className={clsx("rounded-full px-3 py-1 text-xs font-semibold", badgeClasses)}>
                    {card.badge}
                  </span>
                </div>
                <div>
                  <p className="mt-3 text-3xl font-semibold text-gray-900">
                    <DashboardMetricCounter value={card.value} format={card.valueFormat} />
                  </p>
                  <p className="mt-4 text-sm font-semibold text-gray-900">{card.headline}</p>
                  <p className="text-sm text-gray-500">{card.description}</p>
                </div>
              </div>
            </CardFade>
          );
        })}
      </div>

      <div className="mb-6 grid items-stretch gap-4 xl:grid-cols-12">
        <div className="h-full xl:col-span-9">
          <DashboardStockActivityChart
            initialData={stockActivityData}
            availableYears={availableYears}
            userId={dbUserId}
          />
        </div>
        <div className="h-full xl:col-span-3">
          <DashboardStockRadialChart
            data={usageRadialData}
            totalUsage={totalUsageQuantity}
            timeframeLabel={usageTimeframeLabel}
          />
        </div>
      </div>

      <CardFade className="p-6">
        <DashboardStockLevelsTable items={stockTableItems} statusMeta={statusMeta} />
      </CardFade>
    </>
  );
}
async function getTopUsedStocks(userId: string) {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - STOCK_USAGE_LOOKBACK_DAYS);

  const rows = await prisma.$queryRaw<
    { id: string; name: string; totalUsed: bigint | number }[]
  >`
    SELECT s.id_stok AS "id",
           s.nama_stok AS "name",
           SUM(tk.jumlah) AS "totalUsed"
    FROM stok s
    JOIN transaksi_keluar tk
      ON s.id_stok = tk.id_stok
     AND tk.id_user = ${userId}
     AND tk.tanggal_transaksi >= ${startDate}
    WHERE s.id_user = ${userId}
    GROUP BY s.id_stok, s.nama_stok
    ORDER BY "totalUsed" DESC
    LIMIT 5;
  `;

  return rows.map((row: { id: string; name: string; totalUsed: bigint | number }) => ({
    productId: row.id,
    stockName: row.name,
    quantity: Number(row.totalUsed ?? 0),
  }));
}
