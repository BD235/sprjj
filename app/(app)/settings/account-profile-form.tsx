"use client";

import clsx from "clsx";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { updateProfileAction } from "@/lib/actions/account-settings";
import { initialAccountActionState } from "@/lib/actions/account-settings-shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AccountProfileFormProps {
  initialUsername: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AccountProfileForm({
  initialUsername,
  onSuccess,
  onCancel,
}: AccountProfileFormProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [username, setUsername] = useState(initialUsername);
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialAccountActionState,
  );

  useEffect(() => {
    setUsername(initialUsername);
  }, [initialUsername]);

  useEffect(() => {
    if (state.status === "success") {
      const nextName = username.trim();
      if (nextName && typeof updateSession === "function") {
        updateSession({ name: nextName }).catch(() => {});
      }
      router.refresh();
      onSuccess?.();
    }
  }, [state.status, router, onSuccess, updateSession, username]);

  return (
    <form className="space-y-4 text-sm" action={formAction}>
      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-semibold text-gray-900">
          Nama Lengkap / Username
        </label>
        <Input
          id="username"
          name="username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.currentTarget.value)}
          placeholder="John Doe"
          autoComplete="name"
          minLength={3}
          required
          error={state.fieldErrors.username}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
            onClick={onCancel}
            disabled={isPending}
          >
            Batalkan
          </Button>
        )}
        <Button
          type="submit"
          className="w-full sm:w-auto"
          size="sm"
          isLoading={isPending}
          loadingText="Menyimpan..."
          disabled={isPending || username.trim().length < 3}
        >
          Simpan perubahan
        </Button>
      </div>

      <div aria-live="polite">
        {state.message && (
          <p
            className={clsx(
              "rounded-xl border px-4 py-2 text-sm font-medium",
              state.status === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700",
            )}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
