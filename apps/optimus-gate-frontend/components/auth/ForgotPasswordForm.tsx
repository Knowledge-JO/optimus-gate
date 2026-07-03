"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordAction } from "@/lib/auth/actions";
import type { AuthActionState } from "@/lib/auth/types";
import { AuthField } from "./AuthField";
import { AuthMessage } from "./AuthMessage";
import { AuthSubmitButton } from "./AuthSubmitButton";

const initialState: AuthActionState = { status: "idle" };

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(
    forgotPasswordAction,
    initialState,
  );

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
      <AuthSubmitButton pendingText="Sending reset link...">
        Send reset link
      </AuthSubmitButton>
      <p className="text-center text-sm text-slate-500">
        Remembered your password?{" "}
        <Link href="/login" className="font-semibold text-slate-950">
          Sign in
        </Link>
      </p>
    </form>
  );
}
