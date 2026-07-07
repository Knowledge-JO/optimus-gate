import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthFormSkeleton } from "@/components/auth/AuthFormSkeleton";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import { getCurrentUser } from "@/lib/auth/api";

export const metadata: Metadata = {
  title: "Verify Email",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ token }, user] = await Promise.all([searchParams, getCurrentUser()]);

  if (user?.isEmailVerified) redirect("/overview");

  return (
    <AuthCard
      title="Verify your email"
      description="Confirm your email address before opening the dashboard."
      footerText="Already verified?"
      footerHref="/login"
      footerLinkText="Sign in"
    >
      <Suspense fallback={<AuthFormSkeleton />}>
        <VerifyEmailForm token={token} canResend={Boolean(user)} />
      </Suspense>
    </AuthCard>
  );
}
