"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  signIn,
  signUp,
  signInWithGoogle,
  type AuthState,
} from "@/lib/actions/auth";

const initial: AuthState = {};

export function AuthForm({
  mode,
  redirectTo = "/dashboard",
}: {
  mode: "sign-in" | "sign-up";
  redirectTo?: string;
}) {
  const action = mode === "sign-in" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <div className="w-full max-w-sm">
      <form action={signInWithGoogle} className="mb-4">
        <Button type="submit" variant="outline" className="w-full">
          Continue with Google
        </Button>
      </form>

      <div className="relative my-4 text-center text-xs text-muted-foreground">
        <span className="relative z-10 bg-background px-2">or with email</span>
        <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="redirect" value={redirectTo} />

        {mode === "sign-up" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" placeholder="reader" required minLength={3} />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required minLength={6} />
        </div>

        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state.message && <p className="text-sm text-green">{state.message}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending
            ? "Please wait…"
            : mode === "sign-in"
              ? "Log in"
              : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "sign-in" ? (
          <>
            New to Bookspace?{" "}
            <Link href="/sign-up" className="text-primary hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary hover:underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
