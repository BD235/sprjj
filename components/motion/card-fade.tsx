"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import clsx from "clsx";
import type { PropsWithChildren } from "react";

type CardFadeProps = PropsWithChildren<
  HTMLMotionProps<"div"> & {
    delay?: number;
  }
>;

export function CardFade({ children, className, delay = 0, ...props }: CardFadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 20,
        delay,
      }}
      className={clsx(
        "rounded-2xl border border-gray-100 bg-white shadow-xl transition-colors dark:border-[#38BDF8]/20 dark:bg-[#1E293B] dark:shadow-black/40",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
