// lib/actions/products.ts
"use server";

import { redirect } from "next/navigation";
import { Prisma, MeasurementUnit } from "@prisma/client";
import { ensureUserInDB, getCurrentUser } from "../auth";
import { requireAnyRole } from "../role-guard";
import { prisma } from "../prisma";
import { getClaimedRoles, getIsOwner } from "@/lib/role";
import { z } from "zod";

const ProductSchema = z.object({
  stockName: z.string().min(1, "Stock name is required"),
  category: z.string().min(1, "Category is required"),
  unit: z.nativeEnum(MeasurementUnit, {
    errorMap: () => ({ message: "Invalid unit value" }),
  }),
  price: z.coerce.number().int().nonnegative("Price must be non-negative"),
  quantity: z.coerce.number().int().min(0, "Quantity must be non-negative"),
  lowStock: z.coerce.number().int().min(0, "Low stock must be non-negative"),
  supplierId: z.string().trim().optional(),
});

const UpdateProductSchema = ProductSchema.extend({
  id: z.string().min(1, "Product id is required"),
});

function normalizeCurrency(value: number) {
  // Store currency as whole Rupiah without fractional noise
  return new Prisma.Decimal(value).toFixed(0);
}

function optionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function deleteProduct(formData: FormData) {
  // Hanya OWNER yang boleh hapus
  await requireAnyRole(["OWNER"]);
  const dbUserId = await ensureUserInDB();

  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Missing product id");

  const existingProduct = await prisma.product.findFirst({
    where: { id, userId: dbUserId },
    select: { id: true },
  });

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  await prisma.product.delete({ where: { id: existingProduct.id } });
}

export async function createProduct(formData: FormData) {
  // OWNER & PEGAWAI boleh tambah
  await requireAnyRole(["PEGAWAI", "OWNER"]);
  const user = await getCurrentUser();
  const dbUserId = await ensureUserInDB();
  const claimedRoles = getClaimedRoles(user);
  const userRecordId = user.claims?.userIdDb ?? user.id;
  const rawRedirectPreference = formData.get("redirectTo");
  const redirectPreference =
    typeof rawRedirectPreference === "string" && rawRedirectPreference.length > 0
      ? rawRedirectPreference
      : null;

  const parsed = ProductSchema.safeParse({
    stockName: formData.get("stockName"),
    category: formData.get("category"),
    unit: formData.get("unit"),
    price: formData.get("price"),
    quantity: formData.get("quantity"),
    lowStock: formData.get("lowStock"),
    supplierId: optionalString(formData.get("supplierId")),
  });
  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors;
    const firstMessage =
      Object.values(details)
        .flat()
        .find((msg): msg is string => Boolean(msg)) ?? "Validation failed";
    throw new Error(firstMessage);
  }

  let supplierName: string | null = null;
  let supplierId: string | null = null;
  if (parsed.data.supplierId) {
    const supplier = await prisma.supplier.findFirst({
      where: { id: parsed.data.supplierId, userId: dbUserId },
    });
    if (!supplier) {
      throw new Error("Selected supplier not found");
    }
    supplierName = supplier.name;
    supplierId = supplier.id;
  }

  await prisma.product.create({
    data: {
      userId: dbUserId,
      stockName: parsed.data.stockName,
      category: parsed.data.category,
      unit: parsed.data.unit,
      price: normalizeCurrency(parsed.data.price),
      quantity: parsed.data.quantity,
      lowStock: parsed.data.lowStock,
      supplier: supplierName,
      supplierId,
    },
  });

  // Redirect kondisional: OWNER → inventory (OWNER-only), PEGAWAI → dashboard (aman)
  const isOwner = await getIsOwner(user.id, user.email, claimedRoles, userRecordId);
  if (redirectPreference !== "none") {
    const destination = redirectPreference ?? (isOwner ? "/inventory" : "/dashboard");
    redirect(destination);
  }

}

export async function updateProduct(formData: FormData) {
  await requireAnyRole(["PEGAWAI", "OWNER"]);
  const user = await getCurrentUser();
  const dbUserId = await ensureUserInDB();
  const claimedRoles = getClaimedRoles(user);
  const userRecordId = user.claims?.userIdDb ?? user.id;
  const rawRedirectPreference = formData.get("redirectTo");
  const redirectPreference =
    typeof rawRedirectPreference === "string" && rawRedirectPreference.length > 0
      ? rawRedirectPreference
      : null;

  const parsed = UpdateProductSchema.safeParse({
    id: formData.get("id"),
    stockName: formData.get("stockName"),
    category: formData.get("category"),
    unit: formData.get("unit"),
    price: formData.get("price"),
    quantity: formData.get("quantity"),
    lowStock: formData.get("lowStock"),
    supplierId: optionalString(formData.get("supplierId")),
  });

  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors;
    const firstMessage =
      Object.values(details)
        .flat()
        .find((msg): msg is string => Boolean(msg)) ?? "Validation failed";
    throw new Error(firstMessage);
  }

  let supplierName: string | null = null;
  let supplierId: string | null = null;
  if (parsed.data.supplierId) {
    const supplier = await prisma.supplier.findFirst({
      where: { id: parsed.data.supplierId, userId: dbUserId },
    });
    if (!supplier) {
      throw new Error("Selected supplier not found");
    }
    supplierName = supplier.name;
    supplierId = supplier.id;
  }

  const existingProduct = await prisma.product.findFirst({
    where: { id: parsed.data.id, userId: dbUserId },
    select: { id: true },
  });

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  await prisma.product.update({
    where: { id: existingProduct.id },
    data: {
      stockName: parsed.data.stockName,
      category: parsed.data.category,
      unit: parsed.data.unit,
      price: normalizeCurrency(parsed.data.price),
      quantity: parsed.data.quantity,
      lowStock: parsed.data.lowStock,
      supplier: supplierName,
      supplierId,
    },
  });

  const isOwner = await getIsOwner(user.id, user.email, claimedRoles, userRecordId);
  if (redirectPreference !== "none") {
    const destination = redirectPreference ?? (isOwner ? "/inventory" : "/dashboard");
    redirect(destination);
  }

}
