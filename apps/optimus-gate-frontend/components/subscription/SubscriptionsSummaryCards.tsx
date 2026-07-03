import { cn } from "@/lib/utils";
import { moneyCell } from "@/components/layout/cells";
import type { Subscription, SubscriptionDetail } from "./type";

export function SubscriptionsSummaryCards({
  subscriptions,
  details,
}: {
  subscriptions: Subscription[];
  details: SubscriptionDetail[];
}) {
  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "Active",
  );

  const totalRevenue = details.reduce(
    (sum, d) => sum + (d.lifetimeValue ?? 0),
    0,
  );

  const attentionSubscriptions = subscriptions.filter(
    (s) => s.status === "Attention",
  );
  const hasAttention = attentionSubscriptions.length > 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border bg-white p-4">
        <p className="text-xs font-medium text-slate-500">Total revenue</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">
          {moneyCell(totalRevenue)}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Collected across all subscriptions
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <p className="text-xs font-medium text-slate-500">
          Active subscriptions
        </p>
        <p className="mt-1 text-2xl font-bold text-gray-900">
          {activeSubscriptions.length}
        </p>
        <p className="mt-1 text-xs font-medium text-emerald-600">
          {activeSubscriptions.length > 0
            ? `${activeSubscriptions.length} currently billing`
            : "No active subscriptions"}
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <p
          className={cn(
            "text-xs font-medium",
            hasAttention ? "text-red-500" : "text-slate-500",
          )}
        >
          Attention needed
        </p>
        <p
          className={cn(
            "mt-1 text-2xl font-bold",
            hasAttention ? "text-red-500" : "text-gray-900",
          )}
        >
          {attentionSubscriptions.length}
        </p>
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            hasAttention ? "text-red-500" : "text-slate-400",
          )}
        >
          {hasAttention
            ? `${attentionSubscriptions.length} subscription${
                attentionSubscriptions.length > 1 ? "s" : ""
              } need action`
            : "No subscriptions need action"}
        </p>
      </div>
    </div>
  );
}
