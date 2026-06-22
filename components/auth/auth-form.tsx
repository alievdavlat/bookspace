"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp, type AuthState } from "@/lib/actions/auth";

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
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-sm">
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
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
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
