import { Banknote, CirclePercent, Landmark, Plus } from "lucide-react";
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
import { getSubaccounts } from "@/lib/api/dashboard";
import type { SubaccountRecord } from "@/lib/api/types";
import { formatNaira } from "@/lib/format";

export const metadata = {
  title: "Subaccount",
};

export default function Subaccount() {
  return (
    <PageShell
      eyebrow="Split settlement"
      title="Subaccounts and allocation rules"
      description="Route settlement portions to operations, partners, tax accounts, and affiliate pools automatically."
      action={
        <Button className="h-10 bg-black text-white hover:bg-zinc-900">
          <Plus className="size-4" />
          Add subaccount
        </Button>
      }
    >
      <Suspense fallback={<MetricsSkeleton />}>
        <SubaccountMetrics />
      </Suspense>
      <Suspense fallback={<SurfaceSkeleton />}>
        <SubaccountTable />
      </Suspense>
    </PageShell>
  );
}

async function SubaccountMetrics() {
  const subaccounts = await getSubaccounts();
  const routedVolume = subaccounts.reduce((sum, row) => sum + row.received, 0);
  const unverified = subaccounts.filter((row) => row.status !== "verified");
  const primarySplit = subaccounts[0]?.split ?? "0%";

  return (
    <AnimatedGrid>
      <MetricCard icon={Landmark} label="Linked accounts" value={`${subaccounts.length}`} tone="black" />
      <MetricCard icon={CirclePercent} label="Primary split" value={primarySplit} tone="green" />
      <MetricCard icon={Banknote} label="Routed volume" value={formatNaira(routedVolume)} tone="blue" />
      <MetricCard icon={Landmark} label="Unverified" value={`${unverified.length}`} tone="amber" />
    </AnimatedGrid>
  );
}

async function SubaccountTable() {
  const subaccounts = await getSubaccounts();
  const columns: OperationsColumn<SubaccountRecord>[] = [
    { key: "name", header: "Subaccount" },
    { key: "bank", header: "Bank" },
    { key: "account", header: "Account" },
    { key: "split", header: "Split" },
    {
      key: "received",
      header: "Received",
      align: "right",
      render: (row) => <span className="font-black">{formatNaira(row.received)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusCell status={row.status} />,
    },
  ];

  return (
    <Surface title="Settlement map" description="Fetched from the backend /billing/subaccounts endpoint.">
      <OperationsTable
        rows={subaccounts}
        columns={columns}
        emptyTitle="No subaccounts yet"
        emptyDescription="Backend settlement accounts will appear here."
      />
    </Surface>
  );
}
