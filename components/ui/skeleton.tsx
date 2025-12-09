"use client";

import clsx from "clsx";
import { HTMLAttributes } from "react";

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={clsx("animate-pulse rounded-xl bg-slate-200/80", className)}
      {...props}
    />
  );
}
