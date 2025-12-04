"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadSalesCsv, type UploadSalesCsvState } from "@/lib/actions/sales";

const initialState: UploadSalesCsvState = { status: "idle" };

interface UploadSalesFormProps {
  onSuccess?: () => void;
}

export default function UploadSalesForm({ onSuccess }: UploadSalesFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [state, formAction, isPending] = useActionState(uploadSalesCsv, initialState);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onSuccess?.();
    }
  }, [state.status, router, onSuccess]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Upload CSV Penjualan</h2>
        <p className="mt-1 text-sm text-gray-600">
          Sistem akan mengurangi stok bahan berdasarkan resep menu yang terpakai.
        </p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-600">
        <p className="font-medium text-gray-700">Format singkat:</p>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li>Wajib ada kolom kode/nama menu dan quantity.</li>
          <li>Ekstensi .csv, maksimal 2MB.</li>
        </ul>
      </div>

      <form className="space-y-4" action={formAction}>
        <div className="space-y-2">
          <label htmlFor="file" className="text-sm font-medium text-gray-700">
            File CSV *
          </label>
          <input
            ref={fileInputRef}
            type="file"
            id="file"
            name="file"
            accept=".csv,text/csv"
            required
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="note" className="text-sm font-medium text-gray-700">
            Catatan umum
          </label>
          <textarea
            id="note"
            name="note"
            rows={3}
            placeholder="Misal: Penjualan weekend"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-400"
        >
          {isPending ? "Memproses..." : "Upload & proses"}
        </button>
        <div aria-live="polite" className="space-y-2">
          {state.status === "error" && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {state.message}
            </p>
          )}
          {state.status === "success" && (
            <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {state.message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
