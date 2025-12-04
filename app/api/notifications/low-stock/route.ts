import { NextResponse } from "next/server";
import { ensureUserInDB } from "@/lib/auth";
import { ForbiddenError, requireAnyRole } from "@/lib/role-guard";
import { getLowStockNotifications } from "@/lib/services/notification-service";

export async function GET() {
  try {
    await requireAnyRole(["OWNER", "PEGAWAI"]);
    const userId = await ensureUserInDB();
    const notifications = await getLowStockNotifications(userId);
    return NextResponse.json({ notifications });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error) {
      const status = typeof (error as { status?: unknown }).status === "number"
        ? (error as { status: number }).status
        : undefined;
      if (status === 401) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
