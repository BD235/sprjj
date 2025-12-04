"use client";

import { useMemo, useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { createSupplier, deleteSupplier, updateSupplier } from "@/lib/actions/suppliers";
import { CardFade } from "@/components/motion/card-fade";

interface SupplierItem {
  id: string;
  name: string;
  whatsappNumber: string | null;
  address: string | null;
  category: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface SupplierClientProps {
  items: SupplierItem[];
  pageSize?: number;
  canDelete?: boolean;
}

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
] as const;

const statusClasses: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-200 text-gray-600",
};

function formatStatus(status: string) {
  const lower = status.toLowerCase();
  return lower.replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatWhatsApp(number: string | null) {
  if (!number) return "-";
  return number.trim();
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

function getWhatsappLink(number: string | null) {
  if (!number) return null;
  const digits = number.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

export default function SupplierClient({ items, pageSize = 8, canDelete = false }: SupplierClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemToDelete, setItemToDelete] = useState<SupplierItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [isCreating, startCreateTransition] = useTransition();
  const [detailItem, setDetailItem] = useState<SupplierItem | null>(null);
  const [itemToEdit, setItemToEdit] = useState<SupplierItem | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [isUpdating, startUpdateTransition] = useTransition();
  const detailWhatsappLink = detailItem ? getWhatsappLink(detailItem.whatsappNumber) : null;

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return items;

    return items.filter((item) => {
      const values = [
        item.name,
        item.whatsappNumber ?? "",
        item.address ?? "",
        item.category ?? "",
        item.status,
      ];
      return values.some((value) => value.toLowerCase().includes(term));
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

  const openDeleteModal = (item: SupplierItem) => {
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
        await deleteSupplier(formData);
        setItemToDelete(null);
        router.refresh();
      } catch (error) {
        setDeleteError(error instanceof Error ? error.message : "Failed to delete supplier");
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

  const handleAddSupplierSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append("redirectTo", "none");
    setAddError(null);

    startCreateTransition(async () => {
      try {
        await createSupplier(formData);
        form.reset();
        setIsAddDialogOpen(false);
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to add supplier";
        setAddError(message);
      }
    });
  };

  const openDetailModal = (item: SupplierItem) => {
    setDetailItem(item);
  };

  const closeDetailModal = () => {
    setDetailItem(null);
  };

  const openEditModal = (item: SupplierItem) => {
    setItemToEdit(item);
    setEditError(null);
  };

  const closeEditModal = () => {
    if (isUpdating) return;
    setItemToEdit(null);
    setEditError(null);
  };

  const handleEditSupplierSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!itemToEdit) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append("id", itemToEdit.id);
    formData.append("redirectTo", "none");
    setEditError(null);

    startUpdateTransition(async () => {
      try {
        await updateSupplier(formData);
        form.reset();
        setItemToEdit(null);
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update supplier";
        setEditError(message);
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
            placeholder="Search supplier..."
            className="flex-1 rounded-xl border border-gray-200/80 px-4 py-3 text-sm text-gray-700 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
          <button
            type="button"
            onClick={() => goToPage(1)}
            className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-purple-700"
          >
            Search
          </button>
          <button
            type="button"
            onClick={openAddDialog}
            className="rounded-xl bg-purple-100 px-6 py-3 text-sm font-semibold text-purple-700 shadow hover:bg-purple-200"
          >
            + Add supplier
          </button>
        </div>
      </CardFade>

      <CardFade className="overflow-hidden border border-gray-200 bg-white p-0 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm text-gray-700">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                {["Name", "WhatsApp", "Location", "Category Seller", "Status", "Actions"].map((heading) => (
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
                    <td className="px-6 py-4 text-gray-700">{formatWhatsApp(item.whatsappNumber)}</td>
                    <td className="px-6 py-4 text-gray-600">{item.address ?? "-"}</td>
                    <td className="px-6 py-4 text-gray-600">{item.category ?? "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                        {formatStatus(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="rounded-full p-2 text-gray-500 transition hover:bg-purple-100 hover:text-purple-700"
                          aria-label={`Edit ${item.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {canDelete && (
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
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                    No suppliers found.
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

      {canDelete && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-supplier-title"
            className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl"
          >
            <h2 id="delete-supplier-title" className="text-lg font-semibold text-gray-900">
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
          description="Detail supplier terbaru"
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
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">WhatsApp</p>
              <p className="mt-1 text-sm text-gray-900">{formatWhatsApp(detailItem.whatsappNumber)}</p>
              {detailWhatsappLink && (
                <a
                  href={detailWhatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white"
                >
                  Open WhatsApp
                </a>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Category</p>
              <p className="mt-1 text-sm text-gray-900">{detailItem.category ?? "-"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Location</p>
              <p className="mt-1 text-sm text-gray-900">{detailItem.address ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</p>
              <p className="mt-1 text-sm text-gray-900">{formatStatus(detailItem.status)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Created on</p>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(detailItem.createdAt)} • {formatTime(detailItem.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Updated on</p>
              <p className="mt-1 text-sm text-gray-900">
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
          title={`Edit ${itemToEdit.name}`}
          description="Perbarui informasi supplier dan simpan perubahan."
        >
          <form key={itemToEdit.id} className="space-y-5" onSubmit={handleEditSupplierSubmit}>
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">
                Supplier Name *
              </label>
              <input
                type="text"
                id="edit-name"
                name="name"
                required
                defaultValue={itemToEdit.name}
                disabled={isUpdating}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="edit-whatsappNumber" className="text-sm font-medium">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  id="edit-whatsappNumber"
                  name="whatsappNumber"
                  defaultValue={itemToEdit.whatsappNumber ?? ""}
                  disabled={isUpdating}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-category" className="text-sm font-medium">
                  Category Seller *
                </label>
                <input
                  type="text"
                  id="edit-category"
                  name="category"
                  required
                  defaultValue={itemToEdit.category ?? ""}
                  disabled={isUpdating}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-address" className="text-sm font-medium">
                Location
              </label>
              <textarea
                id="edit-address"
                name="address"
                rows={3}
                defaultValue={itemToEdit.address ?? ""}
                disabled={isUpdating}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
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

      <Modal
        open={isAddDialogOpen}
        onClose={closeAddDialog}
        title="Add new supplier"
        description="Lengkapi detail supplier untuk menambahkannya ke daftar."
      >
        <form className="space-y-5" onSubmit={handleAddSupplierSubmit}>
          <div className="space-y-2">
            <label htmlFor="add-name" className="text-sm font-medium">
              Supplier Name *
            </label>
            <input
              type="text"
              id="add-name"
              name="name"
              required
              placeholder="Enter supplier name"
              disabled={isCreating}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="add-whatsappNumber" className="text-sm font-medium">
                WhatsApp Number
              </label>
              <input
                type="tel"
                id="add-whatsappNumber"
                name="whatsappNumber"
                placeholder="e.g. 628123456789"
                disabled={isCreating}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="add-category" className="text-sm font-medium">
                Category Seller *
              </label>
              <input
                type="text"
                id="add-category"
                name="category"
                required
                placeholder="Enter category"
                disabled={isCreating}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="add-address" className="text-sm font-medium">
              Location
            </label>
            <textarea
              id="add-address"
              name="address"
              rows={3}
              placeholder="Enter supplier location"
              disabled={isCreating}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="add-status" className="text-sm font-medium">
              Status *
            </label>
            <select
              id="add-status"
              name="status"
              required
              defaultValue="ACTIVE"
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
    </div>
  );
}
