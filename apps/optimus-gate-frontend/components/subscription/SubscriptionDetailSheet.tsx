import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CreditCard, ChevronRight, XCircle } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { CopyButton } from "@/components/layout/CopyButton";
import { moneyCell, formatDate } from "@/components/layout/cells";
import { MOCK_SUBCRIPTION } from "@/lib/subcription_data";
import { MOCK_SUBSCRIPTION_DETAILS } from "@/lib/subcription-detail-data";
import { ActionButton } from "../layout/ActionButton";

const CANCELLABLE_STATUSES = ["Active", "Attention"];

export function SubscriptionDetailSheet({
  subscriptionId,
  open,
  onOpenChange,
  onCancel,
}: {
  subscriptionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel?: (subscriptionId: string) => void;
}) {
  const subscription = subscriptionId
    ? MOCK_SUBCRIPTION.find((s) => s.id === subscriptionId)
    : null;
  const detail = subscriptionId
    ? MOCK_SUBSCRIPTION_DETAILS.find((d) => d.id === subscriptionId)
    : null;
  const canCancel = subscription
    ? CANCELLABLE_STATUSES.includes(subscription.status)
    : false;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-100 flex-col p-0 sm:w-105">
        {subscription && (
          <>
            <SheetHeader className="space-y-1.5 border-b px-4 pb-4 pt-5">
              <SheetTitle className="text-base font-bold">
                {subscription.plan.name}
              </SheetTitle>
              <div className="flex items-center gap-1.5">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                  {subscription.subscriptionCode}
                </span>
                <CopyButton value={subscription.subscriptionCode} />
              </div>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
              <div className="space-y-2.5">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Customer
                </h3>
                <div className="rounded-lg border bg-slate-50 px-4 py-4 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {subscription.subscriber.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {subscription.subscriber.email}
                    </p>
                  </div>

                  {detail?.card && (
                    <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2.5">
                      <CreditCard className="size-4 text-slate-400" />
                      <span className="text-xs font-medium uppercase text-slate-700">
                        {detail.card.brand}
                      </span>
                      <span className="text-xs text-slate-500">
                        •••• {detail.card.last4} · Expires{" "}
                        {detail.card.expiryMonth}/{detail.card.expiryYear}
                      </span>
                    </div>
                  )}

                  <button className="flex items-center gap-0.5 text-sm font-medium text-blue-600 hover:underline">
                    View customer
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Subscription details
                </h3>

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Plan</span>
                    <button className="flex items-center gap-0.5 text-sm font-medium text-blue-600 hover:underline">
                      {subscription.plan.name}
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">Status</span>
                    <StatusBadge status={subscription.status} />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      Subscription Code
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs text-gray-900">
                        {subscription.subscriptionCode}
                      </span>
                      <CopyButton value={subscription.subscriptionCode} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Amount</span>
                    <span className="text-xs font-semibold text-gray-900">
                      {moneyCell(subscription.amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Interval</span>
                    <span className="text-xs font-medium capitalize text-gray-900">
                      {subscription.interval}
                    </span>
                  </div>

                  {detail?.paymentsCompleted !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Payments</span>
                      <span className="text-xs font-medium text-gray-900">
                        {detail.paymentsTotal
                          ? `${detail.paymentsCompleted} of ${detail.paymentsTotal}`
                          : detail.paymentsCompleted}
                      </span>
                    </div>
                  )}

                  {detail?.lifetimeValue !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        Lifetime Value
                      </span>
                      <span className="text-xs font-semibold text-gray-900">
                        {moneyCell(detail.lifetimeValue)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      Next Charge Date
                    </span>
                    <span className="text-xs font-medium text-gray-900">
                      {subscription.nextChargeDate
                        ? formatDate(subscription.nextChargeDate)
                        : "—"}
                    </span>
                  </div>

                  {detail?.subscribedOn && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        Subscribed On
                      </span>
                      <span className="text-xs font-medium text-gray-900">
                        {formatDate(detail.subscribedOn)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {canCancel && (
              <div className="border-t px-4 py-4">
                <ActionButton
                  variant="outline"
                  className="w-full gap-1.5 border-red-200 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700"
                  onClick={() => onCancel?.(subscription.id)}
                >
                  <XCircle className="size-3.5" />
                  Cancel Subscription
                </ActionButton>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
