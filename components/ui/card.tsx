"use client";

import * as React from "react";
import clsx from "clsx";

const baseCardClass = "rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-lg";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Card(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={clsx(baseCardClass, className)} {...props} />;
});

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function CardHeader(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={clsx("flex flex-col gap-1.5 p-6", className)} {...props} />;
});

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(function CardTitle(
  { className, ...props },
  ref,
) {
  return <h3 ref={ref} className={clsx("text-lg font-semibold leading-tight", className)} {...props} />;
});

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  function CardDescription({ className, ...props }, ref) {
    return <p ref={ref} className={clsx("text-sm text-slate-500", className)} {...props} />;
  },
);

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function CardContent(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={clsx("px-6 pb-6", className)} {...props} />;
});

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function CardFooter(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={clsx("px-6 pb-6 pt-0", className)} {...props} />;
});

const CardAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function CardAction(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={clsx("ml-auto flex items-center gap-2", className)} {...props} />;
});

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
