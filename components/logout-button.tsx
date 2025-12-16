"use client";

import clsx from "clsx";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type LogoutButtonProps = {
  className?: string;
  variant?: "primary" | "menu" | "sidebar";
  beforeLogout?: () => void;
  onDialogOpen?: () => void;
};

const variantClassNames: Record<NonNullable<LogoutButtonProps["variant"]>, string> = {
  primary:
    "inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-70",
  menu:
    "block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60",
  sidebar:
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60",
};

export default function LogoutButton({
  className,
  variant = "primary",
  beforeLogout,
  onDialogOpen,
}: LogoutButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    if (isLoading) return;
    setIsLoading(true);
    beforeLogout?.();
    signOut({ callbackUrl: "/sign-in" }).catch(() => {
      setIsLoading(false);
      setIsDialogOpen(false);
    });
  };

  const handleCancel = () => {
    if (isLoading) return;
    setIsDialogOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (isLoading) return;
    setIsDialogOpen(open);
    if (open) {
      onDialogOpen?.();
    }
  };

  const showIcon = variant === "sidebar";
  const buttonLabel = isLoading ? "Logging out..." : "Logout";

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className={clsx(variantClassNames[variant], className)}
          disabled={isLoading}
        >
          {showIcon && <LogOut className="h-5 w-5" />}
          <span>{buttonLabel}</span>
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-xs sm:max-w-sm">
        <AlertDialogHeader className="text-center">
          <AlertDialogTitle className="text-center text-lg font-semibold text-gray-900">
            Keluar dari aplikasi?
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 !justify-center sm:!justify-center">
          <AlertDialogCancel asChild>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Batalkan
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="danger"
              size="sm"
              onClick={handleLogout}
              isLoading={isLoading}
              loadingText="Keluar..."
              className="w-full sm:w-auto"
            >
              Logout
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

