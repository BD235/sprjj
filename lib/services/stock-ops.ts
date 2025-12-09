import { Prisma, TipeKeluar, PrismaClient } from "@prisma/client";
import { prisma } from "../prisma";

// Gunakan 1 PrismaClient yang bisa di-inject untuk keperluan testing
function getClient(client?: PrismaClient) {
  return client ?? prisma;
}

type IncomingPayload = {
  stokId: string;
  jumlah: number; // sudah dalam unit dasar (GRAM/ML/PCS)
  userId?: string;
  pemasokId?: string;
  catatan?: string;
  transactionDate?: Date;
};

type SalePayload = {
  menuId: string;
  porsi: number;
  userId?: string;
};

type AdjustPayload = {
  stokId: string;
  jumlahKeluar: number;
  tipeKeluar: TipeKeluar;
  catatan?: string;
  userId?: string;
  transactionDate?: Date;
};

/**
 * Transaksi masuk: tambah stok dan catat di transaksi_masuk.
 */
export async function tambahStokMasuk(payload: IncomingPayload, client?: PrismaClient) {
  const db = getClient(client);
  const { stokId, jumlah, userId, pemasokId, catatan, transactionDate } = payload;

  return db.$transaction(async (tx) => {
    const stok = await tx.product.findUnique({ where: { id: stokId } });
    if (!stok) {
      throw new Error("Stok tidak ditemukan");
    }

    const trx = await tx.stockInTransaction.create({
      data: {
        productId: stokId,
        supplierId: pemasokId ?? null,
        userId: userId ?? stok.userId,
        transactionName: "STOK_MASUK",
        totalAmount: new Prisma.Decimal(0), // jika ingin catat harga, isi sesuai kebutuhan
        status: "COMPLETED",
        quantity: jumlah,
        transactionDate: transactionDate ?? new Date(),
        paymentMethod: "CASH",
      },
    });

    await tx.product.update({
      where: { id: stokId },
      data: { quantity: { increment: jumlah } },
    });

    return trx;
  });
}

/**
 * Penjualan menu: kurangi stok per resep dan catat di transaksi_keluar (tipe RESEP).
 * Memvalidasi stok tidak boleh minus.
 */
export async function prosesPenjualanMenu(payload: SalePayload, client?: PrismaClient) {
  const db = getClient(client);
  const { menuId, porsi, userId } = payload;

  return db.$transaction(async (tx) => {
    const resepList = await tx.recipe.findMany({
      where: { menuId },
      select: { productId: true, qtyPerPortion: true },
    });
    if (resepList.length === 0) {
      throw new Error("Resep tidak ditemukan untuk menu tersebut");
    }

    // Hitung kebutuhan total per stok
    const kebutuhan = new Map<string, number>();
    for (const resep of resepList) {
      const total = new Prisma.Decimal(resep.qtyPerPortion).mul(porsi).toNumber();
      kebutuhan.set(resep.productId, (kebutuhan.get(resep.productId) ?? 0) + total);
    }

    const productIds = Array.from(kebutuhan.keys());
    const stokList = await tx.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, stockName: true, quantity: true, lowStock: true, userId: true },
    });
    const stokMap = new Map(stokList.map((s) => [s.id, s]));

    for (const [productId, totalKeluar] of kebutuhan.entries()) {
      const stok = stokMap.get(productId);
      if (!stok) throw new Error(`Stok ${productId} tidak ditemukan`);
      if (stok.quantity < totalKeluar) {
        throw new Error(`Stok ${stok.stockName} tidak mencukupi`);
      }
    }

    // Catat transaksi keluar per bahan
    const asInt = (value: number) => Math.round(value);

    await Promise.all(
      Array.from(kebutuhan.entries()).map(([productId, totalKeluar]) => {
        const productUserId = userId ?? stokMap.get(productId)?.userId;
        if (!productUserId) {
          throw new Error(`userId tidak ditemukan untuk produk ${productId}`);
        }
        return tx.stockOutTransaction.create({
          data: {
            productId,
            userId: productUserId,
            menuId,
            transactionName: "PENJUALAN_MENU",
            quantity: asInt(totalKeluar),
            type: TipeKeluar.RESEP,
            transactionDate: new Date(),
            note: `Penjualan menu ${menuId} x${porsi}`,
          },
        });
      }),
    );

    // Update stok (decrement)
    await Promise.all(
      Array.from(kebutuhan.entries()).map(([productId, totalKeluar]) =>
        tx.product.update({
          where: { id: productId },
          data: { quantity: { decrement: asInt(totalKeluar) } },
        }),
      ),
    );

    // Notifikasi low stock
    for (const stok of stokList) {
      const updated = await tx.product.findUnique({
        where: { id: stok.id },
        select: { id: true, stockName: true, quantity: true, lowStock: true, userId: true },
      });
      if (updated && updated.quantity <= updated.lowStock) {
        await tx.notification.create({
          data: {
            userId: userId ?? updated.userId,
            productId: updated.id,
            type: "LOW_STOCK",
            severity: "WARNING",
            message: `${updated.stockName} di bawah stok minimal`,
          },
        });
      }
    }
  });
}

/**
 * Penyesuaian manual (rusak/expired/dll) → transaksi_keluar dengan tipe sesuai input.
 */
export async function penyesuaianStokManual(payload: AdjustPayload, client?: PrismaClient) {
  const db = getClient(client);
  const { stokId, jumlahKeluar, tipeKeluar, catatan, userId, transactionDate } = payload;

  return db.$transaction(async (tx) => {
    const stok = await tx.product.findUnique({
      where: { id: stokId },
      select: { id: true, stockName: true, quantity: true, lowStock: true, userId: true },
    });
    if (!stok) throw new Error("Stok tidak ditemukan");
    if (stok.quantity < jumlahKeluar) {
      throw new Error(`Sisa stok ${stok.stockName} tidak mencukupi`);
    }

    await tx.stockOutTransaction.create({
      data: {
        productId: stokId,
        userId: userId ?? stok.userId,
        transactionName: "PENYESUAIAN_STOK",
        quantity: Math.round(jumlahKeluar),
        type: tipeKeluar,
        transactionDate: transactionDate ?? new Date(),
        note: catatan,
      },
    });

    await tx.product.update({
      where: { id: stokId },
      data: { quantity: { decrement: Math.round(jumlahKeluar) } },
    });

    const updated = await tx.product.findUnique({
      where: { id: stokId },
      select: { id: true, stockName: true, quantity: true, lowStock: true, userId: true },
    });
    if (updated && updated.quantity <= updated.lowStock) {
      await tx.notification.create({
        data: {
          userId: userId ?? updated.userId,
          productId: updated.id,
          type: "LOW_STOCK",
          severity: "WARNING",
          message: `${updated.stockName} di bawah stok minimal`,
        },
      });
    }
  });
}
