"use client";

import clsx from "clsx";
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
  variant?: "primary" | "menu";
  beforeLogout?: () => void;
  onDialogOpen?: () => void;
};

const variantClassNames: Record<NonNullable<LogoutButtonProps["variant"]>, string> = {
  primary:
    "inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-70",
  menu:
    "block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60",
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

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className={clsx(variantClassNames[variant], className)}
          disabled={isLoading}
        >
          {isLoading ? "Logging out..." : "Logout"}
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Keluar dari aplikasi?</AlertDialogTitle>
          <AlertDialogDescription>Anda akan keluar dari sistem POS.</AlertDialogDescription>
        </AlertDialogHeader>
        <p className="text-sm text-gray-600">
          Pastikan semua data sudah disimpan sebelum keluar dari aplikasi.
        </p>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Batalkan
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="primary"
              size="sm"
              onClick={handleLogout}
              isLoading={isLoading}
              loadingText="Keluar..."
            >
              Logout
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
