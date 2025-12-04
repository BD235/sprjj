import { z } from "zod";

export const registerFormSchema = z
  .object({
    username: z
      .string({ required_error: "Username wajib diisi." })
      .min(3, "Username minimal 3 karakter.")
      .trim(),
    email: z
      .string({ required_error: "Email wajib diisi." })
      .min(1, "Email wajib diisi.")
      .email("Format email tidak valid.")
      .transform((value) => value.trim().toLowerCase()),
    password: z
      .string({ required_error: "Password wajib diisi." })
      .min(6, "Password minimal 6 karakter."),
    confirmPassword: z
      .string({ required_error: "Konfirmasi password wajib diisi." })
      .min(1, "Konfirmasi password wajib diisi."),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Konfirmasi password tidak sama.",
      });
    }
  });

export type RegisterFormInput = z.infer<typeof registerFormSchema>;
