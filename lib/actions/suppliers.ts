"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ensureUserInDB } from "../auth";
import { requireAnyRole } from "../role-guard";
import { prisma } from "../prisma";

const SupplierStatusEnum = ["ACTIVE", "INACTIVE"] as const;

const SupplierSchema = z.object({
  name: z.string().trim().min(1, "Supplier name is required"),
  category: z.string().trim().min(1, "Category is required"),
  whatsappNumber: z.string().trim().optional(),
  address: z.string().trim().optional(),
  status: z.enum(SupplierStatusEnum, {
    error: "Invalid status value",
  }),
});

function optionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

const SupplierUpdateSchema = SupplierSchema.extend({
  id: z.string().trim().min(1, "Supplier id is required"),
});

export async function createSupplier(formData: FormData) {
  await requireAnyRole(["OWNER"]);
  const dbUserId = await ensureUserInDB();
  const rawRedirectPreference = formData.get("redirectTo");
  const redirectPreference =
    typeof rawRedirectPreference === "string" && rawRedirectPreference.length > 0
      ? rawRedirectPreference
      : null;

  const statusVal = formData.get("status");
  const parsed = SupplierSchema.safeParse({
    name: typeof formData.get("name") === "string" ? formData.get("name") : "",
    category: typeof formData.get("category") === "string" ? formData.get("category") : "",
    whatsappNumber: optionalString(formData.get("whatsappNumber")),
    address: optionalString(formData.get("address")),
    status: typeof statusVal === "string" ? statusVal.trim().toUpperCase() : "",
  });

  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors;
    const firstMessage =
      Object.values(details)
        .flat()
        .find((msg): msg is string => Boolean(msg)) ?? "Validation failed";
    throw new Error(firstMessage);
  }

  await prisma.supplier.create({
    data: {
      userId: dbUserId,
      name: parsed.data.name,
      category: parsed.data.category,
      whatsappNumber: parsed.data.whatsappNumber ?? null,
      address: parsed.data.address ?? null,
      status: parsed.data.status,
    },
  });

  if (redirectPreference !== "none") {
    const destination = redirectPreference ?? "/supplier";
    redirect(destination);
  }
}

export async function deleteSupplier(formData: FormData) {
  await requireAnyRole(["OWNER"]);
  const dbUserId = await ensureUserInDB();
  const idVal = formData.get("id");
  const id = typeof idVal === "string" ? idVal.trim() : "";

  if (!id) {
    throw new Error("Missing supplier id");
  }

  const existingSupplier = await prisma.supplier.findFirst({
    where: { id, userId: dbUserId },
    select: { id: true },
  });

  if (!existingSupplier) {
    throw new Error("Supplier not found");
  }

  await prisma.supplier.delete({ where: { id: existingSupplier.id } });

}

export async function updateSupplier(formData: FormData) {
  await requireAnyRole(["OWNER"]);
  const dbUserId = await ensureUserInDB();
  const rawRedirectPreference = formData.get("redirectTo");
  const redirectPreference =
    typeof rawRedirectPreference === "string" && rawRedirectPreference.length > 0
      ? rawRedirectPreference
      : null;

  const statusValUpdate = formData.get("status");
  const parsed = SupplierUpdateSchema.safeParse({
    id: typeof formData.get("id") === "string" ? formData.get("id") : "",
    name: typeof formData.get("name") === "string" ? formData.get("name") : "",
    category: typeof formData.get("category") === "string" ? formData.get("category") : "",
    whatsappNumber: optionalString(formData.get("whatsappNumber")),
    address: optionalString(formData.get("address")),
    status: typeof statusValUpdate === "string" ? statusValUpdate.trim().toUpperCase() : "",
  });

  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors;
    const firstMessage =
      Object.values(details)
        .flat()
        .find((msg): msg is string => Boolean(msg)) ?? "Validation failed";
    throw new Error(firstMessage);
  }

  const existingSupplier = await prisma.supplier.findFirst({
    where: { id: parsed.data.id, userId: dbUserId },
    select: { id: true },
  });

  if (!existingSupplier) {
    throw new Error("Supplier not found");
  }

  await prisma.supplier.update({
    where: { id: existingSupplier.id },
    data: {
      name: parsed.data.name,
      category: parsed.data.category,
      whatsappNumber: parsed.data.whatsappNumber ?? null,
      address: parsed.data.address ?? null,
      status: parsed.data.status,
    }
  });

  if (redirectPreference !== "none") {
    const destination = redirectPreference ?? "/supplier";
    redirect(destination);
  }
}
