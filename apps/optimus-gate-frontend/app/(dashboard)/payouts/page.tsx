import { Banknote, Clock3, Send, Wallet } from "lucide-react";
import { Suspense } from "react";
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
import { Button } from "@/components/ui/button";
import { getPayouts } from "@/lib/api/dashboard";
import type { PayoutRecord } from "@/lib/api/types";
import { formatNaira } from "@/lib/format";

export const metadata = {
  title: "Payouts",
};

export default function PayoutPage() {
  return (
    <PageShell
      eyebrow="Settlement"
      title="Payout batches from ledger to bank"
      description="Manage settlement batches, failed bank transfers, and scheduled payouts from available balances."
      action={
        <Button className="h-10 bg-black text-white hover:bg-zinc-900">
          <Send className="size-4" />
          Request payout
        </Button>
      }
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
  const payouts = await getPayouts();
  const settled = payouts.filter((row) => row.status === "settled");
  const scheduled = payouts.filter((row) => row.status === "scheduled");
  const failed = payouts.filter((row) => row.status === "failed");
  const available = payouts.reduce((sum, row) => sum + row.amount, 0);
  const settledVolume = settled.reduce((sum, row) => sum + row.amount, 0);
  const scheduledVolume = scheduled.reduce((sum, row) => sum + row.amount, 0);
  const failedVolume = failed.reduce((sum, row) => sum + row.amount, 0);

  return (
    <AnimatedGrid>
      <MetricCard icon={Wallet} label="Available balance" value={formatNaira(available)} tone="green" />
      <MetricCard icon={Banknote} label="Settled" value={formatNaira(settledVolume)} tone="blue" />
      <MetricCard icon={Clock3} label="Scheduled" value={formatNaira(scheduledVolume)} tone="amber" />
      <MetricCard icon={Send} label="Failed batch" value={formatNaira(failedVolume)} tone="red" />
    </AnimatedGrid>
  );
}

async function PayoutTable() {
  const payouts = await getPayouts();
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
    { key: "entries", header: "Ledger entries", align: "right" },
    { key: "eta", header: "ETA" },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusCell status={row.status} />,
    },
  ];

  return (
    <Surface title="Payout batches" description="Fetched from the backend /billing/payouts endpoint.">
      <OperationsTable
        rows={payouts}
        columns={columns}
        emptyTitle="No payout batches yet"
        emptyDescription="Backend settlement batches will appear here."
      />
    </Surface>
  );
}
