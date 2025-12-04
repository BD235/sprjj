"use client";

import { useEffect, useRef, useState } from "react";

type Format = "currency" | "number" | "percent";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

function formatValue(value: number, format: Format) {
  if (format === "currency") {
    return currencyFormatter.format(Math.round(value));
  }
  if (format === "percent") {
    return `${Math.round(value)}%`;
  }
  return numberFormatter.format(Math.round(value));
}

export function DashboardMetricCounter({ value, format }: { value: number; format: Format }) {
  const [displayValue, setDisplayValue] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const duration = 2200;
    const startTimestamp = performance.now();

    const step = (now: number) => {
      const elapsed = Math.min((now - startTimestamp) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3); // easeOutCubic
      setDisplayValue(value * eased);
      if (elapsed < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value]);

  return <span>{formatValue(displayValue, format)}</span>;
}
