import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthFormSkeleton } from "@/components/auth/AuthFormSkeleton";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      description="Enter your email and we will send password recovery instructions if the account exists."
    >
      <Suspense fallback={<AuthFormSkeleton />}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
