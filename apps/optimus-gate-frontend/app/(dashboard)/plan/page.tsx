import { Layers3, ReceiptText, Repeat2, WalletCards } from "lucide-react";
import { Suspense } from "react";
import { ActionDialog } from "@/components/dashboard/ActionDialog";
import { AnimatedGrid } from "@/components/dashboard/AnimatedPage";
import { CreatePlanForm } from "@/components/dashboard/forms/CreatePlanForm";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PlanCatalog } from "@/components/dashboard/PlanCatalog";
import { PageShell } from "@/components/dashboard/PageShell";
import {
  MetricsSkeleton,
  SurfaceSkeleton,
} from "@/components/dashboard/Skeletons";
import { Surface } from "@/components/dashboard/Surface";
import { getPlans } from "@/lib/api/dashboard";
import { formatNaira } from "@/lib/format";

export const metadata = {
  title: "Plan",
};

export default function Plan() {
  return (
    <PageShell
      eyebrow="Billing products"
      title="Plans built for repeatable revenue"
      description="Create and monitor subscription products that power checkout sessions, invoices, and renewal schedules."
    >
      <Suspense fallback={<MetricsSkeleton />}>
        <PlanMetrics />
      </Suspense>
      <Suspense fallback={<SurfaceSkeleton />}>
        <PlansTable />
      </Suspense>
    </PageShell>
  );
}

async function PlanMetrics() {
  const plans = await getPlans();
  const activePlans = plans.filter((plan) => plan.status === "active");
  const totalRevenue = plans.reduce((sum, plan) => sum + plan.revenue, 0);

  return (
    <AnimatedGrid>
      <MetricCard
        icon={Layers3}
        label="Total plans"
        value={`${plans.length}`}
        tone="black"
      />
      <MetricCard
        icon={Repeat2}
        label="Active plans"
        value={`${activePlans.length}`}
        tone="green"
      />
      <MetricCard
        icon={ReceiptText}
        label="Plan revenue"
        value={formatNaira(totalRevenue)}
        tone="blue"
      />
      <MetricCard
        icon={WalletCards}
        label="Avg plan value"
        value={formatNaira(
          Math.round(totalRevenue / Math.max(1, plans.length)),
        )}
        tone="amber"
      />
    </AnimatedGrid>
  );
}

async function PlansTable() {
  const plans = await getPlans();

  return (
    <Surface
      title="Plan catalog"
      description="Fetched from the backend /billing/plans endpoint."
      className="min-w-0"
      action={
        <ActionDialog
          triggerLabel="New plan"
          title="Create plan"
          description="Create a subscription plan for checkout."
        >
          <CreatePlanForm />
        </ActionDialog>
      }
    >
      <PlanCatalog plans={plans} />
    </Surface>
  );
}
