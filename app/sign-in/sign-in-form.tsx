"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<"sign-in" | "register">("sign-in");
  const isRegister = mode === "register";
  const title = useMemo(
    () => (isRegister ? "Create your account" : "Sign in"),
    [isRegister],
  );
  const subtitle = useMemo(
    () =>
      isRegister
        ? "Enter your email below to create your account"
        : "Masuk menggunakan kredensial yang sudah terdaftar",
    [isRegister],
  );

  useEffect(() => {
    const reason = params.get("error");
    if (!reason) return;

    if (reason === "unauthenticated") {
      setError("Silakan masuk terlebih dahulu untuk mengakses halaman tersebut.");
      return;
    }

    if (reason === "CredentialsSignin") {
      setError("Email atau password tidak sesuai.");
      return;
    }

    setError(null);
  }, [params]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const username =
      typeof formData.get("username") === "string"
        ? String(formData.get("username")).trim()
        : "";
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword =
      typeof formData.get("confirmPassword") === "string"
        ? String(formData.get("confirmPassword"))
        : "";

    if (isRegister && password !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      setIsSubmitting(false);
      return;
    }

    if (isRegister && !username) {
      setError("Username wajib diisi.");
      setIsSubmitting(false);
      return;
    }

    let shouldResetSubmitting = true;

    try {
      if (isRegister) {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
            confirmPassword,
          }),
        });

        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        if (!response.ok) {
          setError(payload?.error ?? "Gagal membuat akun baru.");
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Email atau password tidak sesuai.");
        return;
      }

      shouldResetSubmitting = false;
      router.replace(result?.url ?? callbackUrl);
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign in";
      setError(message);
    } finally {
      if (shouldResetSubmitting) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xl ring-1 ring-black/5">
      <div className="space-y-4 text-center">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={96}
          height={96}
          priority
          className="mx-auto h-24 w-24 rounded-full object-cover"
        />
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        {isRegister && (
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-semibold text-gray-900">
              Full Name
            </label>
            <Input
              type="text"
              id="username"
              name="username"
              required
              autoComplete="username"
              placeholder="John Doe"
              className="rounded-lg"
            />
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-gray-900">
            Email
          </label>
            <Input
              type="email"
              id="email"
              name="email"
              required
              autoComplete="email"
              placeholder="email"
              className="rounded-lg"
            />
          </div>

        {!isRegister && (
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-gray-900">
              Password
            </label>
            <Input
              type="password"
              id="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="Password"
              className="rounded-lg"
            />
          </div>
        )}

        {isRegister && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-gray-900">
                  Password
                </label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  required
                  autoComplete="new-password"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-900">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  autoComplete="new-password"
                  className="rounded-lg"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500">Must be at least 8 characters long.</p>
          </>
        )}

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full rounded-xl bg-purple-600 text-white shadow hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          size="lg"
          isLoading={isSubmitting}
          loadingText={isRegister ? "Create Account" : "Login"}
          showLoadingText
          disabled={isSubmitting}
        >
          {isRegister ? "Create Account" : "Login"}
        </Button>

        <p className="text-center text-sm text-gray-600">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode((prev) => (prev === "sign-in" ? "register" : "sign-in"));
              setError(null);
            }}
            className="font-semibold text-gray-900 underline-offset-4 hover:underline"
          >
            {isRegister ? "Sign in" : "Sign up"}
          </button>
        </p>
      </form>
    </div>
  );
}
