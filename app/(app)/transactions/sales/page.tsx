import Topbar from "@/components/topbar";
import SalesLogClient from "./sales-log-client";
import { ensureUserInDB, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAnyRole } from "@/lib/role-guard";
import { getClaimedRoles, getIsOwner } from "@/lib/role";

const unitLabels: Record<string, string> = {
  GRAM: "gram",
  KG: "kg",
  ML: "ml",
  PCS: "pcs",
};

export default async function SalesTransactionsPage() {
  await requireAnyRole(["OWNER", "PEGAWAI"]);

  const MIN_SKELETON_DELAY_MS = 800;
  await new Promise((resolve) => setTimeout(resolve, MIN_SKELETON_DELAY_MS));

  const user = await getCurrentUser();
  const dbUserId = await ensureUserInDB();
  const claimedRoles = getClaimedRoles(user);
  const userRecordId = user.claims?.userIdDb ?? user.id;
  const isOwner = await getIsOwner(user.id, user.email, claimedRoles, userRecordId);
  const isPegawai = claimedRoles.includes("PEGAWAI");
  const canManageSales = isOwner || isPegawai;

  const [stockOutLogs, menus, products] = await Promise.all([
    prisma.stockOutTransaction.findMany({
      where: { userId: dbUserId },
      include: {
        product: true,
        menu: true,
      },
      orderBy: { transactionDate: "desc" },
      take: 200,
    }),
    prisma.menu.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { userId: dbUserId },
      orderBy: { stockName: "asc" },
      select: { id: true, stockName: true, unit: true },
    }),
  ]);

  const logGroups = new Map<string, {
    id: string;
    transactionName: string;
    menuName: string;
    menuCode: string;
    menuId: string | null;
    note: string;
    transactionDate: string;
    source: "CSV" | "MANUAL";
    entries: {
      id: string;
      productId: string;
      productName: string;
      unit: string;
      quantity: number;
    }[];
  }>();

  stockOutLogs.forEach((log) => {
    const key = `${log.transactionName}-${log.menuId ?? "none"}-${log.transactionDate.toISOString()}`;
    const entry = {
      id: log.id,
      productId: log.productId,
      productName: log.product.stockName,
      unit: unitLabels[log.product.unit] ?? log.product.unit.toLowerCase(),
      quantity: log.quantity,
    };

    if (!logGroups.has(key)) {
      logGroups.set(key, {
        id: log.id,
        transactionName: log.transactionName,
        menuName: log.menu?.name ?? "-",
        menuCode: log.menu?.code ?? "-",
        menuId: log.menuId,
        note: log.note ?? "",
        transactionDate: log.transactionDate.toISOString(),
        source: log.transactionName.startsWith("PENJUALAN_UPLOAD") ? "CSV" : "MANUAL",
        entries: [entry],
      });
    } else {
      const group = logGroups.get(key)!;
      group.entries.push(entry);
    }
  });

  const logItems = Array.from(logGroups.values()).sort((a, b) =>
    new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime(),
  );

  const menuOptions = menus.map((menu) => ({
    id: menu.id,
    label: menu.name,
    helper: menu.code,
  }));

  const productOptions = products.map((product) => ({
    id: product.id,
    label: product.stockName,
    helper: unitLabels[product.unit] ?? product.unit.toLowerCase(),
  }));
  return (
    <>
      <Topbar title="Penjualan" />
      <div className="h-6" />
      <SalesLogClient
        items={logItems}
        menuOptions={menuOptions}
        productOptions={productOptions}
        canManage={canManageSales}
      />
    </>
  );
}
