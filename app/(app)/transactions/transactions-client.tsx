"use client";

import { useMemo, useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import PriceInput from "@/components/price-input";
import { Modal } from "@/components/ui/modal";
import { createTransaction, deleteTransaction, updateTransaction } from "@/lib/actions/transactions";
import { CardFade } from "@/components/motion/card-fade";

interface TransactionItem {
  id: string;
  name: string;
  transactionDate: string;
  quantity: number;
  supplier: string | null;
  supplierId: string | null;
  totalPrice: number;
  paymentMethod: string;
  status: string;
  productId: string;
  productName: string;
}

interface OptionItem {
  id: string;
  name: string;
}

interface TransactionsClientProps {
  items: TransactionItem[];
  products: OptionItem[];
  suppliers: OptionItem[];
  pageSize?: number;
  canManage?: boolean;
}

const PAYMENT_METHOD_OPTIONS = [
  { value: "CASH", label: "Cash" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "OTHER", label: "Other" },
] as const;

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

const statusClasses: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
};

function formatCurrency(amount: number) {
  if (!Number.isFinite(amount)) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\u00a0/g, " ");
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatTableDate(isoDate: string) {
  const date = Number.isNaN(Date.parse(isoDate)) ? null : new Date(isoDate);
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDetailDate(isoDate: string) {
  const date = Number.isNaN(Date.parse(isoDate)) ? null : new Date(isoDate);
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "medium",
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

export default function TransactionsClient({
  items,
  products,
  suppliers,
  pageSize = 8,
  canManage = false,
}: TransactionsClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemToDelete, setItemToDelete] = useState<TransactionItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [isCreating, startCreateTransition] = useTransition();
  const [detailItem, setDetailItem] = useState<TransactionItem | null>(null);
  const [itemToEdit, setItemToEdit] = useState<TransactionItem | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [isUpdating, startUpdateTransition] = useTransition();
  const hasProducts = products.length > 0;
  const addDefaultDate = useMemo(() => formatDatetimeLocal(new Date().toISOString()), []);

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return items;

    return items.filter((item) => {
      const list = [
        item.name,
        item.supplier ?? "",
        item.paymentMethod,
        item.status,
        item.productName,
        String(item.quantity),
        formatCurrency(item.totalPrice),
        formatTableDate(item.transactionDate),
      ];
      return list.some((value) => value.toLowerCase().includes(term));
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

  const openDeleteModal = (item: TransactionItem) => {
    if (!canManage) return;
    setItemToDelete(item);
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setItemToDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = () => {
    if (!canManage || !itemToDelete) return;

    const formData = new FormData();
    formData.append("id", itemToDelete.id);
    setDeleteError(null);

    startDeleteTransition(async () => {
      try {
        await deleteTransaction(formData);
        setItemToDelete(null);
        router.refresh();
      } catch (error) {
        setDeleteError(error instanceof Error ? error.message : "Failed to delete transaction");
      }
    });
  };

  const openAddDialog = () => {
    if (!hasProducts) return;
    setIsAddDialogOpen(true);
    setAddError(null);
  };

  const closeAddDialog = () => {
    if (isCreating) return;
    setIsAddDialogOpen(false);
    setAddError(null);
  };

  const handleAddTransactionSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append("redirectTo", "none");
    setAddError(null);

    startCreateTransition(async () => {
      try {
        await createTransaction(formData);
        form.reset();
        setIsAddDialogOpen(false);
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to add transaction";
        setAddError(message);
      }
    });
  };

  const openDetailModal = (item: TransactionItem) => {
    setDetailItem(item);
  };

  const closeDetailModal = () => {
    setDetailItem(null);
  };

  const openEditModal = (item: TransactionItem) => {
    if (!canManage) return;
    setItemToEdit(item);
    setEditError(null);
  };

  const closeEditModal = () => {
    if (isUpdating) return;
    setItemToEdit(null);
    setEditError(null);
  };

  const handleEditTransactionSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!itemToEdit) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append("id", itemToEdit.id);
    formData.append("redirectTo", "none");
    setEditError(null);

    startUpdateTransition(async () => {
      try {
        await updateTransaction(formData);
        form.reset();
        setItemToEdit(null);
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update transaction";
        setEditError(message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <CardFade className="border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search transactions..."
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
              <button
                type="button"
                onClick={openAddDialog}
                disabled={!hasProducts}
                className="rounded-xl bg-purple-100 px-6 py-3 text-sm font-semibold text-purple-700 shadow hover:bg-purple-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                + Add transaction
              </button>
            )}
          </div>
          {canManage && !hasProducts && (
            <p className="text-xs font-medium text-yellow-700">
              You need at least one product before recording a transaction.
            </p>
          )}
        </div>
      </CardFade>

      <CardFade className="overflow-hidden border border-gray-200 bg-white p-0 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm text-gray-700">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                {[
                  "Transaction Name",
                  "Transaction Date",
                  "Quantity",
                  "Supplier",
                  "Total Price",
                  "Payment Method",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-left font-semibold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {paginatedItems.map((item) => {
                const badgeClass = statusClasses[item.status] ?? "bg-gray-200 text-gray-600";
                return (
                  <tr key={item.id} className="transition hover:bg-purple-50/40">
                    <td className="px-6 py-4 font-medium text-gray-800">{item.name}</td>
                    <td className="px-6 py-4 text-gray-600">{formatTableDate(item.transactionDate)}</td>
                    <td className="px-6 py-4 text-gray-800">{item.quantity}</td>
                    <td className="px-6 py-4 text-gray-700">{item.supplier ?? "-"}</td>
                    <td className="px-6 py-4 text-gray-800">{formatCurrency(item.totalPrice)}</td>
                    <td className="px-6 py-4 text-gray-700">{formatLabel(item.paymentMethod)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                        {formatLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="rounded-full p-2 text-gray-500 transition hover:bg-purple-100 hover:text-purple-700"
                            aria-label={`Edit ${item.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        {canManage && (
                          <button
                            type="button"
                            className="rounded-full p-2 text-red-500 transition hover:bg-red-100 hover:text-red-600"
                            aria-label={`Delete ${item.name}`}
                            onClick={() => openDeleteModal(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openDetailModal(item)}
                          className="rounded-full p-2 text-gray-500 transition hover:bg-purple-100 hover:text-purple-700"
                          aria-label={`View ${item.name}`}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-400">
                    No transactions found.
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
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
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

      {canManage && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-transaction-title"
            className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl"
          >
            <h2 id="delete-transaction-title" className="text-lg font-semibold text-gray-900">
              Delete this transaction?
            </h2>
            <p className="mt-1 text-sm text-gray-600">This action cannot be undone.</p>
            {deleteError && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {deleteError}
              </p>
            )}
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="min-w-[6rem] rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="min-w-[6rem] rounded-lg bg-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 shadow hover:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {detailItem && (
        <Modal
          open={Boolean(detailItem)}
          onClose={closeDetailModal}
          title={detailItem.name}
          description="Detail transaksi pembelian"
          footer={
            <button
              type="button"
              onClick={closeDetailModal}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Product</p>
              <p className="mt-1 text-sm text-gray-900">{detailItem.productName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Supplier</p>
              <p className="mt-1 text-sm text-gray-900">{detailItem.supplier ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Quantity</p>
              <p className="mt-1 text-sm text-gray-900">{detailItem.quantity}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Price</p>
              <p className="mt-1 text-sm text-gray-900">{formatCurrency(detailItem.totalPrice)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Payment Method</p>
              <p className="mt-1 text-sm text-gray-900">{formatLabel(detailItem.paymentMethod)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</p>
              <p className="mt-1 text-sm text-gray-900">{formatLabel(detailItem.status)}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Transaction Date</p>
              <p className="mt-1 text-sm text-gray-900">{formatDetailDate(detailItem.transactionDate)}</p>
            </div>
          </div>
        </Modal>
      )}

      {itemToEdit && (
        <Modal
          open={Boolean(itemToEdit)}
          onClose={closeEditModal}
          title={`Edit ${itemToEdit.name}`}
          description="Perbarui detail transaksi pembelian dan simpan perubahannya."
        >
          <form key={itemToEdit.id} className="space-y-5" onSubmit={handleEditTransactionSubmit}>
            <div className="space-y-2">
              <label htmlFor="edit-transactionName" className="text-sm font-medium">
                Transaction Name *
              </label>
              <input
                type="text"
                id="edit-transactionName"
                name="transactionName"
                required
                defaultValue={itemToEdit.name}
                disabled={isUpdating}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="edit-productId" className="text-sm font-medium">
                  Product *
                </label>
                <select
                  id="edit-productId"
                  name="productId"
                  required
                  defaultValue={itemToEdit.productId}
                  disabled={isUpdating}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-supplierId" className="text-sm font-medium">
                  Supplier
                </label>
                <select
                  id="edit-supplierId"
                  name="supplierId"
                  defaultValue={itemToEdit.supplierId ?? ""}
                  disabled={isUpdating}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                >
                  <option value="">No supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="edit-quantity" className="text-sm font-medium">
                  Quantity *
                </label>
                <input
                  type="number"
                  id="edit-quantity"
                  name="quantity"
                  min={0}
                  required
                  defaultValue={itemToEdit.quantity}
                  disabled={isUpdating}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-totalAmount" className="text-sm font-medium">
                  Total Price (Rp) *
                </label>
                <PriceInput
                  id="edit-totalAmount"
                  name="totalAmount"
                  min={0}
                  required
                  disabled={isUpdating}
                  defaultValue={itemToEdit.totalPrice}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="edit-transactionDate" className="text-sm font-medium">
                  Transaction Date *
                </label>
                <input
                  type="datetime-local"
                  id="edit-transactionDate"
                  name="transactionDate"
                  required
                  defaultValue={formatDatetimeLocal(itemToEdit.transactionDate)}
                  disabled={isUpdating}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-paymentMethod" className="text-sm font-medium">
                  Payment Method *
                </label>
                <select
                  id="edit-paymentMethod"
                  name="paymentMethod"
                  required
                  defaultValue={itemToEdit.paymentMethod}
                  disabled={isUpdating}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                >
                  {PAYMENT_METHOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-status" className="text-sm font-medium">
                Status *
              </label>
              <select
                id="edit-status"
                name="status"
                required
                defaultValue={itemToEdit.status}
                disabled={isUpdating}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {editError && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {editError}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEditModal}
                disabled={isUpdating}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="rounded-xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdating ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {canManage && (
        <Modal
          open={isAddDialogOpen}
          onClose={closeAddDialog}
          title="Add new transaction"
          description="Lengkapi detail transaksi pembelian untuk mencatat stok masuk."
        >
          <form className="space-y-5" onSubmit={handleAddTransactionSubmit}>
            <div className="space-y-2">
              <label htmlFor="add-transactionName" className="text-sm font-medium">
                Transaction Name *
              </label>
              <input
                type="text"
                id="add-transactionName"
                name="transactionName"
                required
                placeholder="Enter transaction name"
                disabled={isCreating}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="add-productId" className="text-sm font-medium">
                  Product *
                </label>
                <select
                  id="add-productId"
                  name="productId"
                  required
                  defaultValue=""
                  disabled={isCreating}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                >
                  <option value="" disabled>
                    Select product
                  </option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="add-supplierId" className="text-sm font-medium">
                  Supplier
                </label>
                <select
                  id="add-supplierId"
                  name="supplierId"
                  defaultValue=""
                  disabled={isCreating}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                >
                  <option value="">No supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="add-quantity" className="text-sm font-medium">
                  Quantity *
                </label>
                <input
                  type="number"
                  id="add-quantity"
                  name="quantity"
                  required
                  min={0}
                  placeholder="0"
                  disabled={isCreating}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="add-totalAmount" className="text-sm font-medium">
                  Total Price (Rp) *
                </label>
                <PriceInput
                  id="add-totalAmount"
                  name="totalAmount"
                  min={0}
                  required
                  disabled={isCreating}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="add-transactionDate" className="text-sm font-medium">
                  Transaction Date *
                </label>
                <input
                  type="datetime-local"
                  id="add-transactionDate"
                  name="transactionDate"
                  required
                  defaultValue={addDefaultDate}
                  disabled={isCreating}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="add-paymentMethod" className="text-sm font-medium">
                  Payment Method *
                </label>
                <select
                  id="add-paymentMethod"
                  name="paymentMethod"
                  required
                  defaultValue="CASH"
                  disabled={isCreating}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                >
                  {PAYMENT_METHOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="add-status" className="text-sm font-medium">
                Status *
              </label>
              <select
                id="add-status"
                name="status"
                required
                defaultValue="COMPLETED"
                disabled={isCreating}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {addError && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {addError}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeAddDialog}
                disabled={isCreating}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="rounded-xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
