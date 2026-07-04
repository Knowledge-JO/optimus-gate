import { AlertTriangle, CalendarClock, Repeat2, RotateCcw } from "lucide-react";
import { Suspense } from "react";
import { AnimatedGrid } from "@/components/dashboard/AnimatedPage";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PageShell } from "@/components/dashboard/PageShell";
import { SubscriptionsRecordTable } from "@/components/dashboard/RecordTables";
import { MetricsSkeleton, SurfaceSkeleton } from "@/components/dashboard/Skeletons";
import { Surface } from "@/components/dashboard/Surface";
import { getSubscriptions } from "@/lib/api/dashboard";
import { formatNaira } from "@/lib/format";

export const metadata = {
  title: "Subscription",
};

export default function Subscription() {
  return (
    <PageShell
      eyebrow="Renewal engine"
      title="Subscriptions, retries, and next charges"
      description="A control plane for active recurring contracts, retry pressure, invoice cadence, and cancellation risk."
    >
      <Suspense fallback={<MetricsSkeleton />}>
        <SubscriptionMetrics />
      </Suspense>
      <Suspense fallback={<SurfaceSkeleton />}>
        <SubscriptionTable />
      </Suspense>
    </PageShell>
  );
}

async function SubscriptionMetrics() {
  const subscriptions = await getSubscriptions();
  const active = subscriptions.filter((subscription) => subscription.status === "active");
  const attention = subscriptions.filter((subscription) =>
    ["attention", "past_due", "failed"].includes(subscription.status),
  );
  const dueSoon = subscriptions.filter((subscription) => subscription.nextCharge !== "Not scheduled");
  const pastDueValue = attention.reduce((sum, subscription) => sum + subscription.amount, 0);

  return (
    <AnimatedGrid>
      <MetricCard icon={Repeat2} label="Active subscriptions" value={`${active.length}`} tone="green" />
      <MetricCard icon={CalendarClock} label="Scheduled charges" value={`${dueSoon.length}`} tone="blue" />
      <MetricCard icon={RotateCcw} label="Retry queue" value={`${attention.length}`} tone="amber" />
      <MetricCard icon={AlertTriangle} label="Past due value" value={formatNaira(pastDueValue)} tone="red" />
    </AnimatedGrid>
  );
}

async function SubscriptionTable() {
  const subscriptions = await getSubscriptions();

  return (
    <Surface title="Subscription ledger" description="Fetched from the backend /billing/subscriptions endpoint.">
      <SubscriptionsRecordTable
        rows={subscriptions}
        emptyTitle="No subscriptions yet"
        emptyDescription="Subscription rows will appear after backend checkout starts."
      />
    </Surface>
  );
}
