"use client";

import { forwardRef } from "react";
import clsx from "clsx";

import { Spinner } from "./spinner";

const variantClasses = {
  primary:
    "bg-[#2563eb] text-white shadow hover:bg-[#1d4fd8] focus-visible:ring-[#2563eb]/40",
  secondary:
    "bg-white text-gray-900 ring-1 ring-gray-300 shadow-sm hover:bg-gray-50 focus-visible:ring-gray-400/60",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-300/60",
};

const sizeClasses = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = keyof typeof sizeClasses;

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  showLoadingText?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    isLoading = false,
    loadingText,
    children,
    disabled,
    type = "button",
    showLoadingText = true,
    ...props
  },
  ref,
) {
  const loadingLabel = loadingText ?? "Please wait...";

  return (
    <button
      ref={ref}
      type={type}
      className={clsx(
        "inline-flex items-center justify-center rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span
          className={clsx(
            "inline-flex items-center",
            showLoadingText && "gap-2",
          )}
        >
          <Spinner aria-hidden="true" className="size-4" />
          <span className={clsx(!showLoadingText && "sr-only")}>{loadingLabel}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
});
