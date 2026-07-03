import { CheckCircle2, Code2, RadioTower, WalletCards } from "lucide-react";
import { Suspense } from "react";
import { AnimatedGrid } from "@/components/dashboard/AnimatedPage";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PageShell } from "@/components/dashboard/PageShell";
import { StatusCell } from "@/components/dashboard/OperationsTable";
import { MetricsSkeleton, SurfaceSkeleton } from "@/components/dashboard/Skeletons";
import { Surface } from "@/components/dashboard/Surface";
import { Button } from "@/components/ui/button";
import { getApiKeys, getOnboardingChecklist } from "@/lib/api/dashboard";

export const metadata = {
  title: "Onboarding",
};

export default function Onboarding() {
  return (
    <PageShell
      eyebrow="Go-live readiness"
      title="Prepare Optimus Gate for production billing"
      description="Connect business profile, API keys, webhooks, and ledger settlement before switching live traffic on."
      action={
        <Button className="h-10 bg-black text-white hover:bg-zinc-900">
          Continue setup
        </Button>
      }
    >
      <Suspense fallback={<MetricsSkeleton />}>
        <OnboardingMetrics />
      </Suspense>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <Suspense fallback={<SurfaceSkeleton />}>
          <Checklist />
        </Suspense>
        <Suspense fallback={<SurfaceSkeleton />}>
          <DeveloperKeys />
        </Suspense>
      </div>
    </PageShell>
  );
}

async function OnboardingMetrics() {
  const [keys, checklist] = await Promise.all([
    getApiKeys(),
    getOnboardingChecklist(),
  ]);
  const completed = checklist.filter((item) => item.status === "completed");
  const progress = checklist.length
    ? Math.round((completed.length / checklist.length) * 100)
    : 0;
  const activeKeys = keys.filter((key) => !key.revokedAt);

  return (
    <AnimatedGrid>
      <MetricCard icon={CheckCircle2} label="Setup progress" value={`${progress}%`} tone="green" />
      <MetricCard icon={Code2} label="API keys" value={`${keys.length}`} tone="black" />
      <MetricCard icon={RadioTower} label="Active keys" value={`${activeKeys.length}`} tone="blue" />
      <MetricCard icon={WalletCards} label="Ledger mapping" value={checklist.length ? "Tracked" : "Pending"} tone="amber" />
    </AnimatedGrid>
  );
}

async function Checklist() {
  const checklist = await getOnboardingChecklist();

  return (
    <Surface title="Launch checklist" description="Fetched from the backend onboarding checklist endpoint.">
      <div className="divide-y divide-black/10">
        {checklist.length ? (
          checklist.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 px-4 py-4">
              <div>
                <p className="font-black text-black">{item.title}</p>
                <p className="mt-1 text-sm text-zinc-500">{item.description}</p>
              </div>
              <StatusCell status={item.status} />
            </div>
          ))
        ) : (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-black text-black">No onboarding checklist yet</p>
            <p className="mt-1 text-sm text-zinc-500">
              Backend readiness tasks will appear here when configured.
            </p>
          </div>
        )}
      </div>
    </Surface>
  );
}

async function DeveloperKeys() {
  const keys = await getApiKeys();

  return (
    <Surface title="Developer keys" description="Fetched from the backend /api-keys endpoint.">
      <div className="divide-y divide-black/10">
        {keys.length ? (
          keys.map((key) => (
            <div key={key.id} className="px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-black text-black">{key.name}</p>
                <StatusCell status={key.revokedAt ? "revoked" : "active"} />
              </div>
              <p className="mt-1 font-mono text-xs text-zinc-500">{key.prefix}</p>
              <p className="mt-2 text-xs text-zinc-500">{key.scopes.join(", ")}</p>
            </div>
          ))
        ) : (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-black text-black">No API keys yet</p>
            <p className="mt-1 text-sm text-zinc-500">
              Create one from Settings to start checkout integrations.
            </p>
          </div>
        )}
      </div>
    </Surface>
  );
}
