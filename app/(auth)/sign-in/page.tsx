import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Log in · Bookspace" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-1 font-serif text-3xl font-semibold">Welcome back</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Log in to continue reading and writing.
      </p>
      <AuthForm mode="sign-in" redirectTo={redirect ?? "/dashboard"} />
    </div>
  );
}
