import { Activity, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { Suspense } from "react";
import { AnimatedGrid } from "@/components/dashboard/AnimatedPage";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PageShell } from "@/components/dashboard/PageShell";
import { TransactionsRecordTable } from "@/components/dashboard/RecordTables";
import { MetricsSkeleton, SurfaceSkeleton } from "@/components/dashboard/Skeletons";
import { Surface } from "@/components/dashboard/Surface";
import { getTransactions } from "@/lib/api/dashboard";
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

  return (
    <Surface title="Transaction feed" description="Fetched from the backend /billing/transactions endpoint.">
      <TransactionsRecordTable
        rows={transactions}
        emptyTitle="No transactions yet"
        emptyDescription="Backend checkout and renewal payments will appear here."
      />
    </Surface>
  );
}
