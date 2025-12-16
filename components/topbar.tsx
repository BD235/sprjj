// components/topbar.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { QueryFunctionContext, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { dispatchSidebarEvent } from "@/lib/sidebar-events";
import { Modal } from "@/components/ui/modal";
import { AnimatePresence, motion } from "framer-motion";

type LowStockNotification = {
  id: string;
  productId: string;
  stockName: string;
  message: string;
  status: "out" | "critical" | "warning";
  quantity: number;
  threshold: number;
  notifiedAt: string | null;
  notificationId: string | null;
};

type ProductDetailPayload = {
  id: string;
  stockName: string;
  category: string | null;
  unit: string;
  quantity: number;
  priceValue: number;
  lowStock: number | null;
  supplier: string | null;
  createdAt: string;
  updatedAt: string;
};

type NotificationsApiResponse = {
  notifications?: unknown;
  error?: unknown;
};

const LOW_STOCK_QUERY_KEY = ["low-stock-notifications"] as const;

const timestampFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const detailCurrencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const detailDateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" });
const detailTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function formatTimestamp(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  try {
    return timestampFormatter.format(date);
  } catch {
    return null;
  }
}

function formatDetailPrice(value: number) {
  return detailCurrencyFormatter.format(value).replace(/\u00a0/g, " ");
}

function formatDetailDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return detailDateFormatter.format(date);
}

function formatDetailTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return detailTimeFormatter.format(date);
}

const unitLabels: Record<string, string> = {
  GRAM: "gram",
  ML: "ml",
  PCS: "pcs",
};

function formatUnit(unit: string) {
  return unitLabels[unit] ?? unit.toLowerCase();
}

function coerceNotification(value: unknown): LowStockNotification | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const rawProductId =
    typeof record.productId === "string"
      ? record.productId
      : typeof record.id === "string"
        ? record.id
        : null;
  if (!rawProductId) return null;

  const stockName = typeof record.stockName === "string" ? record.stockName : null;
  const message = typeof record.message === "string" ? record.message : null;
  const status = record.status;

  if (!stockName || !message) return null;
  if (status !== "out" && status !== "critical" && status !== "warning") return null;

  const quantityRaw = (record as { quantity?: unknown }).quantity;
  const thresholdRaw = (record as { threshold?: unknown }).threshold;
  const quantity = typeof quantityRaw === "number" ? quantityRaw : Number(quantityRaw);
  const threshold = typeof thresholdRaw === "number" ? thresholdRaw : Number(thresholdRaw ?? 0);

  if (Number.isNaN(quantity) || Number.isNaN(threshold)) return null;

  const notifiedAt = typeof record.notifiedAt === "string" ? record.notifiedAt : null;
  const notificationId =
    typeof record.notificationId === "string"
      ? record.notificationId
      : typeof record.id === "string"
        ? record.id
        : null;

  return {
    id: rawProductId,
    productId: rawProductId,
    stockName,
    message,
    status,
    quantity,
    threshold,
    notifiedAt,
    notificationId,
  };
}

function normalizeNotifications(payload: NotificationsApiResponse | null): LowStockNotification[] {
  if (!payload || !Array.isArray(payload.notifications)) return [];
  return payload.notifications
    .map((item) => coerceNotification(item))
    .filter((item): item is LowStockNotification => item !== null);
}

async function fetchLowStockNotifications({
  signal,
}: QueryFunctionContext<typeof LOW_STOCK_QUERY_KEY>): Promise<LowStockNotification[]> {
  const response = await fetch("/api/notifications/low-stock", {
    cache: "no-store",
    signal,
  });

  let payload: NotificationsApiResponse | null = null;
  try {
    payload = (await response.json()) as NotificationsApiResponse;
  } catch {
    // ignore body parsing errors, we'll surface a generic failure below
  }

  if (!response.ok) {
    const message =
      (payload && typeof payload.error === "string" && payload.error) ||
      "Failed to load notifications";
    throw new Error(message);
  }

  return normalizeNotifications(payload);
}

function prettify(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function deriveTitle(pathname: string) {
  if (pathname.startsWith("/supplier/") && pathname.endsWith("/edit")) {
    return "Edit Supplier";
  }
  if (/^\/supplier\/[^/]+$/.test(pathname)) {
    return "Supplier Detail";
  }
  const map: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/inventory": "Inventory",
    "/supplier": "Supplier",
    "/transactions": "Pembelian",
    "/settings": "Settings",
    "/add-product": "Add Product",
    "/add-supplier": "Add Supplier",
  };
  for (const key of Object.keys(map)) {
    if (pathname === key || pathname.startsWith(key + "/")) return map[key];
  }
  const seg = pathname.split("/").filter(Boolean).pop() ?? "";
  return seg ? prettify(seg) : "Dashboard";
}

export default function Topbar({
  title,
  onBellClick,
  containerClassName = "ml-[0rem] mr-0 -mt-4 top-4",
  barClassName = "h-12 mx-0"  // untuk tinggi/gutter/padding bar
}: {
  title?: string;
  onBellClick?: () => void;
  containerClassName?: string;
  barClassName?: string;
}) {
  const pathname = usePathname() ?? "/";
  const computedTitle = title ?? deriveTitle(pathname);
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const { data: session } = useSession();
  const userDisplayName = session?.user?.name ?? session?.user?.email ?? "User";
  const userInitial = useMemo(() => userDisplayName.charAt(0).toUpperCase(), [userDisplayName]);
  const primaryRole = (session?.user?.claims?.roles ?? [])[0] ?? "Member";
  const {
    data: notifications = [],
    error,
    isPending,
    refetch,
  } = useQuery({
    queryKey: LOW_STOCK_QUERY_KEY,
    queryFn: fetchLowStockNotifications,
    staleTime: 60_000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: isOpen ? 15_000 : false,
  });

  useEffect(() => {
    if (!isOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    refetch().catch(() => { });
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, refetch]);

  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [isProfileMenuOpen]);

  const errorMessage = error instanceof Error ? error.message : null;
  const initialLoading = isPending && notifications.length === 0;
  const hasNotifications = notifications.length > 0;
  const hasError = Boolean(errorMessage);
  const showEmptyState = !initialLoading && !hasError && notifications.length === 0;
  const showList = !initialLoading && !hasError && notifications.length > 0;
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<ProductDetailPayload | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const handleBellClick = () => {
    onBellClick?.();
    setIsOpen((prev) => {
      const next = !prev;
      if (!prev && next) {
        refetch().catch(() => { });
      }
      return next;
    });
  };

  const closeDrawer = () => {
    setIsOpen(false);
  };

  const closeProfileMenu = () => setIsProfileMenuOpen(false);
  const handleSidebarToggle = () => {
    dispatchSidebarEvent("toggle");
  };

  const openNotificationDetail = async (productId: string) => {
    setDetailModalOpen(true);
    setDetailProduct(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}`, { cache: "no-store" });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Gagal memuat detail stok");
      }
      const payload = (await response.json()) as { product: ProductDetailPayload };
      setDetailProduct(payload.product);
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : "Gagal memuat detail stok");
      setDetailProduct(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeNotificationDetail = () => {
    setDetailModalOpen(false);
    setDetailProduct(null);
    setDetailError(null);
    setDetailLoading(false);
  };

  return (
    // samakan dengan sidebar: top-4 biar sudut atas rata
    <header className={clsx("sticky top-4 z-20 transition-colors", containerClassName)}>
      <div
        className={clsx(
          // default: penuh di area konten (tanpa gutter kiri/kanan)
          "mx-0",
          // tinggi default, bisa dioverride via barClassName
          "flex h-15 items-center justify-between",
          "rounded-2xl bg-white/80 backdrop-blur ring-1 ring-black/5 shadow-lg",
          // padding dalam nyaman
          "px-6 sm:px-8",
          barClassName
        )}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleSidebarToggle}
            aria-label="Toggle sidebar"
            className="-ml-2 inline-flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-semibold tracking-tight text-gray-800 sm:text-base">
            {computedTitle}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleBellClick}
            aria-label="Notifications"
            aria-expanded={isOpen}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 hover:bg-black/5"
          >
            <Bell className="h-5 w-5" />
            {hasNotifications && (
              <span className="absolute right-1.5 top-1.5 inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            )}
          </button>

          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-xs font-semibold text-gray-800">{userDisplayName}</span>
            <span className="text-[11px] uppercase tracking-wide text-gray-500">
              {primaryRole}
            </span>
          </div>

          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white text-sm font-semibold shadow hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/40"
              aria-haspopup="menu"
              aria-expanded={isProfileMenuOpen}
              aria-label="Profile menu"
            >
              {userInitial}
            </button>
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-gray-100 bg-white p-1 text-sm shadow-xl ring-1 ring-black/5">
                <Link
                  href="/settings"
                  onClick={closeProfileMenu}
                  className="block w-full rounded-xl px-3 py-2 text-left font-medium text-gray-700 hover:bg-gray-50"
                >
                  Pengaturan
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-30 flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              role="presentation"
              className="flex-1 bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeDrawer}
            />
            <motion.aside
              className="flex h-full w-full max-w-xs flex-col bg-white shadow-2xl ring-1 ring-black/10 sm:max-w-sm"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeDrawer}
                    aria-label="Close notifications"
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-gray-600 transition hover:bg-gray-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-semibold text-gray-900">Notifications</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    refetch().catch(() => { });
                  }}
                  className="text-xs font-medium text-purple-600 hover:text-purple-700"
                >
                  Refresh
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {initialLoading && !errorMessage && <p className="text-sm text-gray-500">Loading notifications...</p>}
                {!initialLoading && errorMessage && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    <p>{errorMessage}</p>
                    <button
                      type="button"
                      onClick={() => {
                        refetch().catch(() => { });
                      }}
                      className="mt-2 inline-flex items-center text-xs font-medium text-purple-600 hover:text-purple-700"
                    >
                      Try again
                    </button>
                  </div>
                )}
                {showEmptyState && <p className="text-sm text-gray-500">All stocks look good for now.</p>}
                {showList && (
                  <ul className="space-y-3">
                    {notifications.map((item) => {
                      const formattedTimestamp = formatTimestamp(item.notifiedAt);
                      return (
                        <li
                          key={item.notificationId ?? `${item.productId}-${item.status}`}
                          className="rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-sm"
                        >
                          <p className="text-sm font-medium text-gray-900">{item.stockName}</p>
                          <p className="mt-1 text-xs text-gray-600">{item.message}</p>
                          {formattedTimestamp && (
                            <p className="mt-2 text-[11px] font-medium text-gray-400">{formattedTimestamp}</p>
                          )}
                          <div className="mt-3 flex items-center justify-between">
                            <span
                              className={clsx(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                                item.status === "out" && "bg-red-100 text-red-700",
                                item.status === "critical" && "bg-orange-100 text-orange-600",
                                item.status === "warning" && "bg-yellow-100 text-yellow-600",
                              )}
                            >
                              {item.status === "out"
                                ? "Out of stock"
                                : item.status === "critical"
                                  ? "Critical"
                                  : "Low stock"}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                closeDrawer();
                                void openNotificationDetail(item.productId);
                              }}
                              className="rounded-lg bg-purple-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-purple-700"
                            >
                              Lihat detail
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        open={detailModalOpen}
        onClose={closeNotificationDetail}
        title={detailProduct?.stockName ?? "Detail stok"}
        description="Periksa informasi stok yang terakhir diperbarui"
        footer={
          <button
            type="button"
            onClick={closeNotificationDetail}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Tutup
          </button>
        }
      >
        {detailLoading && <p className="text-sm text-gray-500">Memuat detail stok...</p>}
        {!detailLoading && detailError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {detailError}
          </div>
        )}
        {!detailLoading && !detailError && detailProduct && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Category
              </p>
              <p className="mt-1 text-sm text-gray-900">{detailProduct.category ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Unit
              </p>
              <p className="mt-1 text-sm text-gray-900">{formatUnit(detailProduct.unit)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Quantity
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {detailProduct.quantity} {formatUnit(detailProduct.unit)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Price
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {formatDetailPrice(detailProduct.priceValue)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Low Stock Threshold
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {detailProduct.lowStock ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Supplier
              </p>
              <p className="mt-1 text-sm text-gray-900">{detailProduct.supplier ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Created at
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {formatDetailDate(detailProduct.createdAt)} • {formatDetailTime(detailProduct.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Updated at
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {formatDetailDate(detailProduct.updatedAt)} • {formatDetailTime(detailProduct.updatedAt)}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </header>
  );
}
