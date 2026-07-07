"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  confirmEmailVerificationAction,
  resendEmailVerificationAction,
} from "@/lib/auth/actions";
import type { AuthActionState } from "@/lib/auth/types";
import { AuthMessage } from "./AuthMessage";
import { AuthSubmitButton } from "./AuthSubmitButton";

const initialState: AuthActionState = { status: "idle" };

export function VerifyEmailForm({
  token,
  canResend,
}: {
  token?: string;
  canResend: boolean;
}) {
  const [confirmState, confirmAction] = useActionState(
    confirmEmailVerificationAction,
    initialState,
  );
  const [resendState, resendAction] = useActionState(
    resendEmailVerificationAction,
    initialState,
  );
  const verified = confirmState.status === "success";

  return (
    <div className="space-y-5">
      <AuthMessage state={confirmState} />
      <AuthMessage state={resendState} />

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
        Check your email for the verification link. You can resend the email if
        the link is missing or expired.
      </div>

      {token && !verified && (
        <form action={confirmAction} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <AuthSubmitButton pendingText="Verifying email...">
            Verify email
          </AuthSubmitButton>
        </form>
      )}

      {!verified && canResend && (
        <form action={resendAction}>
          <AuthSubmitButton pendingText="Sending email...">
            Resend verification email
          </AuthSubmitButton>
        </form>
      )}

      {!verified && !canResend && (
        <p className="text-center text-sm text-slate-500">
          Sign in to resend your verification email.
        </p>
      )}

      {verified && (
        <p className="text-center text-sm text-slate-500">
          Ready to continue?{" "}
          <Link href="/overview" className="font-semibold text-slate-950">
            Open dashboard
          </Link>
        </p>
      )}
    </div>
  );
}
