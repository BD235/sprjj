import { Search } from "lucide-react";
import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  wrapperClassName?: string;
};

export function SearchInput({ wrapperClassName, className, type = "search", ...props }: SearchInputProps) {
  return (
    <div className={clsx("relative w-full", wrapperClassName)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type={type}
        className={clsx(
          "w-full rounded-full border border-gray-200 bg-gray-50/80 px-4 py-2.5 pl-10 text-sm text-gray-700 shadow-inner transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder:text-gray-400",
          className,
        )}
        {...props}
      />
    </div>
  );
}
