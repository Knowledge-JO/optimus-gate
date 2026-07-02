import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FileText, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { CopyButton } from "@/components/layout/CopyButton";
import { moneyCell, formatDate } from "@/components/layout/cells";
import { MOCK_PAYOUTS } from "@/lib/payout-data";
import { MOCK_PAYOUT_DETAILS } from "@/lib/payout-detail-data";

export function PayoutDetailSheet({
  payoutId,
  open,
  onOpenChange,
  onRetry,
}: {
  payoutId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRetry?: (payoutId: string) => void;
}) {
  const payout = payoutId
    ? MOCK_PAYOUTS.find((p) => p.payoutId === payoutId)
    : null;
  const detail = payoutId ? MOCK_PAYOUT_DETAILS[payoutId] : null;
  const grossAmount = detail
    ? detail.lineItems.reduce((sum, i) => sum + i.amount, 0)
    : 0;
  const isFailed = payout?.status === "failed";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-100 flex-col p-0 sm:w-105">
        {payout && (
          <>
            <SheetHeader className="space-y-1.5 border-b px-4 pb-4 pt-5">
              <div className="flex items-center gap-1.5">
                <SheetTitle className="text-base font-bold">
                  {payout.payoutId}
                </SheetTitle>
                <CopyButton value={payout.payoutId} />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>
                  {formatDate(payout.date)} · {payout.bankName}{" "}
                  {payout.accountNumberMasked}
                </span>
                <CopyButton value={payout.accountNumberMasked} />
              </div>
              <div className="pt-1">
                <StatusBadge status={payout.status} />
              </div>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
              {isFailed && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                  <p className="text-xs font-medium text-red-700">
                    Failed
                    {detail?.failureReason ? ` — ${detail.failureReason}` : ""}
                  </p>
                </div>
              )}

              <div className="space-y-2.5">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Amount breakdown
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Gross payout</span>
                  <span className="text-sm font-medium text-gray-900">
                    {moneyCell(grossAmount)}
                  </span>
                </div>
                {detail && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Processing fee
                    </span>
                    <span className="text-sm text-muted-foreground">
                      −{moneyCell(detail.feeAmount)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t pt-2.5">
                  <span className="text-sm font-semibold text-gray-900">
                    Net payout
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {moneyCell(payout.amount)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Charges included
                </h3>
                {detail && detail.lineItems.length > 0 ? (
                  <div className="space-y-1.5">
                    {detail.lineItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <FileText className="size-3.5 shrink-0 text-slate-400" />
                          <span className="truncate text-sm text-gray-700">
                            {item.description}
                          </span>
                        </div>
                        <span className="shrink-0 font-mono text-sm text-gray-900">
                          {moneyCell(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg bg-slate-50 px-3 py-3 text-center text-xs text-muted-foreground">
                    No charge breakdown available
                  </p>
                )}
              </div>
            </div>

            {isFailed && (
              <div className="border-t px-4 py-4">
                <Button
                  className="w-full gap-1.5 bg-red-600 hover:bg-red-700"
                  onClick={() => onRetry?.(payout.payoutId)}
                >
                  <RotateCcw className="size-3.5" />
                  Retry payout
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
