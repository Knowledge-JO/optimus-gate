import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthFormSkeleton } from "@/components/auth/AuthFormSkeleton";
import { SignupForm } from "@/components/auth/SignupForm";
import { getCurrentUser } from "@/lib/auth/api";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/overview");

  return (
    <AuthCard
      title="Create your account"
      description="Set up secure access for your Optimus Gate dashboard."
      footerText="Already have an account?"
      footerHref="/login"
      footerLinkText="Sign in"
    >
      <Suspense fallback={<AuthFormSkeleton />}>
        <SignupForm />
      </Suspense>
    </AuthCard>
  );
}
