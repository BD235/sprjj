"use server";

import { redirect } from "next/navigation";
import { Decimal } from "@prisma/client/runtime/library";
import { z } from "zod";
import { ensureUserInDB, getCurrentUser } from "../auth";
import { requireAnyRole } from "../role-guard";
import { prisma } from "../prisma";

// Local type definitions for Prisma v6 compatibility
type TransactionClient = Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

// Prisma namespace for where types
type Prisma = {
  ProductWhereInput: Parameters<typeof prisma.product.findFirst>[0] extends { where?: infer W } ? W : never;
  SupplierWhereInput: Parameters<typeof prisma.supplier.findFirst>[0] extends { where?: infer W } ? W : never;
};

// Enum values matching Prisma schema
const PaymentMethodEnum = ["CASH", "TRANSFER", "OTHER"] as const;
const TransactionStatusEnum = ["PENDING", "COMPLETED", "CANCELLED"] as const;

const TransactionSchema = z.object({
  transactionName: z.string().trim().min(1, "Transaction name is required"),
  productId: z.string().trim().min(1, "Product is required"),
  supplierId: z.string().trim().optional(),
  quantity: z.coerce.number().int().min(0, "Quantity must be non-negative"),
  totalAmount: z.coerce.number().nonnegative("Total price must be non-negative"),
  transactionDate: z
    .coerce.date()
    .refine((date) => !Number.isNaN(date.getTime()), "Transaction date is required"),
  paymentMethod: z.enum(PaymentMethodEnum, {
    error: "Invalid payment method",
  }),
  status: z.enum(TransactionStatusEnum, {
    error: "Invalid status value",
  }),
});

const TransactionUpdateSchema = TransactionSchema.extend({
  id: z.string().trim().min(1, "Transaction id is required"),
});

function optionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

type OwnerIds = {
  primary: string;
  fallback?: string;
};

function ownedProductWhere(productId: string, ownerIds: OwnerIds): Prisma["ProductWhereInput"] {
  if (ownerIds.fallback) {
    return {
      id: productId,
      OR: [{ userId: ownerIds.primary }, { userId: ownerIds.fallback }],
    };
  }
  return { id: productId, userId: ownerIds.primary };
}

function ownedSupplierWhere(supplierId: string, ownerIds: OwnerIds): Prisma["SupplierWhereInput"] {
  if (ownerIds.fallback) {
    return {
      id: supplierId,
      OR: [{ userId: ownerIds.primary }, { userId: ownerIds.fallback }],
    };
  }
  return { id: supplierId, userId: ownerIds.primary };
}

async function adjustProductQuantity(
  tx: TransactionClient,
  productId: string,
  ownerIds: OwnerIds,
  amount: number,
) {
  if (amount === 0) return;
  const result = await tx.product.updateMany({
    where: ownedProductWhere(productId, ownerIds),
    data: {
      quantity: {
        increment: amount,
      },
    },
  });
  if (result.count === 0) {
    throw new Error("Failed to update product stock");
  }
}

async function assertProductOwnership(productId: string, ownerIds: OwnerIds) {
  const product = await prisma.product.findFirst({
    where: ownedProductWhere(productId, ownerIds),
  });
  if (!product) {
    throw new Error("Selected product not found");
  }
}

async function assertSupplierOwnership(supplierId: string, ownerIds: OwnerIds) {
  const supplier = await prisma.supplier.findFirst({
    where: ownedSupplierWhere(supplierId, ownerIds),
  });
  if (!supplier) {
    throw new Error("Selected supplier not found");
  }
}

function normalizeCurrency(value: number) {
  return new Decimal(value).toFixed(0);
}

export async function createTransaction(formData: FormData) {
  await requireAnyRole(["OWNER"]);
  const user = await getCurrentUser();
  const dbUserId = await ensureUserInDB();
  const ownerIds: OwnerIds = { primary: dbUserId, fallback: user.id };
  const rawRedirectPreference = formData.get("redirectTo");
  const redirectPreference =
    typeof rawRedirectPreference === "string" && rawRedirectPreference.length > 0
      ? rawRedirectPreference
      : null;

  const parsed = TransactionSchema.safeParse({
    transactionName: formData.get("transactionName"),
    productId: formData.get("productId"),
    supplierId: optionalString(formData.get("supplierId")),
    quantity: formData.get("quantity"),
    totalAmount: formData.get("totalAmount"),
    transactionDate: formData.get("transactionDate"),
    paymentMethod:
      typeof formData.get("paymentMethod") === "string"
        ? formData.get("paymentMethod").trim().toUpperCase()
        : "",
    status:
      typeof formData.get("status") === "string" ? formData.get("status").trim().toUpperCase() : "",
  });

  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors;
    const firstMessage =
      Object.values(details)
        .flat()
        .find((msg): msg is string => Boolean(msg)) ?? "Validation failed";
    throw new Error(firstMessage);
  }

  await assertProductOwnership(parsed.data.productId, ownerIds);
  if (parsed.data.supplierId) {
    await assertSupplierOwnership(parsed.data.supplierId, ownerIds);
  }

  await prisma.$transaction(async (tx) => {
    await tx.stockInTransaction.create({
      data: {
        userId: dbUserId,
        productId: parsed.data.productId,
        supplierId: parsed.data.supplierId ?? null,
        transactionName: parsed.data.transactionName,
        totalAmount: normalizeCurrency(parsed.data.totalAmount),
        status: parsed.data.status,
        quantity: parsed.data.quantity,
        transactionDate: parsed.data.transactionDate,
        paymentMethod: parsed.data.paymentMethod,
      },
    });

    if (parsed.data.status === "COMPLETED") {
      await adjustProductQuantity(tx, parsed.data.productId, ownerIds, parsed.data.quantity);
    }
  });

  if (redirectPreference !== "none") {
    const destination = redirectPreference ?? "/transactions";
    redirect(destination);
  }

}

export async function updateTransaction(formData: FormData) {
  await requireAnyRole(["OWNER"]);
  const user = await getCurrentUser();
  const dbUserId = await ensureUserInDB();
  const ownerIds: OwnerIds = { primary: dbUserId, fallback: user.id };
  const rawRedirectPreference = formData.get("redirectTo");
  const redirectPreference =
    typeof rawRedirectPreference === "string" && rawRedirectPreference.length > 0
      ? rawRedirectPreference
      : null;

  const parsed = TransactionUpdateSchema.safeParse({
    id: formData.get("id"),
    transactionName: formData.get("transactionName"),
    productId: formData.get("productId"),
    supplierId: optionalString(formData.get("supplierId")),
    quantity: formData.get("quantity"),
    totalAmount: formData.get("totalAmount"),
    transactionDate: formData.get("transactionDate"),
    paymentMethod:
      typeof formData.get("paymentMethod") === "string"
        ? formData.get("paymentMethod").trim().toUpperCase()
        : "",
    status:
      typeof formData.get("status") === "string" ? formData.get("status").trim().toUpperCase() : "",
  });

  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors;
    const firstMessage =
      Object.values(details)
        .flat()
        .find((msg): msg is string => Boolean(msg)) ?? "Validation failed";
    throw new Error(firstMessage);
  }

  await assertProductOwnership(parsed.data.productId, ownerIds);
  if (parsed.data.supplierId) {
    await assertSupplierOwnership(parsed.data.supplierId, ownerIds);
  }

  const existing = await prisma.stockInTransaction.findFirst({
    where: { id: parsed.data.id, userId: dbUserId },
    select: { id: true, productId: true, quantity: true, status: true },
  });

  if (!existing) {
    throw new Error("Transaction not found");
  }

  await prisma.$transaction(async (tx) => {
    if (existing.status === "COMPLETED") {
      await adjustProductQuantity(tx, existing.productId, ownerIds, -existing.quantity);
    }

    await tx.stockInTransaction.update({
      where: { id: parsed.data.id },
      data: {
        productId: parsed.data.productId,
        supplierId: parsed.data.supplierId ?? null,
        transactionName: parsed.data.transactionName,
        totalAmount: normalizeCurrency(parsed.data.totalAmount),
        status: parsed.data.status,
        quantity: parsed.data.quantity,
        transactionDate: parsed.data.transactionDate,
        paymentMethod: parsed.data.paymentMethod,
      },
    });

    if (parsed.data.status === "COMPLETED") {
      await adjustProductQuantity(tx, parsed.data.productId, ownerIds, parsed.data.quantity);
    }
  });

  if (redirectPreference !== "none") {
    const destination = redirectPreference ?? "/transactions";
    redirect(destination);
  }

}

export async function deleteTransaction(formData: FormData) {
  await requireAnyRole(["OWNER"]);
  const user = await getCurrentUser();
  const dbUserId = await ensureUserInDB();
  const ownerIds: OwnerIds = { primary: dbUserId, fallback: user.id };

  const id = typeof formData.get("id") === "string" ? formData.get("id").trim() : "";
  if (!id) {
    throw new Error("Missing transaction id");
  }

  const existing = await prisma.stockInTransaction.findFirst({
    where: { id, userId: dbUserId },
    select: { id: true, productId: true, quantity: true, status: true },
  });

  if (!existing) {
    throw new Error("Transaction not found");
  }

  await prisma.$transaction(async (tx) => {
    if (existing.status === "COMPLETED") {
      await adjustProductQuantity(tx, existing.productId, ownerIds, -existing.quantity);
    }
    await tx.stockInTransaction.delete({
      where: { id },
    });
  });
}
