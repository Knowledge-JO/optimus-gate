"use server";

import { redirect } from "next/navigation";
import * as authApi from "./api";
import { clearAuthCookies, setAuthCookies } from "./cookies";
import {
  confirmEmailVerificationSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "./schemas";
import type { AuthActionState } from "./types";

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  let redirectTo = "/overview";

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  try {
    const auth = await authApi.login(parsed.data);
    await setAuthCookies(auth);
    redirectTo = auth.user.isEmailVerified ? "/overview" : "/verify-email";
  } catch (error) {
    return actionError(error, "Unable to log in. Check your credentials.");
  }

  redirect(redirectTo);
}

export async function signupAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  let redirectTo = "/verify-email";

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  try {
    const auth = await authApi.signup(parsed.data);
    await setAuthCookies(auth);
    redirectTo = auth.user.isEmailVerified ? "/overview" : "/verify-email";
  } catch (error) {
    return actionError(error, "Unable to create your account.");
  }

  redirect(redirectTo);
}

export async function forgotPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  try {
    const result = await authApi.forgotPassword(parsed.data);
    return {
      status: "success",
      message: result.message,
      resetToken: result.resetToken,
    };
  } catch (error) {
    return actionError(error, "Unable to start password recovery.");
  }
}

export async function resetPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  try {
    const result = await authApi.resetPassword(parsed.data);
    return {
      status: "success",
      message: result.message,
    };
  } catch (error) {
    return actionError(error, "Unable to reset your password.");
  }
}

export async function resendEmailVerificationAction(
  _previousState: AuthActionState,
): Promise<AuthActionState> {
  void _previousState;

  try {
    const result = await authApi.resendEmailVerification();
    return {
      status: "success",
      message: result.message,
      verificationToken: result.verificationToken,
    };
  } catch (error) {
    return actionError(error, "Unable to resend verification email.");
  }
}

export async function confirmEmailVerificationAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = confirmEmailVerificationSchema.safeParse(
    Object.fromEntries(formData),
  );

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  try {
    const result = await authApi.confirmEmailVerification(parsed.data);
    return {
      status: "success",
      message: result.message,
    };
  } catch (error) {
    return actionError(error, "Unable to verify your email.");
  }
}

export async function logoutAction() {
  try {
    await authApi.logout();
  } catch {
    // Local session cleanup should still happen if the backend session is gone.
  }

  await clearAuthCookies();
  redirect("/login");
}

function validationError(
  fieldErrors: Record<string, string[] | undefined>,
): AuthActionState {
  return {
    status: "error",
    message: "Please fix the highlighted fields.",
    fieldErrors: Object.fromEntries(
      Object.entries(fieldErrors).filter(
        (entry): entry is [string, string[]] => Boolean(entry[1]?.length),
      ),
    ),
  };
}

function actionError(error: unknown, fallback: string): AuthActionState {
  return {
    status: "error",
    message: error instanceof Error ? error.message : fallback,
  };
}
