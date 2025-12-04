import { NextResponse } from "next/server";
import { BadRequestError } from "@/lib/http-errors";
import { registerUser } from "@/lib/services/user-service";
import { registerFormSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);
    const parsed = registerFormSchema.safeParse(rawBody);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: issue?.message ?? "Data pendaftaran tidak valid." },
        { status: 400 },
      );
    }

    const { username, email, password } = parsed.data;
    await registerUser({ username, email, password });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof BadRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to register user:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuat akun." },
      { status: 500 },
    );
  }
}
