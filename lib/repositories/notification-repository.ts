import { prisma } from "@/lib/prisma";

export async function findNotificationsByMessages(userId: string, messages: string[]) {
  return prisma.notification.findMany({
    where: { userId, message: { in: messages } },
    select: { id: true, message: true, notifiedAt: true },
  });
}

type NotificationCreateInput = {
  message: string;
  productId?: string | null;
  severity: "INFO" | "WARNING" | "CRITICAL";
};

export async function createNotifications(userId: string, inputs: NotificationCreateInput[]) {
  if (!inputs.length) return [];

  const operations = inputs.map((input) =>
    prisma.notification.create({
      data: {
        userId,
        message: input.message,
        productId: input.productId ?? null,
        severity: input.severity,
      },
      select: { id: true, message: true, notifiedAt: true },
    }),
  );

  return prisma.$transaction(operations);
}
