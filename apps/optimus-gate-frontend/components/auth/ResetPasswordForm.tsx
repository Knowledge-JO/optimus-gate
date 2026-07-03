"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPasswordAction } from "@/lib/auth/actions";
import type { AuthActionState } from "@/lib/auth/types";
import { AuthField } from "./AuthField";
import { AuthMessage } from "./AuthMessage";
import { AuthSubmitButton } from "./AuthSubmitButton";

const initialState: AuthActionState = { status: "idle" };

export function ResetPasswordForm({ token }: { token?: string }) {
  const [state, formAction] = useActionState(
    resetPasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <AuthMessage state={state} />
      <AuthField
        label="Reset token"
        name="token"
        placeholder="Paste your reset token"
        defaultValue={token}
        error={state.fieldErrors?.token}
        required
      />
      <AuthField
        label="New password"
        name="password"
        type="password"
        placeholder="Create a new password"
        autoComplete="new-password"
        error={state.fieldErrors?.password}
        required
      />
      <AuthSubmitButton pendingText="Resetting password...">
        Reset password
      </AuthSubmitButton>
      {state.status === "success" && (
        <p className="text-center text-sm text-slate-500">
          Ready to continue?{" "}
          <Link href="/login" className="font-semibold text-slate-950">
            Sign in
          </Link>
        </p>
      )}
    </form>
  );
}
