import { createNotifications, findNotificationsByMessages } from "@/lib/repositories/notification-repository";
import { findProductsForLowStock } from "@/lib/repositories/product-repository";

export type StockStatus = "out" | "critical" | "warning";

type ProductRecord = Awaited<ReturnType<typeof findProductsForLowStock>>[number];
type NotificationMetadata = { id: string; message: string; notifiedAt: Date };
type NotificationSeverityLevel = "INFO" | "WARNING" | "CRITICAL";

function deriveStatus(quantity: number, threshold: number | null): StockStatus | null {
  const safeQuantity = Number(quantity);
  const safeThreshold = threshold === null ? null : Number(threshold);

  if (Number.isNaN(safeQuantity)) return null;
  if (safeQuantity <= 0) return "out";
  if (safeThreshold === null || Number.isNaN(safeThreshold) || safeThreshold <= 0) return null;

  if (safeQuantity <= safeThreshold / 2) return "critical";
  if (safeQuantity < safeThreshold) return "warning";
  return null;
}

function buildMessage(stockName: string, status: StockStatus) {
  if (status === "out") return `Your ${stockName} stock is out of stock`;
  if (status === "critical") return `Your ${stockName} stock is critically low`;
  return `Your ${stockName} stock is running low`;
}

function mapStatusToSeverity(status: StockStatus): NotificationSeverityLevel {
  if (status === "warning") return "WARNING";
  return "CRITICAL";
}

function mapProductsToAlerts(products: ProductRecord[]) {
  return products
    .map((product: ProductRecord) => {
      const status = deriveStatus(product.quantity, product.lowStock);
      if (!status) return null;

      return {
        id: product.id,
        productId: product.id,
        stockName: product.stockName,
        quantity: product.quantity,
        threshold: product.lowStock ?? 0,
        status,
        severity: mapStatusToSeverity(status),
        message: buildMessage(product.stockName, status),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

function mapRecords(records: NotificationMetadata[]) {
  return new Map(records.map((record) => [record.message, record]));
}

function mapAlertsByMessage(alerts: ReturnType<typeof mapProductsToAlerts>) {
  const map = new Map<string, (typeof alerts)[number]>();
  alerts.forEach((alert: (typeof alerts)[number]) => {
    if (!map.has(alert.message)) {
      map.set(alert.message, alert);
    }
  });
  return map;
}

export async function getLowStockNotifications(userId: string) {
  const products = await findProductsForLowStock(userId);
  const notifications = mapProductsToAlerts(products);

  if (!notifications.length) {
    return [];
  }

  const alertsByMessage = mapAlertsByMessage(notifications);
  const uniqueMessages = Array.from(alertsByMessage.keys());

  const existingRecords = uniqueMessages.length
    ? await findNotificationsByMessages(userId, uniqueMessages)
    : [];

  const existingByMessage = mapRecords(existingRecords);
  const missingMessages = uniqueMessages.filter((message) => !existingByMessage.has(message));

  const createPayload = missingMessages.map((message) => {
    const alert = alertsByMessage.get(message)!;
    return {
      message,
      productId: alert.productId,
      severity: alert.severity,
    };
  });
  const newlyCreated = createPayload.length ? await createNotifications(userId, createPayload) : [];

  const metaByMessage = mapRecords([...existingRecords, ...newlyCreated]);

  return notifications
    .map((notification: (typeof notifications)[number]) => {
      const meta = metaByMessage.get(notification.message);
      return {
        ...notification,
        notificationId: meta?.id ?? null,
        notifiedAt: meta?.notifiedAt?.toISOString() ?? null,
      };
    })
    .sort((a, b) => {
      const timeA = a.notifiedAt ? Date.parse(a.notifiedAt) : 0;
      const timeB = b.notifiedAt ? Date.parse(b.notifiedAt) : 0;
      return timeB - timeA;
    });
}
