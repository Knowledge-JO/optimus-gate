import { Layers3, Plus, ReceiptText, Repeat2, WalletCards } from "lucide-react";
import { Suspense } from "react";
import { AnimatedGrid } from "@/components/dashboard/AnimatedPage";
import { CreatePlanForm } from "@/components/dashboard/forms/CreatePlanForm";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PlanCatalog } from "@/components/dashboard/PlanCatalog";
import { PageShell } from "@/components/dashboard/PageShell";
import { MetricsSkeleton, SurfaceSkeleton } from "@/components/dashboard/Skeletons";
import { Surface } from "@/components/dashboard/Surface";
import { Button } from "@/components/ui/button";
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
      action={
        <Button className="h-10 bg-black text-white hover:bg-zinc-900">
          <Plus className="size-4" />
          New plan
        </Button>
      }
    >
      <Suspense fallback={<MetricsSkeleton />}>
        <PlanMetrics />
      </Suspense>
      <div className="grid gap-4 xl:grid-cols-[1fr_0.55fr]">
        <Suspense fallback={<SurfaceSkeleton />}>
          <PlansTable />
        </Suspense>
        <Surface title="Create plan" description="Posts to the backend /billing/plans endpoint.">
          <div className="p-4">
            <CreatePlanForm />
          </div>
        </Surface>
      </div>
    </PageShell>
  );
}

async function PlanMetrics() {
  const plans = await getPlans();
  const activePlans = plans.filter((plan) => plan.status === "active");
  const totalRevenue = plans.reduce((sum, plan) => sum + plan.revenue, 0);

  return (
    <AnimatedGrid>
      <MetricCard icon={Layers3} label="Total plans" value={`${plans.length}`} tone="black" />
      <MetricCard icon={Repeat2} label="Active plans" value={`${activePlans.length}`} tone="green" />
      <MetricCard icon={ReceiptText} label="Plan revenue" value={formatNaira(totalRevenue)} tone="blue" />
      <MetricCard icon={WalletCards} label="Avg plan value" value={formatNaira(Math.round(totalRevenue / Math.max(1, plans.length)))} tone="amber" />
    </AnimatedGrid>
  );
}

async function PlansTable() {
  const plans = await getPlans();

  return (
    <Surface title="Plan catalog" description="Fetched from the backend /billing/plans endpoint.">
      <PlanCatalog plans={plans} />
    </Surface>
  );
}
