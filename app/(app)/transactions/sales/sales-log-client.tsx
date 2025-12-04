"use client";

import { useMemo, useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import UploadSalesForm from "./upload-sales-form";
import { createManualStockOutEntry } from "@/lib/actions/sales";
import { CardFade } from "@/components/motion/card-fade";

type ProductEntry = {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
};

type LogItem = {
  id: string;
  transactionName: string;
  note: string;
  transactionDate: string;
  entries: ProductEntry[];
};

type Option = {
  id: string;
  label: string;
  helper?: string;
};

interface SalesLogClientProps {
  items: LogItem[];
  menuOptions: Option[];
  productOptions: Option[];
  pageSize?: number;
  canManage?: boolean;
}

function formatTableDate(value: string) {
  const date = Number.isNaN(Date.parse(value)) ? null : new Date(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatDatetimeLocal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function nowDatetimeLocal() {
  return formatDatetimeLocal(new Date().toISOString());
}

export default function SalesLogClient({
  items,
  menuOptions,
  productOptions,
  pageSize = 8,
  canManage = false,
}: SalesLogClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [detailItem, setDetailItem] = useState<LogItem | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [isCreatingManual, startManualTransition] = useTransition();
  const manualDefaultName = useMemo(() => `MANUAL-${new Date().toISOString().slice(0, 10)}`, []);
  const manualDefaultDate = useMemo(() => nowDatetimeLocal(), []);
  const hasProducts = productOptions.length > 0;

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => {
      const matchesNote = item.note.toLowerCase().includes(term);
      const matchesName = item.transactionName.toLowerCase().includes(term);
      const matchesEntry = item.entries.some((entry) => entry.productName.toLowerCase().includes(term));
      return matchesNote || matchesName || matchesEntry;
    });
  }, [items, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentIndex = (currentPage - 1) * pageSize;
  const paginatedItems = filteredItems.slice(currentIndex, currentIndex + pageSize);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const openManualModal = () => {
    if (!canManage) return;
    setIsManualModalOpen(true);
    setManualError(null);
  };

  const closeManualModal = () => {
    if (isCreatingManual) return;
    setIsManualModalOpen(false);
    setManualError(null);
  };

  const openCsvModal = () => {
    if (!canManage) return;
    setIsCsvModalOpen(true);
  };

  const closeCsvModal = () => {
    setIsCsvModalOpen(false);
  };

  const handleManualSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManage) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append("redirectTo", "none");
    setManualError(null);

    startManualTransition(async () => {
      try {
        await createManualStockOutEntry(formData);
        form.reset();
        setIsManualModalOpen(false);
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Gagal menambah log";
        setManualError(message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <CardFade className="border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Cari transaksi..."
            className="flex-1 rounded-xl border border-gray-200/80 px-4 py-3 text-sm text-gray-700 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
          <button
            type="button"
            onClick={() => goToPage(1)}
            className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-purple-700"
          >
            Search
          </button>
          {canManage && (
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={openCsvModal}
                className="rounded-xl border border-purple-200 bg-purple-50 px-6 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
              >
                CSV
              </button>
              <button
                type="button"
                onClick={openManualModal}
                disabled={!hasProducts}
                className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Manual
              </button>
            </div>
          )}
        </div>
      </CardFade>

      <CardFade className="overflow-hidden border border-gray-200 bg-white p-0 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm text-gray-700">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                {["Nama Transaksi", "Tanggal", "Catatan", "Aksi"].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-left font-semibold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {paginatedItems.map((item) => (
                <tr key={item.id} className="transition hover:bg-purple-50/40">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{item.transactionName}</div>
                    <div className="mt-1 text-xs text-gray-500">{item.entries.length} bahan</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{formatTableDate(item.transactionDate)}</td>
                  <td className="px-6 py-4 text-gray-600">{item.note || "-"}</td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => setDetailItem(item)}
                      className="rounded-full p-2 text-gray-500 transition hover:bg-purple-100 hover:text-purple-700"
                      aria-label={`Detail ${item.transactionName}`}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                    Tidak ada transaksi penjualan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardFade>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Prev
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => goToPage(page)}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  page === currentPage
                    ? "bg-purple-600 text-white shadow"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
          </button>
        </div>
      )}

      {detailItem && (
        <Modal
          open={Boolean(detailItem)}
          onClose={() => setDetailItem(null)}
          title={detailItem.transactionName}
          description="Bahan yang digunakan"
          footer={
            <button
              type="button"
              onClick={() => setDetailItem(null)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          }
        >
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 text-sm">
            {detailItem.entries.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between px-4 py-3">
                <p className="font-medium text-gray-900">{entry.productName}</p>
                <p className="text-gray-600">
                  {entry.quantity} <span className="uppercase text-gray-400">{entry.unit}</span>
                </p>
              </li>
            ))}
          </ul>
        </Modal>
      )}

      {canManage && (
        <Modal
          open={isManualModalOpen}
          onClose={closeManualModal}
          title="Input manual"
          description="Kurangi stok tanpa file CSV."
        >
          <form className="space-y-4" onSubmit={handleManualSubmit}>
            <div className="space-y-1">
              <label htmlFor="manual-transactionName" className="text-sm font-medium">
                Nama transaksi *
              </label>
              <input
                type="text"
                id="manual-transactionName"
                name="transactionName"
                required
                defaultValue={manualDefaultName}
                disabled={isCreatingManual}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="manual-menuId" className="text-sm font-medium">
                Menu (opsional)
              </label>
              <select
                id="manual-menuId"
                name="menuId"
                defaultValue=""
                disabled={isCreatingManual}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              >
                <option value="">Tanpa menu</option>
                {menuOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                    {option.helper ? ` (${option.helper})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="manual-productId" className="text-sm font-medium">
                Bahan *
              </label>
              <select
                id="manual-productId"
                name="productId"
                required
                defaultValue=""
                disabled={isCreatingManual || !hasProducts}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              >
                <option value="" disabled>
                  Pilih bahan
                </option>
                {productOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                    {option.helper ? ` (${option.helper})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="manual-quantity" className="text-sm font-medium">
                  Jumlah *
                </label>
                <input
                  type="number"
                  min={1}
                  id="manual-quantity"
                  name="quantity"
                  required
                  disabled={isCreatingManual}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="manual-transactionDate" className="text-sm font-medium">
                  Waktu *
                </label>
                <input
                  type="datetime-local"
                  id="manual-transactionDate"
                  name="transactionDate"
                  required
                  defaultValue={manualDefaultDate}
                  disabled={isCreatingManual}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="manual-note" className="text-sm font-medium">
                Catatan
              </label>
              <textarea
                id="manual-note"
                name="note"
                rows={3}
                placeholder="Misal: Koreksi stok manual"
                disabled={isCreatingManual}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>
            {manualError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
                {manualError}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeManualModal}
                disabled={isCreatingManual}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingManual || !hasProducts}
                className="rounded-xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreatingManual ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {canManage && (
        <Modal
          open={isCsvModalOpen}
          onClose={closeCsvModal}
          title="Upload CSV penjualan"
          description="Sistem akan mengurangi stok berdasarkan resep menu."
        >
          <UploadSalesForm
            onSuccess={() => {
              closeCsvModal();
              router.refresh();
            }}
          />
        </Modal>
      )}
    </div>
  );
}
