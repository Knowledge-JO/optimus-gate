import {
  Activity,
  AlertTriangle,
  Banknote,
  Repeat2,
  Wallet,
} from "lucide-react";
import { Suspense } from "react";
import { AnimatedGrid } from "@/components/dashboard/AnimatedPage";
import { BrandBars } from "@/components/dashboard/BrandBars";
import { MetricCard } from "@/components/dashboard/MetricCard";
import {
  OperationsTable,
  StatusCell,
  type OperationsColumn,
} from "@/components/dashboard/OperationsTable";
import { PageShell } from "@/components/dashboard/PageShell";
import { MetricsSkeleton, SurfaceSkeleton } from "@/components/dashboard/Skeletons";
import { Surface } from "@/components/dashboard/Surface";
import {
  getDashboardMetrics,
  getSubscriptions,
  getTransactions,
} from "@/lib/api/dashboard";
import type { TransactionRecord } from "@/lib/api/types";
import { formatNaira } from "@/lib/format";

export const metadata = {
  title: "Overview",
};

export default function Home() {
  return (
    <PageShell
      eyebrow="Operations cockpit"
      title="Revenue, renewals, and settlement at a glance"
      description="Monitor recurring billing health, ledger liquidity, checkout attempts, and settlement pressure from one command surface."
    >
      <Suspense fallback={<MetricsSkeleton />}>
        <OverviewMetrics />
      </Suspense>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Suspense fallback={<SurfaceSkeleton />}>
          <RevenuePulse />
        </Suspense>
        <Suspense fallback={<SurfaceSkeleton />}>
          <RenewalQueue />
        </Suspense>
      </div>

      <Suspense fallback={<SurfaceSkeleton />}>
        <LatestMoneyMovement />
      </Suspense>
    </PageShell>
  );
}

async function OverviewMetrics() {
  const metrics = await getDashboardMetrics();
  const icons = [Repeat2, Wallet, AlertTriangle, Activity];

  return (
    <AnimatedGrid>
      {metrics.length ? (
        metrics.map((metric, index) => (
          <MetricCard key={metric.label} icon={icons[index] ?? Activity} {...metric} />
        ))
      ) : (
        <>
          <MetricCard icon={Repeat2} label="Subscriptions" value="0" tone="black" />
          <MetricCard icon={Wallet} label="Available balance" value={formatNaira(0)} tone="green" />
          <MetricCard icon={AlertTriangle} label="Past due" value={formatNaira(0)} tone="amber" />
          <MetricCard icon={Activity} label="Success rate" value="0%" tone="blue" />
        </>
      )}
    </AnimatedGrid>
  );
}

async function RevenuePulse() {
  const transactions = await getTransactions();
  const revenueSeries = transactions
    .filter((transaction) => transaction.status.toLowerCase() === "succeeded")
    .slice(0, 12)
    .map((transaction) => transaction.amount);
  const totalVolume = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );

  return (
    <Surface
      title="Recurring revenue pulse"
      description="Backend transaction volume across checkout and renewal events."
    >
      <div className="p-4">
        <BrandBars values={revenueSeries} />
        <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
          <span>First record</span>
          <span className="font-mono text-black">{formatNaira(totalVolume)} volume</span>
          <span>Latest record</span>
        </div>
      </div>
    </Surface>
  );
}

async function RenewalQueue() {
  const subscriptions = await getSubscriptions();
  const nextSubscriptions = subscriptions.slice(0, 3);

  return (
    <Surface title="Renewal queue" description="Subscriptions needing action.">
      <div className="divide-y divide-black/10">
        {nextSubscriptions.length ? (
          nextSubscriptions.map((subscription) => (
            <div key={subscription.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-black text-black">
                  {subscription.customer}
                </p>
                <p className="text-xs text-zinc-500">
                  {subscription.plan} · {subscription.nextCharge}
                </p>
              </div>
              <StatusCell status={subscription.status} />
            </div>
          ))
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-sm font-black text-black">No renewals yet</p>
            <p className="mt-1 text-sm text-zinc-500">
              Backend subscriptions will appear here when available.
            </p>
          </div>
        )}
      </div>
    </Surface>
  );
}

async function LatestMoneyMovement() {
  const transactions = await getTransactions();
  const columns: OperationsColumn<TransactionRecord>[] = [
    {
      key: "reference",
      header: "Reference",
      render: (row) => <span className="font-mono text-black">{row.reference}</span>,
    },
    { key: "customer", header: "Customer" },
    { key: "type", header: "Type" },
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
      title="Latest money movement"
      description="Recent checkout orders, renewals, and payment attempts."
      action={<Banknote className="size-4 text-zinc-500" />}
    >
      <OperationsTable
        rows={transactions}
        columns={columns}
        emptyTitle="No money movement yet"
        emptyDescription="Backend payment attempts and transactions will appear here."
      />
    </Surface>
  );
}
