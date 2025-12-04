"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Moon, Sun, Check } from "lucide-react";
import { useTheme } from "next-themes";
import clsx from "clsx";

type ThemeOption = {
  label: string;
  value: "light" | "dark" | "system";
  description: string;
};

const THEME_OPTIONS: ThemeOption[] = [
  { label: "Light", value: "light", description: "Use light appearance" },
  { label: "Dark", value: "dark", description: "Reduce glare at night" },
  { label: "System", value: "system", description: "Follow device setting" },
];

export function ModeToggle() {
  const { setTheme, resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  const activeValue = useMemo(() => {
    if (!mounted) return null;
    if (theme === "system") return "system";
    return resolvedTheme ?? theme ?? null;
  }, [mounted, resolvedTheme, theme]);

  const isDarkMode = mounted ? resolvedTheme === "dark" : false;

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Toggle color mode"
        className={clsx(
          "relative inline-flex h-9 w-9 items-center justify-center rounded-xl shadow-sm transition focus-visible:outline-none focus-visible:ring-2",
          isDarkMode
            ? "bg-[#1E293B] text-[#F1F5F9] hover:bg-[#25344c]"
            : "bg-white/70 text-gray-600 hover:bg-white",
          isOpen
            ? isDarkMode
              ? "ring-[#38BDF8]/60 shadow-[0_0_0_1px_rgba(56,189,248,0.35)]"
              : "ring-indigo-100 shadow-indigo-200"
            : isDarkMode
              ? "focus-visible:ring-[#38BDF8]/40"
              : "focus-visible:ring-indigo-500/40",
        )}
      >
        <Sun
          className={clsx(
            "h-[1.1rem] w-[1.1rem] transition-all duration-300",
            isDarkMode ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
          )}
        />
        <Moon
          className={clsx(
            "absolute h-[1.1rem] w-[1.1rem] transition-all duration-300",
            isDarkMode ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0",
          )}
        />
        <span className="sr-only">Toggle theme</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-30 mt-2 w-56 rounded-2xl border border-gray-200/70 bg-white p-2 text-sm text-gray-800 shadow-2xl ring-1 ring-black/5 backdrop-blur dark:border-[#38BDF8]/20 dark:bg-[#1E293B] dark:text-[#F1F5F9] dark:shadow-black/70">
          <p className="p-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-[#94A3B8]">
            Choose mode
          </p>
          <div className="mt-1 space-y-1">
            {THEME_OPTIONS.map((option) => {
              const isActive = option.value === activeValue;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setTheme(option.value);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition",
                    isActive
                      ? "bg-gray-900/10 text-gray-900 shadow-sm dark:bg-[#0F172A] dark:text-[#F1F5F9]"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-[#94A3B8] dark:hover:bg-[#25344d] dark:hover:text-white",
                )}
              >
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">{option.label}</span>
                  <span className="text-[11px] text-gray-500 dark:text-[#94A3B8]">{option.description}</span>
                </span>
                  {isActive && <Check className="h-4 w-4 text-gray-900 dark:text-[#38BDF8]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
