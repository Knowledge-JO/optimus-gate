import { Activity, CheckCircle2, Clock3, XCircle } from "lucide-react";
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
import { getTransactions } from "@/lib/api/dashboard";
import type { TransactionRecord } from "@/lib/api/types";
import { formatNaira } from "@/lib/format";

export const metadata = {
  title: "Transactions",
};

export default function Transactions() {
  return (
    <PageShell
      eyebrow="Checkout stream"
      title="Transactions across checkouts and renewals"
      description="Observe every provider reference, payment attempt, renewal charge, and checkout order as it moves through the system."
    >
      <Suspense fallback={<MetricsSkeleton />}>
        <TransactionMetrics />
      </Suspense>
      <Suspense fallback={<SurfaceSkeleton />}>
        <TransactionTable />
      </Suspense>
    </PageShell>
  );
}

async function TransactionMetrics() {
  const transactions = await getTransactions();
  const succeeded = transactions.filter((row) => row.status === "succeeded");
  const processing = transactions.filter((row) => row.status === "processing");
  const failed = transactions.filter((row) => row.status === "failed");
  const totalVolume = transactions.reduce((sum, row) => sum + row.amount, 0);

  return (
    <AnimatedGrid>
      <MetricCard icon={Activity} label="Total volume" value={formatNaira(totalVolume)} tone="black" />
      <MetricCard icon={CheckCircle2} label="Succeeded" value={`${succeeded.length}`} tone="green" />
      <MetricCard icon={Clock3} label="Processing" value={`${processing.length}`} tone="amber" />
      <MetricCard icon={XCircle} label="Failed" value={`${failed.length}`} tone="red" />
    </AnimatedGrid>
  );
}

async function TransactionTable() {
  const transactions = await getTransactions();
  const columns: OperationsColumn<TransactionRecord>[] = [
    {
      key: "reference",
      header: "Reference",
      render: (row) => <span className="font-mono text-black">{row.reference}</span>,
    },
    { key: "customer", header: "Customer" },
    { key: "type", header: "Type" },
    { key: "provider", header: "Provider" },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (row) => <span className="font-black">{formatNaira(row.amount)}</span>,
    },
    { key: "date", header: "Date" },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusCell status={row.status} />,
    },
  ];

  return (
    <Surface title="Transaction feed" description="Fetched from the backend /billing/transactions endpoint.">
      <OperationsTable
        rows={transactions}
        columns={columns}
        emptyTitle="No transactions yet"
        emptyDescription="Backend checkout and renewal payments will appear here."
      />
    </Surface>
  );
}
