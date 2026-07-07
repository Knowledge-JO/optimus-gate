import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthFormSkeleton } from "@/components/auth/AuthFormSkeleton";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth/api";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.isEmailVerified ? "/overview" : "/verify-email");

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to manage your Optimus Gate merchant operations."
      footerText="New to Optimus Gate?"
      footerHref="/signup"
      footerLinkText="Create an account"
    >
      <Suspense fallback={<AuthFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
