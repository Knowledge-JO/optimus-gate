import { Banknote, Clock3, Send, Wallet } from "lucide-react";
import { Suspense } from "react";
import { ActionDialog } from "@/components/dashboard/ActionDialog";
import { AnimatedGrid } from "@/components/dashboard/AnimatedPage";
import { MetricCard } from "@/components/dashboard/MetricCard";
import {
  OperationsTable,
  StatusCell,
  type OperationsColumn,
} from "@/components/dashboard/OperationsTable";
import { PageShell } from "@/components/dashboard/PageShell";
import { MetricsSkeleton, SurfaceSkeleton } from "@/components/dashboard/Skeletons";
import { Surface } from "@/components/dashboard/Surface";
import { PayoutRequestForm } from "@/components/payouts/PayoutRequestForm";
import {
  getDashboardMetrics,
  getPayoutBankAccounts,
  getPayouts,
} from "@/lib/api/dashboard";
import type { PayoutRecord } from "@/lib/api/types";
import { formatDate, formatNaira } from "@/lib/format";

export const metadata = {
  title: "Payouts",
};

export default function PayoutPage() {
  return (
    <PageShell
      eyebrow="Settlement"
      title="Payout batches from ledger to bank"
      description="Manage settlement batches, failed bank transfers, and scheduled payouts from available balances."
    >
      <Suspense fallback={<MetricsSkeleton />}>
        <PayoutMetrics />
      </Suspense>
      <Suspense fallback={<SurfaceSkeleton />}>
        <PayoutTable />
      </Suspense>
    </PageShell>
  );
}

async function PayoutMetrics() {
  const [payouts, metrics] = await Promise.all([
    getPayouts(),
    getDashboardMetrics(),
  ]);
  const settled = payouts.filter((row) => row.status === "succeeded");
  const processing = payouts.filter((row) => row.status === "processing");
  const failed = payouts.filter((row) => row.status === "failed");
  const available =
    metrics.find((metric) => metric.label === "Available balance")?.value ??
    formatNaira(0);
  const settledVolume = settled.reduce((sum, row) => sum + row.amount, 0);
  const processingVolume = processing.reduce((sum, row) => sum + row.amount, 0);
  const failedVolume = failed.reduce((sum, row) => sum + row.amount, 0);

  return (
    <AnimatedGrid>
      <MetricCard icon={Wallet} label="Available balance" value={available} tone="green" />
      <MetricCard icon={Banknote} label="Settled" value={formatNaira(settledVolume)} tone="blue" />
      <MetricCard icon={Clock3} label="Processing" value={formatNaira(processingVolume)} tone="amber" />
      <MetricCard icon={Send} label="Failed batch" value={formatNaira(failedVolume)} tone="red" />
    </AnimatedGrid>
  );
}

async function PayoutTable() {
  const [payouts, bankAccounts] = await Promise.all([
    getPayouts(),
    getPayoutBankAccounts(),
  ]);
  const columns: OperationsColumn<PayoutRecord>[] = [
    {
      key: "batch",
      header: "Batch",
      render: (row) => <span className="font-mono text-black">{row.batch}</span>,
    },
    { key: "account", header: "Destination" },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (row) => <span className="font-black">{formatNaira(row.amount)}</span>,
    },
    {
      key: "eta",
      header: "Updated",
      render: (row) => formatDate(row.eta),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusCell status={row.status} />,
    },
    {
      key: "failureReason",
      header: "Failure",
      render: (row) => row.failureReason ?? "",
    },
  ];

  return (
    <Surface
      title="Payout batches"
      description="Fetched from the backend /billing/payouts endpoint."
      action={
        <ActionDialog
          triggerLabel="Request payout"
          title="Request payout"
          description="Send available ledger balance to a saved bank account."
        >
          <PayoutRequestForm bankAccounts={bankAccounts} />
        </ActionDialog>
      }
    >
      <OperationsTable
        rows={payouts}
        columns={columns}
        emptyTitle="No payout batches yet"
        emptyDescription="Backend settlement batches will appear here."
      />
    </Surface>
  );
}
