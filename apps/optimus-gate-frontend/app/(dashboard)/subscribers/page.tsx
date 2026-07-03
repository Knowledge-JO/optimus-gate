import { CreditCard, Plus, ShieldCheck, UserRoundCheck, Users } from "lucide-react";
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
import { getSubscribers } from "@/lib/api/dashboard";
import type { SubscriberRecord } from "@/lib/api/types";
import { formatNaira } from "@/lib/format";

export const metadata = {
  title: "Subscribers",
};

export default function Subscribers() {
  return (
    <PageShell
      eyebrow="Customer vault"
      title="Subscribers and payment method health"
      description="Track customer identities, tokenized card coverage, lifecycle status, and revenue contribution."
      action={
        <Button className="h-10 bg-black text-white hover:bg-zinc-900">
          <Plus className="size-4" />
          Add subscriber
        </Button>
      }
    >
      <Suspense fallback={<MetricsSkeleton />}>
        <SubscriberMetrics />
      </Suspense>
      <Suspense fallback={<SurfaceSkeleton />}>
        <SubscriberTable />
      </Suspense>
    </PageShell>
  );
}

async function SubscriberMetrics() {
  const subscribers = await getSubscribers();
  const active = subscribers.filter((subscriber) => subscriber.status === "active");
  const attention = subscribers.filter((subscriber) => subscriber.status !== "active");

  return (
    <AnimatedGrid>
      <MetricCard icon={Users} label="Subscribers" value={`${subscribers.length}`} tone="black" />
      <MetricCard icon={UserRoundCheck} label="Active customers" value={`${active.length}`} tone="green" />
      <MetricCard icon={CreditCard} label="Cards on file" value={`${active.length}`} tone="blue" />
      <MetricCard icon={ShieldCheck} label="Needs attention" value={`${attention.length}`} tone="amber" />
    </AnimatedGrid>
  );
}

async function SubscriberTable() {
  const subscribers = await getSubscribers();
  const columns: OperationsColumn<SubscriberRecord>[] = [
    { key: "name", header: "Customer" },
    { key: "email", header: "Email" },
    { key: "plan", header: "Plan" },
    { key: "paymentMethod", header: "Payment method" },
    {
      key: "lifetimeValue",
      header: "Lifetime value",
      align: "right",
      render: (row) => <span className="font-black">{formatNaira(row.lifetimeValue)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusCell status={row.status} />,
    },
  ];

  return (
    <Surface title="Customer records" description="Fetched from the backend /billing/subscribers endpoint.">
      <OperationsTable
        rows={subscribers}
        columns={columns}
        emptyTitle="No subscribers yet"
        emptyDescription="Backend customer records will appear here after checkout activity."
      />
    </Surface>
  );
}
