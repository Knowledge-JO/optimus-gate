"use client";

import { useActionState } from "react";
import { signupAction } from "@/lib/auth/actions";
import type { AuthActionState } from "@/lib/auth/types";
import { AuthField } from "./AuthField";
import { AuthMessage } from "./AuthMessage";
import { AuthSubmitButton } from "./AuthSubmitButton";

const initialState: AuthActionState = { status: "idle" };

export function SignupForm() {
  const [state, formAction] = useActionState(signupAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <AuthMessage state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <AuthField
          label="First name"
          name="firstName"
          placeholder="Ada"
          autoComplete="given-name"
          error={state.fieldErrors?.firstName}
        />
        <AuthField
          label="Last name"
          name="lastName"
          placeholder="Okafor"
          autoComplete="family-name"
          error={state.fieldErrors?.lastName}
        />
      </div>
      <AuthField
        label="Email"
        name="email"
        type="email"
        placeholder="you@company.com"
        autoComplete="email"
        error={state.fieldErrors?.email}
        required
      />
      <AuthField
        label="Password"
        name="password"
        type="password"
        placeholder="Create a password"
        autoComplete="new-password"
        error={state.fieldErrors?.password}
        required
      />
      <AuthSubmitButton pendingText="Creating account...">
        Create account
      </AuthSubmitButton>
    </form>
  );
}
