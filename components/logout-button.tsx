"use client";

import clsx from "clsx";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

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

  useEffect(() => {
    if (!isDialogOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) {
        setIsDialogOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isDialogOpen, isLoading]);

  const openDialog = () => {
    if (isLoading) return;
    setIsDialogOpen(true);
    onDialogOpen?.();
  };

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

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className={clsx(variantClassNames[variant], className)}
        disabled={isLoading}
      >
        {isLoading ? "Logging out..." : "Logout"}
      </button>

      <Modal
        open={isDialogOpen}
        onClose={handleCancel}
        title="Keluar dari aplikasi?"
        description="Anda akan keluar dari sistem POS."
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Batalkan
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleLogout}
              isLoading={isLoading}
              loadingText="Keluar..."
            >
              Logout
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Pastikan semua data sudah disimpan sebelum keluar dari aplikasi.
        </p>
      </Modal>
    </>
  );
}
