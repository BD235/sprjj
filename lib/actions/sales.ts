"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAnyRole } from "../role-guard";
import { ensureUserInDB, getCurrentUser } from "../auth";
import { prisma } from "../prisma";

const CsvRowSchema = z.object({
  menuValue: z.string().min(1, "Menu tidak boleh kosong"),
  matchBy: z.enum(["code", "name"]),
  quantity: z.number().int().positive("Quantity must be positive"),
  transactionDate: z.date(),
  note: z.string().optional(),
  line: z.number().int().min(2),
});

const ManualStockOutSchema = z.object({
  transactionName: z.string().trim().min(1, "Nama transaksi wajib diisi"),
  productId: z.string().trim().min(1, "Bahan wajib dipilih"),
  menuId: z.string().trim().optional(),
  quantity: z.coerce.number().int().positive("Jumlah harus lebih dari 0"),
  transactionDate: z
    .coerce.date()
    .refine((date) => !Number.isNaN(date.getTime()), "Tanggal tidak valid"),
  note: z.string().optional(),
});

const ManualStockOutUpdateSchema = ManualStockOutSchema.extend({
  id: z.string().trim().min(1, "ID log wajib diisi"),
});

type ParsedCsvRow = z.infer<typeof CsvRowSchema>;
export type UploadSalesCsvState =
  | { status: "idle"; message?: undefined }
  | { status: "error"; message: string }
  | { status: "success"; message: string };

const MAX_UPLOAD_SIZE_BYTES = 1024 * 1024 * 2; // 2 MB
const TX_TIMEOUT_MS = 20_000; // Allow longer interactive transactions for large CSVs

const headerAliases = {
  menuCode: ["menu_code", "kode_menu"],
  menuName: ["menu_dipesan", "menu", "menu_name", "nama_menu"],
  quantity: ["quantity", "jumlah", "qty"],
  transactionDate: ["transaction_date", "tanggal", "tanggal_transaksi"],
  note: ["note", "catatan"],
  idTransaction: ["id_transaksi", "kode_transaksi", "invoice"],
  customer: ["nama_pelanggan", "pelanggan"],
  payment: ["metode_pembayaran", "payment_method"],
};

function optionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function findColumnIndex(headers: string[], candidates: string[]) {
  return candidates.map((candidate) => headers.indexOf(candidate)).find((index) => index >= 0) ?? -1;
}

function parseCsvContent(raw: string): ParsedCsvRow[] {
  const normalized = raw.trim();
  if (!normalized) {
    throw new Error("File CSV kosong");
  }

  const lines = normalized.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error("File CSV harus memiliki header dan minimal satu baris data");
  }

  const headers = lines[0]
    .split(",")
    .map((header) => header.trim().toLowerCase());

  const menuCodeIndex = findColumnIndex(headers, headerAliases.menuCode);
  const menuNameIndex = findColumnIndex(headers, headerAliases.menuName);
  if (menuCodeIndex === -1 && menuNameIndex === -1) {
    throw new Error('Kolom "menu_code" atau "menu_dipesan" wajib ada di header CSV');
  }

  const quantityIndex = findColumnIndex(headers, headerAliases.quantity);
  if (quantityIndex === -1) {
    throw new Error('Kolom "jumlah" atau "quantity" wajib ada di header CSV');
  }

  const transactionDateIndex = findColumnIndex(headers, headerAliases.transactionDate);
  const noteIndex = findColumnIndex(headers, headerAliases.note);
  const idTransactionIndex = findColumnIndex(headers, headerAliases.idTransaction);
  const customerIndex = findColumnIndex(headers, headerAliases.customer);
  const paymentIndex = findColumnIndex(headers, headerAliases.payment);

  const rows: ParsedCsvRow[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const rawLine = lines[i];
    if (!rawLine.trim()) continue;

    const cells = rawLine.split(",").map((cell) => cell.trim());
    const lineNumber = i + 1;

    const menuCodeValue = menuCodeIndex >= 0 ? cells[menuCodeIndex] ?? "" : "";
    const menuNameValue = menuNameIndex >= 0 ? cells[menuNameIndex] ?? "" : "";
    const menuValue = (menuCodeValue || menuNameValue).trim();
    const matchBy = menuCodeValue.trim().length > 0 ? "code" : "name";

    if (!menuValue) {
      throw new Error(`Menu pada baris ${lineNumber} tidak boleh kosong`);
    }

    const quantityRaw = Number(cells[quantityIndex] ?? "0");
    const normalizedQuantity = Number.isFinite(quantityRaw) ? Math.round(quantityRaw) : NaN;
    if (!Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
      throw new Error(`Jumlah penjualan tidak valid pada baris ${lineNumber}`);
    }

    const payload: ParsedCsvRow = {
      menuValue,
      matchBy,
      quantity: normalizedQuantity,
      transactionDate: new Date(),
      note: undefined,
      line: lineNumber,
    };

    if (transactionDateIndex >= 0) {
      const value = cells[transactionDateIndex];
      if (value) {
        const parsedDate = new Date(value);
        if (!Number.isNaN(parsedDate.getTime())) {
          payload.transactionDate = parsedDate;
        } else {
          throw new Error(`Tanggal tidak valid pada baris ${lineNumber}`);
        }
      }
    }

    const noteParts: string[] = [];
    if (noteIndex >= 0) {
      const value = cells[noteIndex];
      if (value?.length) {
        noteParts.push(value);
      }
    }
    if (idTransactionIndex >= 0) {
      const value = cells[idTransactionIndex];
      if (value?.length) {
        noteParts.push(`ID:${value}`);
      }
    }
    if (customerIndex >= 0) {
      const value = cells[customerIndex];
      if (value?.length) {
        noteParts.push(`Cust:${value}`);
      }
    }
    if (paymentIndex >= 0) {
      const value = cells[paymentIndex];
      if (value?.length) {
        noteParts.push(`Pay:${value}`);
      }
    }

    if (noteParts.length) {
      payload.note = noteParts.join(" | ");
    }

    const validated = CsvRowSchema.safeParse(payload);
    if (!validated.success) {
      const firstError =
        validated.error.flatten().formErrors[0] ??
        Object.values(validated.error.flatten().fieldErrors)
          .flat()
          .find(Boolean);
      throw new Error(firstError ?? `Format CSV tidak valid pada baris ${lineNumber}`);
    }

    rows.push(validated.data);
  }

  if (!rows.length) {
    throw new Error("CSV tidak berisi data penjualan");
  }

  return rows;
}

function summarizeNote(baseNote: string, rowNote?: string) {
  const merged = [rowNote, baseNote].filter((value) => value && value.trim().length > 0);
  return merged.length ? merged.join(" | ").slice(0, 250) : null;
}

export async function uploadSalesCsv(
  _prevState: UploadSalesCsvState | undefined,
  formData: FormData,
): Promise<UploadSalesCsvState> {
  try {
    await requireAnyRole(["OWNER", "PEGAWAI"]);
    await getCurrentUser();
    const dbUserId = await ensureUserInDB();

    const fileEntry = formData.get("file");
    if (!(fileEntry instanceof File)) {
      return { status: "error", message: "File CSV tidak ditemukan" };
    }

    if (fileEntry.size === 0) {
      return { status: "error", message: "File CSV kosong" };
    }

    if (fileEntry.size > MAX_UPLOAD_SIZE_BYTES) {
      return { status: "error", message: "Ukuran file terlalu besar. Maksimal 2MB" };
    }

    const mime = fileEntry.type?.toLowerCase() ?? "";
    const filename = fileEntry.name?.toLowerCase() ?? "";
    if (!mime.includes("csv") && !filename.endsWith(".csv")) {
      return { status: "error", message: "Format file harus CSV (.csv)" };
    }

    const noteEntry = formData.get("note");
    const generalNote = typeof noteEntry === "string" ? noteEntry.trim() : "";
    const csvText = await fileEntry.text();
    const parsedRows = parseCsvContent(csvText);

    // 1. Collect all unique menu identifiers to fetch Menus
    const codeIdentifiers = Array.from(
      new Set(
        parsedRows
          .filter((row) => row.matchBy === "code")
          .map((row) => row.menuValue.trim()),
      ),
    );
    const nameIdentifiers = Array.from(
      new Set(
        parsedRows
          .filter((row) => row.matchBy === "name")
          .map((row) => row.menuValue.trim()),
      ),
    );

    const menuFilters = [] as { code?: { in: string[] }; name?: { in: string[] } }[];
    if (codeIdentifiers.length) {
      menuFilters.push({ code: { in: codeIdentifiers } });
    }
    if (nameIdentifiers.length) {
      menuFilters.push({ name: { in: nameIdentifiers } });
    }

    const menus = await prisma.menu.findMany({
      where: menuFilters.length ? { OR: menuFilters } : undefined,
      include: {
        recipes: {
          select: {
            productId: true,
            qtyPerPortion: true,
          },
        },
      },
    });

    if (!menus.length) {
      throw new Error("Menu pada CSV tidak ditemukan di database");
    }

    type MenuEntry = (typeof menus)[number];
    const menuByCode = new Map<string, MenuEntry>();
    const menuByName = new Map<string, MenuEntry>();
    menus.forEach((menu: MenuEntry) => {
      menuByCode.set(menu.code.toLowerCase(), menu);
      menuByName.set(menu.name.toLowerCase(), menu);
    });

    // 2. Derive all transaction entries and aggregate product usage
    type DerivedEntry = {
      menuId: string;
      menuCode: string;
      productId: string;
      quantity: number;
      transactionDate: Date;
      transactionName: string;
      note: string | null;
    };

    const derivedEntries: DerivedEntry[] = [];
    // Map<productId, totalQuantityToDecrement>
    const productUsageMap = new Map<string, number>();

    parsedRows.forEach((row, index) => {
      const key = row.menuValue.toLowerCase();
      const menu =
        row.matchBy === "code" ? menuByCode.get(key) : menuByName.get(key);

      if (!menu) {
        const label = row.matchBy === "code" ? `kode "${row.menuValue}"` : `"${row.menuValue}"`;
        throw new Error(`Menu dengan ${label} tidak ditemukan (baris ${row.line})`);
      }
      if (menu.recipes.length === 0) {
        throw new Error(`Menu "${menu.name}" belum memiliki resep (baris ${row.line})`);
      }

      menu.recipes.forEach((recipe: (typeof menu.recipes)[number]) => {
        const perPortion = Number(recipe.qtyPerPortion);
        if (!Number.isFinite(perPortion) || perPortion <= 0) {
          return;
        }
        const deduction = Math.max(1, Math.round(perPortion * row.quantity));
        const transactionName = `PENJUALAN_UPLOAD_${menu.code}_${index + 1}`;
        const note = summarizeNote(generalNote, row.note);

        derivedEntries.push({
          menuId: menu.id,
          menuCode: menu.code,
          productId: recipe.productId,
          quantity: deduction,
          transactionDate: row.transactionDate,
          transactionName,
          note,
        });

        // Aggregate usage
        const currentTotal = productUsageMap.get(recipe.productId) ?? 0;
        productUsageMap.set(recipe.productId, currentTotal + deduction);
      });
    });

    if (!derivedEntries.length) {
      throw new Error("Tidak ada bahan yang digunakan dari CSV tersebut");
    }

    const uniqueProductIds = Array.from(productUsageMap.keys());

    // 3. Execute Database Transaction
    await prisma.$transaction(
      async (tx: typeof prisma) => {
        // A. Verify all products exist and belong to the user
        // We only need to check existence and ownership, but we might as well lock them or check quantity if needed.
        // For now, just ensuring they exist is enough as per original logic.
        const validProducts = await tx.product.findMany({
          where: {
            id: { in: uniqueProductIds },
            userId: dbUserId,
          },
          select: { id: true },
        });

        if (validProducts.length !== uniqueProductIds.length) {
          // Find which one is missing
          const validIds = new Set(validProducts.map((p) => p.id));
          const missingId = uniqueProductIds.find((id) => !validIds.has(id));
          throw new Error(
            `Bahan dengan ID ${missingId} tidak ditemukan atau bukan milik Anda`,
          );
        }

        // B. Batch Update Products (Decrement Stock)
        // Prisma doesn't support bulk update with different values easily without raw query or loop.
        // Since we aggregated, we loop over UNIQUE products, which is much better than looping over every CSV row.
        for (const [productId, totalQty] of productUsageMap.entries()) {
          await tx.product.update({
            where: { id: productId },
            data: {
              quantity: {
                decrement: totalQty,
              },
            },
          });
        }

        // C. Batch Insert Transaction Logs
        // createMany is supported for StockOutTransaction
        await tx.stockOutTransaction.createMany({
          data: derivedEntries.map((entry) => ({
            userId: dbUserId,
            productId: entry.productId,
            menuId: entry.menuId,
            transactionName: entry.transactionName,
            quantity: entry.quantity,
            transactionDate: entry.transactionDate,
            note: entry.note,
          })),
        });
      },
      { timeout: TX_TIMEOUT_MS },
    );

    revalidatePath("/transactions/sales");
    return { status: "success", message: "Upload penjualan berhasil diproses" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal memproses CSV penjualan";
    return { status: "error", message };
  }
}

function extractFirstError<T>(result: z.SafeParseReturnType<unknown, T>) {
  const details = result.error.flatten();
  return (
    details.formErrors[0] ??
    Object.values(details.fieldErrors)
      .flat()
      .find(Boolean) ??
    "Validasi gagal"
  );
}

export async function createManualStockOutEntry(formData: FormData) {
  await requireAnyRole(["OWNER", "PEGAWAI"]);
  const dbUserId = await ensureUserInDB();
  const rawRedirectPreference = formData.get("redirectTo");
  const redirectPreference =
    typeof rawRedirectPreference === "string" && rawRedirectPreference.length > 0
      ? rawRedirectPreference
      : null;

  const parsed = ManualStockOutSchema.safeParse({
    transactionName: formData.get("transactionName"),
    productId: formData.get("productId"),
    menuId: optionalString(formData.get("menuId")),
    quantity: formData.get("quantity"),
    transactionDate: formData.get("transactionDate"),
    note: optionalString(formData.get("note")),
  });

  if (!parsed.success) {
    throw new Error(extractFirstError(parsed));
  }

  const menuId = parsed.data.menuId ?? null;

  const productExists = await prisma.product.findFirst({
    where: { id: parsed.data.productId, userId: dbUserId },
    select: { id: true },
  });
  if (!productExists) {
    throw new Error("Bahan tidak ditemukan");
  }

  if (menuId) {
    const menuExists = await prisma.menu.findFirst({ where: { id: menuId } });
    if (!menuExists) {
      throw new Error("Menu tidak ditemukan");
    }
  }

  await prisma.$transaction(async (tx) => {
    const decremented = await tx.product.updateMany({
      where: { id: parsed.data.productId, userId: dbUserId },
      data: {
        quantity: {
          decrement: parsed.data.quantity,
        },
      },
    });
    if (decremented.count === 0) {
      throw new Error("Gagal memperbarui stok bahan");
    }

    await tx.stockOutTransaction.create({
      data: {
        userId: dbUserId,
        productId: parsed.data.productId,
        menuId,
        transactionName: parsed.data.transactionName,
        quantity: parsed.data.quantity,
        transactionDate: parsed.data.transactionDate,
        note: parsed.data.note ?? null,
      }
    });
  });
  if (redirectPreference !== "none") {
    const destination = redirectPreference ?? "/transactions/sales";
    redirect(destination);
  }

  return { success: true };
}

export async function updateManualStockOutEntry(formData: FormData) {
  await requireAnyRole(["OWNER", "PEGAWAI"]);
  const dbUserId = await ensureUserInDB();
  const rawRedirectPreference = formData.get("redirectTo");
  const redirectPreference =
    typeof rawRedirectPreference === "string" && rawRedirectPreference.length > 0
      ? rawRedirectPreference
      : null;

  const parsed = ManualStockOutUpdateSchema.safeParse({
    id: formData.get("id"),
    transactionName: formData.get("transactionName"),
    productId: formData.get("productId"),
    menuId: optionalString(formData.get("menuId")),
    quantity: formData.get("quantity"),
    transactionDate: formData.get("transactionDate"),
    note: optionalString(formData.get("note")),
  });

  if (!parsed.success) {
    throw new Error(extractFirstError(parsed));
  }

  const existing = await prisma.stockOutTransaction.findFirst({
    where: { id: parsed.data.id, userId: dbUserId },
    select: { id: true, productId: true, quantity: true },
  });
  if (!existing) {
    throw new Error("Log penjualan tidak ditemukan");
  }

  const productExists = await prisma.product.findFirst({
    where: { id: parsed.data.productId, userId: dbUserId },
    select: { id: true },
  });
  if (!productExists) {
    throw new Error("Bahan tidak ditemukan");
  }

  if (parsed.data.menuId) {
    const menuExists = await prisma.menu.findFirst({ where: { id: parsed.data.menuId } });
    if (!menuExists) {
      throw new Error("Menu tidak ditemukan");
    }
  }

  await prisma.$transaction(async (tx) => {
    const restored = await tx.product.updateMany({
      where: { id: existing.productId, userId: dbUserId },
      data: {
        quantity: {
          increment: existing.quantity,
        },
      },
    });
    if (restored.count === 0) {
      throw new Error("Gagal mengembalikan stok lama");
    }

    await tx.stockOutTransaction.update({
      where: { id: parsed.data.id },
      data: {
        productId: parsed.data.productId,
        menuId: parsed.data.menuId ?? null,
        transactionName: parsed.data.transactionName,
        quantity: parsed.data.quantity,
        transactionDate: parsed.data.transactionDate,
        note: parsed.data.note ?? null,
      }
    });

    const decremented = await tx.product.updateMany({
      where: { id: parsed.data.productId, userId: dbUserId },
      data: {
        quantity: {
          decrement: parsed.data.quantity,
        },
      },
    });

    if (decremented.count === 0) {
      throw new Error("Gagal memperbarui stok baru");
    }
  });
  if (redirectPreference !== "none") {
    const destination = redirectPreference ?? "/transactions/sales";
    redirect(destination);
  }

  return { success: true };
}
