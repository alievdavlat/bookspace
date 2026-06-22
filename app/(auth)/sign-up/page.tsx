import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create account · Bookspace" };

export default function SignUpPage() {
  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-1 font-serif text-3xl font-semibold">Join Bookspace</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Create a free account to read, write and share.
      </p>
      <AuthForm mode="sign-up" />
    </div>
  );
}
