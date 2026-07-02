import { cn } from "@/lib/utils";
import { moneyCell, formatDate } from "@/components/layout/cells";
import type { Payout } from "./type";

export function PayoutsSummaryCards({ payouts }: { payouts: Payout[] }) {
  const totalPaidOut = payouts
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayouts = payouts.filter((p) => p.status === "pending");
  const pendingAmount = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);

  const failedPayouts = payouts.filter((p) => p.status === "failed");
  const failedAmount = failedPayouts.reduce((sum, p) => sum + p.amount, 0);

  const sortedPending = [...pendingPayouts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const nextPending = sortedPending[0];
  const morePendingCount = pendingPayouts.length - 1;
  const hasFailures = failedPayouts.length > 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border bg-white p-4">
        <p className="text-xs font-medium text-slate-500">Total paid out</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">
          {moneyCell(totalPaidOut)}
        </p>
        <p className="mt-1 text-xs text-slate-400">All time</p>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <p className="text-xs font-medium text-slate-500">Pending payouts</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">
          {moneyCell(pendingAmount)}
        </p>
        <p className="mt-1 text-xs font-medium text-amber-600">
          {nextPending
            ? `Expected by ${formatDate(nextPending.date)}${
                morePendingCount > 0 ? ` · +${morePendingCount} more` : ""
              }`
            : "No pending payouts"}
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <p
          className={cn(
            "text-xs font-medium",
            hasFailures ? "text-red-500" : "text-slate-500",
          )}
        >
          Failed payouts
        </p>
        <p
          className={cn(
            "mt-1 text-2xl font-bold",
            hasFailures ? "text-red-500" : "text-gray-900",
          )}
        >
          {moneyCell(failedAmount)}
        </p>
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            hasFailures ? "text-red-500" : "text-slate-400",
          )}
        >
          {hasFailures
            ? `${failedPayouts.length} payout${failedPayouts.length > 1 ? "s" : ""} need action`
            : "No failed payouts"}
        </p>
      </div>
    </div>
  );
}
