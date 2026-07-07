import { ArrowDownLeft, CheckCircle2, Clock3, RotateCcw } from "lucide-react";
import { Suspense } from "react";
import { ActionDialog } from "@/components/dashboard/ActionDialog";
import { AnimatedGrid } from "@/components/dashboard/AnimatedPage";
import { RefundRequestForm } from "@/components/dashboard/forms/RefundRequestForm";
import { MetricCard } from "@/components/dashboard/MetricCard";
import {
  OperationsTable,
  StatusCell,
  type OperationsColumn,
} from "@/components/dashboard/OperationsTable";
import { PageShell } from "@/components/dashboard/PageShell";
import { MetricsSkeleton, SurfaceSkeleton } from "@/components/dashboard/Skeletons";
import { Surface } from "@/components/dashboard/Surface";
import { getPayoutBanks, getRefunds, getTransactions } from "@/lib/api/dashboard";
import type { RefundRecord } from "@/lib/api/types";
import { formatNaira } from "@/lib/format";

export const metadata = {
  title: "Refunds",
};

export default function Refunds() {
  return (
    <PageShell
      eyebrow="Reversals desk"
      title="Refunds, reversals, and customer credits"
      description="Track outgoing customer adjustments and protect ledger integrity across duplicate charges, downgrades, and provider reversals."
    >
      <Suspense fallback={<MetricsSkeleton />}>
        <RefundMetrics />
      </Suspense>
      <Suspense fallback={<SurfaceSkeleton />}>
        <RefundTable />
      </Suspense>
    </PageShell>
  );
}

async function RefundMetrics() {
  const refunds = await getRefunds();
  const totalVolume = refunds.reduce((sum, row) => sum + row.amount, 0);
  const processing = refunds.filter((row) => row.status === "processing");
  const completed = refunds.filter((row) => row.status === "succeeded");
  const failed = refunds.filter((row) => row.status === "failed");

  return (
    <AnimatedGrid>
      <MetricCard icon={ArrowDownLeft} label="Refund volume" value={formatNaira(totalVolume)} tone="red" />
      <MetricCard icon={Clock3} label="Processing" value={`${processing.length}`} tone="amber" />
      <MetricCard icon={CheckCircle2} label="Completed" value={`${completed.length}`} tone="green" />
      <MetricCard icon={RotateCcw} label="Failed" value={`${failed.length}`} tone="red" />
    </AnimatedGrid>
  );
}

async function RefundTable() {
  const refunds = await getRefunds();
  const transactions = await getTransactions();
  const banks = await getPayoutBanks();
  const refundableTransactions = transactions.filter(
    (transaction) => transaction.status === "succeeded",
  );
  const columns: OperationsColumn<RefundRecord>[] = [
    {
      key: "reference",
      header: "Reference",
      render: (row) => <span className="font-mono text-black">{row.reference}</span>,
    },
    {
      key: "transaction",
      header: "Transaction",
      render: (row) => <span className="font-mono">{row.transaction}</span>,
    },
    { key: "customer", header: "Customer" },
    { key: "reason", header: "Reason" },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (row) => <span className="font-black">{formatNaira(row.amount)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusCell status={row.status} />,
    },
  ];

  return (
    <Surface
      title="Refund operations"
      description="Fetched from the backend /billing/refunds endpoint."
      action={
        <ActionDialog
          title="Create refund"
          description="Refund a successful checkout or renewal payment."
          triggerLabel="Refund"
        >
          <RefundRequestForm
            banks={banks}
            transactions={refundableTransactions}
          />
        </ActionDialog>
      }
    >
      <OperationsTable
        rows={refunds}
        columns={columns}
        emptyTitle="No refunds yet"
        emptyDescription="Backend refunds and reversals will appear here."
      />
    </Surface>
  );
}
