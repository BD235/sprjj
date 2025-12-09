import { z } from "zod";

export const updateProfileSchema = z.object({
  username: z
    .string({ error: "Username wajib diisi." })
    .trim()
    .min(3, "Username minimal 3 karakter."),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updatePasswordSchema = z
  .object({
    currentPassword: z
      .string({ error: "Password saat ini wajib diisi." })
      .min(6, "Password minimal 6 karakter."),
    newPassword: z
      .string({ error: "Password baru wajib diisi." })
      .min(6, "Password baru minimal 6 karakter."),
    confirmPassword: z
      .string({ error: "Konfirmasi password wajib diisi." })
      .min(6, "Konfirmasi password wajib diisi."),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Konfirmasi password tidak sama.",
      });
    }

    if (data.currentPassword === data.newPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message: "Password baru harus berbeda dari password saat ini.",
      });
    }
  });

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

