import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthFormSkeleton } from "@/components/auth/AuthFormSkeleton";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthCard
      title="Choose a new password"
      description="Paste your reset token and create a new password for your account."
    >
      <Suspense fallback={<AuthFormSkeleton />}>
        <ResetPasswordForm token={token} />
      </Suspense>
    </AuthCard>
  );
}
