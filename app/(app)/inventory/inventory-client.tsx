"use client";

import { useMemo, useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createProduct, deleteProduct, updateProduct } from "@/lib/actions/products";
import PriceInput from "@/components/price-input";
import { Modal } from "@/components/ui/modal";
import { CardFade } from "@/components/motion/card-fade";

interface InventoryItem {
  id: string;
  stockName: string;
  category: string | null;
  price: number;
  priceValue: number;
  quantity: number;
  lowStock: number | null;
  supplier: string | null;
  supplierId: string | null;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

interface SupplierOption {
  id: string;
  name: string;
}

interface InventoryClientProps {
  items: InventoryItem[];
  pageSize?: number;
  canDelete?: boolean;
  suppliers: SupplierOption[];
}

const unitLabels: Record<string, string> = {
  GRAM: "gram",
  KG: "kg",
  ML: "ml",
  PCS: "pcs",
};

const unitDenominators: Record<string, string> = {
  GRAM: "1000 gram",
  KG: "1 kg",
  ML: "1000 ml",
  PCS: "1 pcs",
};

const CATEGORY_OPTIONS = [
  "Daging Segar & Ikan",
  "Sayuran",
  "Bumbu & Rempah",
  "Sembako & Bahan Kering",
  "Kemasan",
  "Operasional",
] as const;

const UNIT_OPTIONS = [
  { value: "GRAM", label: "Gram (g)" },
  { value: "KG", label: "Kilogram (kg)" },
  { value: "ML", label: "Mililiter (ml)" },
  { value: "PCS", label: "Pieces (pcs)" },
] as const;

function formatUnit(unit: string) {
  return unitLabels[unit as keyof typeof unitLabels] ?? unit.toLowerCase();
}

function formatUnitDenominator(unit: string) {
  return unitDenominators[unit as keyof typeof unitDenominators] ?? `1 ${unit.toLowerCase()}`;
}

function formatPrice(price: number) {
  if (Number.isNaN(price)) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(price)
    .replace(/\u00a0/g, " ");
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(date);
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export default function InventoryClient({
  items,
  pageSize = 8,
  canDelete = false,
  suppliers,
}: InventoryClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [isCreating, startCreateTransition] = useTransition();
  const [detailItem, setDetailItem] = useState<InventoryItem | null>(null);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [isUpdating, startUpdateTransition] = useTransition();

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return items;

    return items.filter((item) => {
      const priceString = `${formatPrice(item.price)} / ${formatUnitDenominator(item.unit)}`;
      const quantityString = `${item.quantity ?? ""} ${formatUnit(item.unit)}`;
      const lowStockString =
        item.lowStock === null || item.lowStock === undefined
          ? ""
          : `${item.lowStock} ${formatUnit(item.unit)}`;
      const supplier = item.supplier ?? "";
      return [item.stockName, supplier, priceString, quantityString, lowStockString]
        .some((value) => value.toLowerCase().includes(term));
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

  const openDeleteModal = (item: InventoryItem) => {
    if (!canDelete) return;
    setItemToDelete(item);
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setItemToDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = () => {
    if (!canDelete || !itemToDelete) return;

    const formData = new FormData();
    formData.append("id", itemToDelete.id);
    setDeleteError(null);

    startDeleteTransition(async () => {
      try {
        await deleteProduct(formData);
        setItemToDelete(null);
        router.refresh();
      } catch (error) {
        setDeleteError(error instanceof Error ? error.message : "Failed to delete product");
      }
    });
  };

  const openAddDialog = () => {
    setIsAddDialogOpen(true);
    setAddError(null);
  };

  const closeAddDialog = () => {
    if (isCreating) return;
    setIsAddDialogOpen(false);
    setAddError(null);
  };

  const handleAddStockSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append("redirectTo", "none");
    setAddError(null);

    startCreateTransition(async () => {
      try {
        await createProduct(formData);
        form.reset();
        setIsAddDialogOpen(false);
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to add product";
        setAddError(message);
      }
    });
  };

  const openDetailModal = (item: InventoryItem) => {
    setDetailItem(item);
  };

  const closeDetailModal = () => {
    setDetailItem(null);
  };

  const openEditModal = (item: InventoryItem) => {
    setItemToEdit(item);
    setEditError(null);
  };

  const closeEditModal = () => {
    if (isUpdating) return;
    setItemToEdit(null);
    setEditError(null);
  };

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!itemToEdit) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append("id", itemToEdit.id);
    formData.append("redirectTo", "none");
    setEditError(null);

    startUpdateTransition(async () => {
      try {
        await updateProduct(formData);
        form.reset();
        setItemToEdit(null);
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update product";
        setEditError(message);
      }
    });
  };

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      <CardFade className="border border-gray-200 bg-white px-6 py-5 shadow-sm dark:border-[#38BDF8]/20 dark:bg-[#1E293B]">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search stock..."
            className="flex-1 rounded-xl border border-gray-200/80 bg-white px-4 py-3 text-sm text-gray-700 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40 dark:border-[#38BDF8]/20 dark:bg-[#1E293B] dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-purple-500/30"
          />
          <button
            type="button"
            onClick={() => goToPage(1)}
            className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-purple-700 dark:shadow-purple-900/40"
          >
            Search
          </button>
          <button
            type="button"
            onClick={openAddDialog}
            className="rounded-xl bg-purple-100 px-6 py-3 text-sm font-semibold text-purple-700 shadow hover:bg-purple-200 dark:bg-purple-500/20 dark:text-purple-100 dark:hover:bg-purple-500/30"
          >
            + Add stock
          </button>
        </div>
      </CardFade>

      <CardFade className="overflow-hidden border border-gray-200 bg-white p-0 shadow-sm dark:border-[#38BDF8]/20 dark:bg-[#1E293B]">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm text-gray-700 dark:text-gray-200">
            <thead className="bg-gray-200 text-gray-700 dark:bg-white/5 dark:text-gray-300">
              <tr>
                {["Stock Name", "Price", "Quantity", "Low Stock", "Supplier", "Actions"].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-left font-semibold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white dark:divide-white/5 dark:bg-[#1E293B]">
              {paginatedItems.map((item) => (
                <tr key={item.id} className="transition hover:bg-purple-50/40 dark:hover:bg-white/5">
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-100">{item.stockName}</td>
                  <td className="px-6 py-4 text-gray-800 dark:text-gray-100">
                    {formatPrice(item.price)}
                    <span className="ml-1 text-xs uppercase text-gray-500 dark:text-gray-400">
                      / {formatUnitDenominator(item.unit)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-800 dark:text-gray-100">
                    {item.quantity ?? "-"}
                    {item.quantity !== null && item.quantity !== undefined && (
                      <span className="ml-1 text-xs uppercase text-gray-500 dark:text-gray-400">
                        {formatUnit(item.unit)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-200">
                    {item.lowStock ?? "-"}
                    {item.lowStock !== null && item.lowStock !== undefined && (
                      <span className="ml-1 text-xs uppercase text-gray-500 dark:text-gray-400">
                        {formatUnit(item.unit)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-100">{item.supplier ?? "-"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="rounded-full p-2 text-gray-500 transition hover:bg-purple-100 hover:text-purple-700 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
                        aria-label={`Edit ${item.stockName}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {canDelete && (
                        <button
                          type="button"
                          className="rounded-full p-2 text-red-500 transition hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                          aria-label={`Delete ${item.stockName}`}
                          onClick={() => openDeleteModal(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openDetailModal(item)}
                        className="rounded-full p-2 text-gray-500 transition hover:bg-purple-100 hover:text-purple-700 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
                        aria-label={`View ${item.stockName}`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 dark:text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardFade>

      {canDelete && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-confirmation-title"
            className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-[#1E293B] dark:text-gray-100"
          >
            <h2 id="delete-confirmation-title" className="text-lg font-semibold text-gray-900 dark:text-white">
              Are you sure to delete?
            </h2>
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
                className="min-w-[6rem] rounded-lg bg-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 shadow hover:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/20"
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
          title={detailItem.stockName}
          description="Detail stok terbaru"
          footer={
            <button
              type="button"
              onClick={closeDetailModal}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/20 dark:text-gray-200 dark:hover:bg-white/10"
            >
              Close
            </button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Category
              </p>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{detailItem.category ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Unit
              </p>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatUnit(detailItem.unit)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Quantity
              </p>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {detailItem.quantity} {formatUnit(detailItem.unit)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Price
              </p>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatPrice(detailItem.priceValue)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Low stock
              </p>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {detailItem.lowStock ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Supplier
              </p>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{detailItem.supplier ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Added on
              </p>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {formatDate(detailItem.createdAt)} • {formatTime(detailItem.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Last updated
              </p>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {formatDate(detailItem.updatedAt)} • {formatTime(detailItem.updatedAt)}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {itemToEdit && (
        <Modal
          open={Boolean(itemToEdit)}
          onClose={closeEditModal}
          title={`Edit ${itemToEdit.stockName}`}
          description="Perbarui informasi stok dan simpan perubahan."
        >
          <form key={itemToEdit.id} className="space-y-5" onSubmit={handleEditSubmit}>
            <div className="space-y-2">
              <label htmlFor="edit-stockName" className="text-sm font-medium">
                Stock Name *
              </label>
              <input
                type="text"
                id="edit-stockName"
                name="stockName"
                required
                defaultValue={itemToEdit.stockName}
                disabled={isUpdating}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40 dark:border-[#38BDF8]/20 dark:bg-[#0F172A] dark:text-gray-100"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="edit-category" className="text-sm font-medium">
                  Category *
                </label>
                <select
                  id="edit-category"
                  name="category"
                  required
                  defaultValue={itemToEdit.category ?? ""}
                  disabled={isUpdating}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40 dark:border-[#38BDF8]/20 dark:bg-[#0F172A] dark:text-gray-100"
                >
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-unit" className="text-sm font-medium">
                  Unit *
                </label>
                <select
                  id="edit-unit"
                  name="unit"
                  required
                  defaultValue={itemToEdit.unit}
                  disabled={isUpdating}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40 dark:border-[#38BDF8]/20 dark:bg-[#0F172A] dark:text-gray-100"
                >
                  {UNIT_OPTIONS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
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
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40 dark:border-[#38BDF8]/20 dark:bg-[#0F172A] dark:text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-price" className="text-sm font-medium">
                  Price (Rp) *
                </label>
                <PriceInput
                  id="edit-price"
                  name="price"
                  min={0}
                  required
                  disabled={isUpdating}
                  defaultValue={itemToEdit.priceValue}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-lowStock" className="text-sm font-medium">
                Low stock threshold *
              </label>
              <input
                type="number"
                id="edit-lowStock"
                name="lowStock"
                min={0}
                required
                defaultValue={itemToEdit.lowStock ?? 0}
                disabled={isUpdating}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40 dark:border-[#38BDF8]/20 dark:bg-[#0F172A] dark:text-gray-100"
              />
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
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40 dark:border-[#38BDF8]/20 dark:bg-[#0F172A] dark:text-gray-100"
              >
                <option value="">No supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
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
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/20 dark:text-gray-200 dark:hover:bg-white/10"
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

      <Modal
        open={isAddDialogOpen}
        onClose={closeAddDialog}
        title="Add new stock"
        description="Lengkapi detail stok baru untuk menambahkannya ke daftar inventory."
      >
        <form className="space-y-5" onSubmit={handleAddStockSubmit}>
          <div className="space-y-2">
            <label htmlFor="stockName" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Stock Name *
            </label>
            <input
              type="text"
              id="stockName"
              name="stockName"
              required
              placeholder="Enter stock name"
              disabled={isCreating}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40 dark:border-[#38BDF8]/20 dark:bg-[#0F172A] dark:text-gray-100"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                defaultValue=""
                disabled={isCreating}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40 dark:border-[#38BDF8]/20 dark:bg-[#0F172A] dark:text-gray-100"
              >
                <option value="" disabled>
                  Select category
                </option>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="unit" className="text-sm font-medium">
                Unit *
              </label>
              <select
                id="unit"
                name="unit"
                required
                defaultValue="GRAM"
                disabled={isCreating}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40 dark:border-[#38BDF8]/20 dark:bg-[#0F172A] dark:text-gray-100"
              >
                {UNIT_OPTIONS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min={0}
                required
                placeholder="0"
                disabled={isCreating}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40 dark:border-[#38BDF8]/20 dark:bg-[#0F172A] dark:text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium">
                Price (Rp) *
              </label>
              <PriceInput id="price" name="price" min={0} required disabled={isCreating} className="w-full" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="lowStock" className="text-sm font-medium">
              Low stock threshold *
            </label>
            <input
              type="number"
              id="lowStock"
              name="lowStock"
              min={0}
              required
              placeholder="Minimal stok sebelum peringatan"
              disabled={isCreating}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40 dark:border-[#38BDF8]/20 dark:bg-[#0F172A] dark:text-gray-100"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="supplierId" className="text-sm font-medium">
              Supplier
            </label>
            <select
              id="supplierId"
              name="supplierId"
              defaultValue=""
              disabled={isCreating}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40 dark:border-[#38BDF8]/20 dark:bg-[#0F172A] dark:text-gray-100"
            >
              <option value="">No supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <input type="hidden" name="redirectTo" value="none" />
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
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/20 dark:text-gray-200 dark:hover:bg-white/10"
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
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#38BDF8]/20 dark:bg-[#1E293B] dark:text-gray-300 dark:hover:bg-white/10"
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
                    ? "bg-purple-600 text-white shadow dark:bg-purple-500"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 dark:border-[#38BDF8]/20 dark:bg-[#1E293B] dark:text-gray-300 dark:hover:bg-white/10"
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
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#38BDF8]/20 dark:bg-[#1E293B] dark:text-gray-300 dark:hover:bg-white/10"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
