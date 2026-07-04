import { KeyRound, LockKeyhole, RadioTower, ShieldCheck } from "lucide-react";
import { Suspense } from "react";
import { AnimatedGrid } from "@/components/dashboard/AnimatedPage";
import { CreateApiKeyForm } from "@/components/dashboard/forms/CreateApiKeyForm";
import { MetricCard } from "@/components/dashboard/MetricCard";
import {
  OperationsTable,
  StatusCell,
  type OperationsColumn,
} from "@/components/dashboard/OperationsTable";
import { PageShell } from "@/components/dashboard/PageShell";
import { MetricsSkeleton, SurfaceSkeleton } from "@/components/dashboard/Skeletons";
import { Surface } from "@/components/dashboard/Surface";
import { getApiKeys } from "@/lib/api/dashboard";
import type { ApiKeyRecord } from "@/lib/api/types";

export const metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <PageShell
      eyebrow="Developer settings"
      title="API keys and integration controls"
      description="Create scoped keys for checkout starts, subscription reads, and future backend integrations. New secrets are shown once."
    >
      <Suspense fallback={<MetricsSkeleton />}>
        <SettingsMetrics />
      </Suspense>

      <div className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,1fr)_minmax(24rem,28rem)]">
        <Suspense fallback={<SurfaceSkeleton />}>
          <ApiKeysTable />
        </Suspense>

        <Surface
          title="Create API key"
          description="Calls the backend /api-keys endpoint with your current session."
          className="min-w-0"
        >
          <div className="p-4">
            <CreateApiKeyForm />
          </div>
        </Surface>
      </div>
    </PageShell>
  );
}

async function SettingsMetrics() {
  const keys = await getApiKeys();
  const active = keys.filter((key) => !key.revokedAt);
  const live = keys.filter((key) => key.environment === "live" && !key.revokedAt);

  return (
    <AnimatedGrid>
      <MetricCard icon={KeyRound} label="API keys" value={`${keys.length}`} tone="black" />
      <MetricCard icon={ShieldCheck} label="Active keys" value={`${active.length}`} tone="green" />
      <MetricCard icon={LockKeyhole} label="Live keys" value={`${live.length}`} tone="blue" />
      <MetricCard icon={RadioTower} label="Revoked keys" value={`${keys.length - active.length}`} tone="amber" />
    </AnimatedGrid>
  );
}

async function ApiKeysTable() {
  const keys = await getApiKeys();
  const columns: OperationsColumn<ApiKeyRecord>[] = [
    { key: "name", header: "Name" },
    {
      key: "prefix",
      header: "Prefix",
      render: (row) => <span className="font-mono text-black">{row.prefix}</span>,
    },
    {
      key: "environment",
      header: "Environment",
      render: (row) => <StatusCell status={row.environment} />,
    },
    {
      key: "scopes",
      header: "Scopes",
      render: (row) => (
        <span className="text-xs text-zinc-500">{row.scopes.join(", ")}</span>
      ),
    },
    {
      key: "lastUsedAt",
      header: "Last used",
      render: (row) => row.lastUsedAt ?? "Never",
    },
    {
      key: "revokedAt",
      header: "Status",
      render: (row) => <StatusCell status={row.revokedAt ? "revoked" : "active"} />,
    },
  ];

  return (
    <Surface
      title="API keys"
      description="Fetched from the backend /api-keys endpoint."
      className="min-w-0"
    >
      <OperationsTable
        rows={keys}
        columns={columns}
        emptyTitle="No API keys yet"
        emptyDescription="Create a backend API key to start integrating checkout."
      />
    </Surface>
  );
}
