"use client";

import { forwardRef } from "react";
import clsx from "clsx";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, ...props },
  ref,
) {
  return (
    <div className="space-y-2">
      <input
        ref={ref}
        className={clsx(
          "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#38BDF8]/20 dark:bg-[#1E293B] dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-purple-300/60 dark:focus:ring-purple-500/20",
          error && "border-red-400 focus:border-red-500 focus:ring-red-100",
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
    </div>
  );
});
