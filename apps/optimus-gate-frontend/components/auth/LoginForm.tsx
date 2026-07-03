"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/lib/auth/actions";
import type { AuthActionState } from "@/lib/auth/types";
import { AuthField } from "./AuthField";
import { AuthMessage } from "./AuthMessage";
import { AuthSubmitButton } from "./AuthSubmitButton";

const initialState: AuthActionState = { status: "idle" };

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <AuthMessage state={state} />
      <AuthField
        label="Email"
        name="email"
        type="email"
        placeholder="you@company.com"
        autoComplete="email"
        error={state.fieldErrors?.email}
        required
      />
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-slate-950 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <AuthField
          label=""
          name="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={state.fieldErrors?.password}
          required
        />
      </div>
      <AuthSubmitButton pendingText="Signing in...">Sign in</AuthSubmitButton>
    </form>
  );
}
