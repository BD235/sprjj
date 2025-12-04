"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";
import { getAuthenticatedUserRecordId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updatePasswordSchema, updateProfileSchema } from "@/lib/validators/account-settings";
import type { AccountActionState } from "@/lib/actions/account-settings-shared";

function extractFieldErrors(error: ZodError): Partial<Record<string, string>> {
  const fieldErrors: Partial<Record<string, string>> = {};
  const flattened = error.flatten().fieldErrors;
  for (const [key, value] of Object.entries(flattened)) {
    if (value && value[0]) {
      fieldErrors[key] = value[0];
    }
  }
  return fieldErrors;
}

function successState(message: string): AccountActionState {
  return {
    status: "success",
    message,
    fieldErrors: {},
  };
}

function errorState(message: string, fieldErrors?: Partial<Record<string, string>>): AccountActionState {
  return {
    status: "error",
    message,
    fieldErrors: fieldErrors ?? {},
  };
}

export async function updateProfileAction(
  _prevState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  try {
    const parsed = updateProfileSchema.safeParse({
      username: formData.get("username"),
    });

    if (!parsed.success) {
      return errorState(
        parsed.error.issues[0]?.message ?? "Data username tidak valid.",
        extractFieldErrors(parsed.error),
      );
    }

    const userId = await getAuthenticatedUserRecordId();
    const normalizedUsername = parsed.data.username;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, name: true },
    });

    if (!existingUser) {
      return errorState("Pengguna tidak ditemukan.");
    }

    const currentUsername = existingUser.username ?? existingUser.name ?? "";

    if (currentUsername === normalizedUsername) {
      return successState("Username tidak mengalami perubahan.");
    }

    const conflict = await prisma.user.findFirst({
      where: {
        username: normalizedUsername,
        NOT: { id: userId },
      },
      select: { id: true },
    });

    if (conflict) {
      return errorState("Username tidak tersedia.", {
        username: "Username tidak tersedia.",
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        username: normalizedUsername,
        name: normalizedUsername,
      },
    });

    revalidatePath("/settings");

    return successState("Username berhasil diperbarui.");
  } catch (error) {
    console.error("Failed to update username:", error);
    return errorState("Terjadi kesalahan saat memperbarui username.");
  }
}

export async function updatePasswordAction(
  _prevState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  try {
    const parsed = updatePasswordSchema.safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      return errorState(
        parsed.error.issues[0]?.message ?? "Data password tidak valid.",
        extractFieldErrors(parsed.error),
      );
    }

    const userId = await getAuthenticatedUserRecordId();
    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!userRecord || !userRecord.password) {
      return errorState("Akun belum memiliki password yang dapat diperbarui.");
    }

    const isCurrentValid = await bcrypt.compare(
      parsed.data.currentPassword,
      userRecord.password,
    );

    if (!isCurrentValid) {
      return errorState("Password saat ini tidak sesuai.", {
        currentPassword: "Password saat ini tidak sesuai.",
      });
    }

    const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    revalidatePath("/settings");

    return successState("Password berhasil diperbarui.");
  } catch (error) {
    console.error("Failed to update password:", error);
    return errorState("Terjadi kesalahan saat memperbarui password.");
  }
}
