import { redirect } from "next/navigation";
import { auth } from "@/lib/next-auth";
import SignInForm from "./sign-in-form";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4 py-10">
      <div className="w-full max-w-sm">
        <SignInForm />
      </div>
    </div>
  );
}
