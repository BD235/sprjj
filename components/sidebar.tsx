// components/sidebar.tsx
"use client";

import { useEffect, useState } from "react";
import { BarChart3, ChevronDown, FilePen, LogOut, Package, Settings, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { sidebarEvents } from "@/lib/sidebar-events";

type SidebarProps = {
  currentPath?: string;
  isOwner: boolean;
};

export default function Sidebar({ currentPath, isOwner }: SidebarProps) {
  const pathname = usePathname();
  const path = currentPath ?? pathname ?? "";
  const isPathActive = (href: string) => path === href || path.startsWith(`${href}/`);
  const [transactionsOpen, setTransactionsOpen] = useState(isPathActive("/transactions"));
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const canManagePurchases = isOwner;
  const canAccessSales = true;
  const showTransactions = canManagePurchases || canAccessSales;

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

  // Only auto-open when entering transactions page, don't auto-close when leaving
  useEffect(() => {
    if (isPathActive("/transactions")) {
      setTransactionsOpen(true);
    }
  }, [path]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [path]);

  // Listen to sidebar events from topbar hamburger button
  useEffect(() => {
    const handleToggle = () => setIsMobileMenuOpen((prev) => !prev);
    const handleOpen = () => setIsMobileMenuOpen(true);
    const handleClose = () => setIsMobileMenuOpen(false);

    window.addEventListener(sidebarEvents.toggle, handleToggle);
    window.addEventListener(sidebarEvents.open, handleOpen);
    window.addEventListener(sidebarEvents.close, handleClose);

    return () => {
      window.removeEventListener(sidebarEvents.toggle, handleToggle);
      window.removeEventListener(sidebarEvents.open, handleOpen);
      window.removeEventListener(sidebarEvents.close, handleClose);
    };
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const sidebarContent = (
    <>
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
          <p className="text-base font-semibold tracking-tight text-gray-900">Jambar Jabu</p>
          <p className="text-xs font-semibold text-gray-700">Inventory Management</p>
        </div>
      </div>

      <nav className="flex-1">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-700">Navigation</p>

        <div className="space-y-1.5">
          {navigation
            .filter((item) => item.key !== "settings" && item.show)
            .map((item) => {
              const Icon = item.icon;
              const active = isPathActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active
                    ? "bg-gray-100 text-gray-900 ring-1 ring-gray-200"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:ring-1 hover:ring-gray-200"
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
                onClick={() => setTransactionsOpen((prev) => !prev)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${isPathActive("/transactions")
                  ? "bg-gray-100 text-gray-900 ring-1 ring-gray-200"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:ring-1 hover:ring-gray-200"
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
                    ...(canManagePurchases ? [{ label: "Pembelian", href: "/transactions", exact: true }] : []),
                    ...(canAccessSales ? [{ label: "Penjualan", href: "/transactions/sales", exact: false }] : []),
                  ].map((item) => {
                    const active = item.exact
                      ? path === item.href
                      : path === item.href || path.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${active
                          ? "bg-gray-100 text-gray-900 ring-1 ring-gray-200"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:ring-1 hover:ring-gray-200"
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
            const active = isPathActive(settingsItem.href);
            const Icon = settingsItem.icon;
            return (
              <Link
                href={settingsItem.href}
                aria-current={active ? "page" : undefined}
                className={`group mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active
                  ? "bg-gray-100 text-gray-900 ring-1 ring-gray-200"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:ring-1 hover:ring-gray-200"
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
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-red-50 hover:text-red-800 hover:ring-1 hover:ring-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`fixed left-4 top-4 bottom-4 z-50 flex w-[16rem] flex-col rounded-2xl bg-white p-6 text-gray-900 shadow-2xl ring-1 ring-black/5 transition-transform duration-300 lg:hidden`}
        style={{
          transform: isMobileMenuOpen ? "translateX(0)" : "translateX(calc(-100% - 2rem))"
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="fixed left-4 top-4 bottom-4 z-10 hidden w-[12.5rem] flex-col rounded-2xl bg-white p-6 text-gray-900 shadow-xl ring-1 ring-black/5 lg:flex">
        {sidebarContent}
      </aside>
    </>
  );
}
