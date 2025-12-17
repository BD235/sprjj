"use client";

import clsx from "clsx";
import { useActionState, useEffect, useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updatePasswordAction } from "@/lib/actions/account-settings";
import { initialAccountActionState } from "@/lib/actions/account-settings-shared";

const emptyValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

type ChangePasswordFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function ChangePasswordForm({ onSuccess, onCancel }: ChangePasswordFormProps) {
  const [values, setValues] = useState(emptyValues);
  const [state, formAction, isPending] = useActionState(
    updatePasswordAction,
    initialAccountActionState,
  );

  useEffect(() => {
    if (state.status === "success") {
      setValues({ ...emptyValues });
      onSuccess?.();
    }
  }, [state.status, onSuccess]);

  const handleChange = (field: keyof typeof values) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form className="space-y-4 text-sm" action={formAction}>
      <div className="space-y-2">
        <label htmlFor="currentPassword" className="text-sm font-semibold text-gray-900">
          Password Saat Ini
        </label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          minLength={6}
          required
          value={values.currentPassword}
          onChange={handleChange("currentPassword")}
          error={state.fieldErrors.currentPassword}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="newPassword" className="text-sm font-semibold text-gray-900">
          Password Baru
        </label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          value={values.newPassword}
          onChange={handleChange("newPassword")}
          error={state.fieldErrors.newPassword}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-900">
          Konfirmasi Password Baru
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          value={values.confirmPassword}
          onChange={handleChange("confirmPassword")}
          error={state.fieldErrors.confirmPassword}
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
          loadingText="Memperbarui..."
          disabled={isPending}
        >
          Ubah password
        </Button>
      </div>

      <div aria-live="polite">
        {state.message && state.status === "success" && (
          <p
            className="rounded-xl border px-4 py-2 text-sm font-medium border-green-200 bg-green-50 text-green-700"
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
