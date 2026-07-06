import {
  KeyRound,
  LockKeyhole,
  RadioTower,
  ShieldCheck,
  Star,
  Trash2,
} from "lucide-react";
import { Suspense } from "react";
import { ActionDialog } from "@/components/dashboard/ActionDialog";
import { AnimatedGrid } from "@/components/dashboard/AnimatedPage";
import { CreateApiKeyForm } from "@/components/dashboard/forms/CreateApiKeyForm";
import { MetricCard } from "@/components/dashboard/MetricCard";
import {
  OperationsTable,
  StatusCell,
  type OperationsColumn,
} from "@/components/dashboard/OperationsTable";
import { PageShell } from "@/components/dashboard/PageShell";
import {
  MetricsSkeleton,
  SurfaceSkeleton,
} from "@/components/dashboard/Skeletons";
import { Surface } from "@/components/dashboard/Surface";
import { Button } from "@/components/ui/button";
import { PayoutBankAccountForm } from "@/components/payouts/PayoutBankAccountForm";
import {
  deletePayoutBankAccountAction,
  setDefaultPayoutBankAccountAction,
} from "@/lib/api/actions";
import {
  getApiKeys,
  getPayoutBankAccounts,
  getPayoutBanks,
} from "@/lib/api/dashboard";
import type { ApiKeyRecord, PayoutBankAccountRecord } from "@/lib/api/types";

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

      <Suspense fallback={<SurfaceSkeleton />}>
        <ApiKeysTable />
      </Suspense>

      <Suspense fallback={<SurfaceSkeleton />}>
        <PayoutBankAccountsTable />
      </Suspense>
    </PageShell>
  );
}

async function SettingsMetrics() {
  const keys = await getApiKeys();
  const active = keys.filter((key) => !key.revokedAt);
  const live = keys.filter(
    (key) => key.environment === "live" && !key.revokedAt,
  );

  return (
    <AnimatedGrid>
      <MetricCard
        icon={KeyRound}
        label="API keys"
        value={`${keys.length}`}
        tone="black"
      />
      <MetricCard
        icon={ShieldCheck}
        label="Active keys"
        value={`${active.length}`}
        tone="green"
      />
      <MetricCard
        icon={LockKeyhole}
        label="Live keys"
        value={`${live.length}`}
        tone="blue"
      />
      <MetricCard
        icon={RadioTower}
        label="Revoked keys"
        value={`${keys.length - active.length}`}
        tone="amber"
      />
    </AnimatedGrid>
  );
}

async function PayoutBankAccountsTable() {
  const [accounts, banks] = await Promise.all([
    getPayoutBankAccounts(),
    getPayoutBanks(),
  ]);
  const columns: OperationsColumn<PayoutBankAccountRecord>[] = [
    {
      key: "accountName",
      header: "Account",
      render: (row) => (
        <div className="min-w-0">
          <p className="font-semibold text-black">{row.accountName}</p>
          <p className="text-xs text-zinc-500">
            {row.bankName ?? row.bankCode} · {row.accountNumber}
          </p>
        </div>
      ),
    },
    {
      key: "isDefault",
      header: "Default",
      render: (row) => (
        <StatusCell status={row.isDefault ? "default" : "saved"} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          {!row.isDefault && (
            <form action={setDefaultPayoutBankAccountAction}>
              <input type="hidden" name="bankAccountId" value={row.id} />
              <Button variant="outline" size="sm" type="submit">
                <Star className="size-3.5" />
                Default
              </Button>
            </form>
          )}
          <form action={deletePayoutBankAccountAction}>
            <input type="hidden" name="bankAccountId" value={row.id} />
            <Button variant="destructive" size="sm" type="submit">
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          </form>
        </div>
      ),
    },
  ];

  return (
    <Surface
      title="Payout bank accounts"
      description="Saved bank accounts are available on the payout page."
      className="min-w-0"
      action={
        <ActionDialog
          triggerLabel="Add bank"
          title="Add payout bank"
          description="Verify a Nigerian bank account before saving it."
          closeOnOutsideInteract={false}
        >
          <PayoutBankAccountForm banks={banks} />
        </ActionDialog>
      }
    >
      <OperationsTable
        rows={accounts}
        columns={columns}
        emptyTitle="No payout bank accounts yet"
        emptyDescription="Add a verified Nigerian bank account for business payouts."
      />
    </Surface>
  );
}

async function ApiKeysTable() {
  const keys = await getApiKeys();
  const columns: OperationsColumn<ApiKeyRecord>[] = [
    { key: "name", header: "Name" },
    {
      key: "prefix",
      header: "Prefix",
      render: (row) => (
        <span className="font-mono text-black">{row.prefix}</span>
      ),
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
      render: (row) => (
        <StatusCell status={row.revokedAt ? "revoked" : "active"} />
      ),
    },
  ];

  return (
    <Surface
      title="API keys"
      description="Fetched from the backend /api-keys endpoint."
      className="min-w-0"
      action={
        <ActionDialog
          triggerLabel="Create key"
          title="Create API key"
          description="New secrets are shown once."
        >
          <CreateApiKeyForm />
        </ActionDialog>
      }
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
