// components/sidebar.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { BarChart3, ChevronDown, FilePen, LogOut, Package, Settings, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { sidebarEvents } from "@/lib/sidebar-events";

type SidebarProps = {
  currentPath?: string;
  isOwner: boolean; // ← WAJIB dari server
};

export default function Sidebar({ currentPath, isOwner }: SidebarProps) {
  const pathname = usePathname();
  const resolvedPath = currentPath ?? pathname ?? "/";
  const transactionsActive = useMemo(
    () => resolvedPath === "/transactions" || resolvedPath.startsWith("/transactions/"),
    [resolvedPath],
  );
  const STORAGE_KEY = "sidebar:transactions-open";
  const [transactionsOpen, setTransactionsOpen] = useState(transactionsActive);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setTransactionsOpen(stored === "true");
    }
    setPreferencesLoaded(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !preferencesLoaded) return;
    window.localStorage.setItem(STORAGE_KEY, transactionsOpen ? "true" : "false");
  }, [preferencesLoaded, transactionsOpen]);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const canManagePurchases = isOwner;
  const canAccessSales = true;
  const showTransactions = canManagePurchases || canAccessSales;
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleToggle = () => setIsMobileOpen((prev) => !prev);
    const handleOpen = () => setIsMobileOpen(true);
    const handleClose = () => setIsMobileOpen(false);

    window.addEventListener(sidebarEvents.toggle, handleToggle);
    window.addEventListener(sidebarEvents.open, handleOpen);
    window.addEventListener(sidebarEvents.close, handleClose);

    return () => {
      window.removeEventListener(sidebarEvents.toggle, handleToggle);
      window.removeEventListener(sidebarEvents.open, handleOpen);
      window.removeEventListener(sidebarEvents.close, handleClose);
    };
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [resolvedPath]);

  useEffect(() => {
    if (!isMobileOpen) return undefined;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isMobileOpen]);

  const closeMobileSidebar = () => setIsMobileOpen(false);

  const navigation = [
    { key: "dashboard", name: "Dashboard", href: "/dashboard", icon: BarChart3, show: true },
    { key: "inventory", name: "Inventory", href: "/inventory", icon: Package, show: true },
    { key: "supplier", name: "Supplier", href: "/supplier", icon: Users, show: isOwner },
    { key: "settings", name: "Settings", href: "/settings", icon: Settings, show: true },
  ] as const;

  const handleLogout = () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    signOut({ callbackUrl: "/sign-in" }).catch(() => setIsSigningOut(false));
  };

  const renderContent = () => (
    <div className="relative flex h-full w-full flex-col rounded-2xl bg-white/80 p-6 text-gray-900 shadow-xl ring-1 ring-black/5 backdrop-blur transition-colors dark:bg-[#1E293B] dark:text-[#F1F5F9] dark:ring-[#38BDF8]/20 dark:shadow-black/60">
      <button
        type="button"
        onClick={closeMobileSidebar}
        aria-label="Close sidebar"
        className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-gray-600 shadow-sm transition hover:bg-black/10 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20 lg:hidden"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="mb-10 flex flex-col items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-2 ring-white dark:bg-white/10 dark:ring-white/20">
          <Image
            src="/logo.svg"
            alt="Jambar Jabu"
            width={80}
            height={80}
            className="h-full w-full object-cover"
            priority
          />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold tracking-tight text-gray-900 dark:text-white">Jambar Jabu</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Inventory Management</p>
        </div>
      </div>

      <nav className="flex-1">
        <p className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Navigation</p>

        <div className="space-y-1.5">
          {navigation
            .filter((item) => item.key !== "settings" && item.show)
            .map((item) => {
              const Icon = item.icon;
              const active = resolvedPath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={closeMobileSidebar}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-gray-900/10 font-semibold text-gray-900 dark:bg-white/10 dark:text-white"
                      : "text-gray-600 hover:bg-gray-900/5 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

          {showTransactions && (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() =>
                  setTransactionsOpen((prev) => {
                    const next = !prev;
                    if (typeof window !== "undefined") {
                      window.localStorage.setItem(STORAGE_KEY, next ? "true" : "false");
                    }
                    return next;
                  })
                }
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm  transition-colors ${
                  transactionsActive
                    ? "bg-gray-900/10 text-gray-900 dark:bg-white/10 dark:text-white"
                    : "text-gray-600 hover:bg-gray-900/5 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <FilePen className="h-5 w-5 flex-shrink-0" />
                  Transactions
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${transactionsOpen ? "rotate-180" : ""}`}
                />
              </button>

              {transactionsOpen && (
                <div className="ml-10 space-y-1">
                  {[
                    ...(canManagePurchases ? [{ label: "Pembelian", href: "/transactions" }] : []),
                    ...(canAccessSales ? [{ label: "Penjualan", href: "/transactions/sales" }] : []),
                  ].map((item) => {
                    const active = resolvedPath === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMobileSidebar}
                        className={`block rounded-lg px-3 py-2 text-sm ${
                          active
                            ? "font-semibold text-gray-900 dark:text-white"
                            : "text-gray-600 hover:bg-gray-900/5 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {(() => {
            const settingsItem = navigation.find(
              (item) => item.key === "settings" && item.show,
            );
            if (!settingsItem) return null;
            const active = resolvedPath === settingsItem.href;
            const Icon = settingsItem.icon;
            return (
              <Link
                href={settingsItem.href}
                aria-current={active ? "page" : undefined}
                onClick={closeMobileSidebar}
                className={`group mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-gray-900/10 font-semibold text-gray-900 dark:bg-white/10 dark:text-white"
                    : "text-gray-600 hover:bg-gray-900/5 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{settingsItem.name}</span>
              </Link>
            );
          })()}
        </div>
      </nav>

      <div className="mt-6">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isSigningOut}
          aria-label="Keluar"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-600 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:text-[#CBD5F5] dark:hover:bg-red-500/20 dark:hover:text-white dark:focus-visible:ring-red-500/40"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed left-4 top-4 bottom-4 z-20 hidden w-[12.5rem] lg:flex">
        {renderContent()}
      </aside>

      <div className="lg:hidden">
        <div
          aria-hidden="true"
          className={clsx(
            "fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity",
            isMobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
          )}
          onClick={closeMobileSidebar}
        />
        <aside
          className={clsx(
            "fixed inset-y-0 left-0 z-40 w-72 max-w-[90vw] px-4 py-4 transition-transform duration-300",
            "sm:w-80",
            isMobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {renderContent()}
        </aside>
      </div>
    </>
  );
}
