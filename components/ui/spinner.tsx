import { SVGAttributes } from "react";
import clsx from "clsx";

export type SpinnerProps = SVGAttributes<SVGSVGElement> & {
  srText?: string;
};

export function Spinner({ className, srText = "Loading...", ...props }: SpinnerProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="status"
      aria-label={srText}
      aria-live="polite"
      className={clsx("size-4 animate-spin text-current", className)}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
