"use client";

import type { ComponentProps } from "react";

type PriceInputProps = Omit<ComponentProps<"input">, "type" | "defaultValue"> & {
  id?: string;
  name?: string;
  min?: number;
  step?: number;
  placeholder?: string;
  className?: string;
  defaultValue?: number | string | null;
};

export default function PriceInput({
  id,
  name = "price",
  min = 0,
  step = 1,
  placeholder = "0",
  className = "",
  defaultValue = null,
  required,
  disabled,
  ...rest
}: PriceInputProps) {
  const wrapperClass = className?.trim() ?? "";
  const resolvedDefault =
    typeof defaultValue === "number" || typeof defaultValue === "string" ? defaultValue : undefined;

  return (
    <div className={wrapperClass.length > 0 ? wrapperClass : undefined}>
      <div className="flex items-stretch overflow-hidden rounded-xl border border-gray-200 bg-white shadow-inner focus-within:border-transparent focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-500/40">
        <span className="flex items-center border-r border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">Rp</span>
        <input
          type="number"
          id={id}
          name={name}
          min={min}
          step={step}
          placeholder={placeholder}
          defaultValue={resolvedDefault}
          required={required}
          disabled={disabled}
          inputMode="numeric"
          autoComplete="off"
          className="w-full border-0 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-0"
          {...rest}
        />
      </div>
    </div>
  );
}
