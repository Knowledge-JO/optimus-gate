"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ExternalLink, Link2 } from "lucide-react";
import { createCheckoutLinkAction, type MutationState } from "@/lib/api/actions";
import type { PlanRecord } from "@/lib/api/types";
import { formatNaira } from "@/lib/format";
import { CopyButton } from "@/components/layout/CopyButton";
import {
  OperationsTable,
  StatusCell,
  type OperationsColumn,
} from "@/components/dashboard/OperationsTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: MutationState = { status: "idle" };

export function PlanCatalog({ plans }: { plans: PlanRecord[] }) {
  const [selectedPlan, setSelectedPlan] = useState<PlanRecord | null>(null);
  const columns: OperationsColumn<PlanRecord>[] = [
    { key: "name", header: "Plan" },
    {
      key: "code",
      header: "Code",
      render: (row) => <span className="font-mono text-black">{row.code}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (row) => <span className="font-black">{formatNaira(row.amount)}</span>,
    },
    { key: "interval", header: "Interval" },
    {
      key: "subscriptions",
      header: "Subscribers",
      align: "right",
      render: (row) => row.subscriptions.toLocaleString(),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusCell status={row.status} />,
    },
  ];

  return (
    <>
      <OperationsTable
        rows={plans}
        columns={columns}
        emptyTitle="No plans yet"
        emptyDescription="Create a backend plan to populate this catalog."
        onRowClick={setSelectedPlan}
      />
      <PlanDetailsDialog
        key={selectedPlan?.id ?? "no-plan"}
        plan={selectedPlan}
        open={Boolean(selectedPlan)}
        onOpenChange={(open) => !open && setSelectedPlan(null)}
      />
    </>
  );
}

function PlanDetailsDialog({
  onOpenChange,
  open,
  plan,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  plan: PlanRecord | null;
}) {
  const [state, formAction] = useActionState(
    createCheckoutLinkAction,
    initialState,
  );

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] overflow-hidden p-0 sm:max-w-2xl lg:max-w-3xl">
        <div className="border-b border-black/10 p-5">
          <DialogHeader>
            <DialogTitle className="break-words pr-8 text-xl font-black leading-tight text-black">
              {plan.name}
            </DialogTitle>
            <DialogDescription className="break-words pr-8">
              {plan.description || "Subscription plan details and checkout link creation."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="grid max-h-[calc(100dvh-11rem)] min-w-0 gap-4 overflow-y-auto p-4 sm:p-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-3 rounded-lg border border-black/10 bg-[#fbfaf7] p-4">
            <Detail label="Plan code" value={plan.code} />
            <Detail label="Amount" value={`${formatNaira(plan.amount)} / ${plan.interval}`} />
            <Detail label="Currency" value={plan.currency ?? "NGN"} />
            <Detail label="Subscriptions" value={plan.subscriptions.toLocaleString()} />
            <Detail label="Revenue" value={formatNaira(plan.revenue)} />
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 pt-1">
              <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                Status
              </span>
              <StatusCell status={plan.status} />
            </div>
          </div>

          <form action={formAction} className="min-w-0 space-y-3">
            <input type="hidden" name="planId" value={plan.id} />
            {state.message && (
              <p
                className={`rounded-lg border px-3 py-2 text-sm ${
                  state.status === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {state.message}
              </p>
            )}
            <div className="grid gap-2">
              <Label htmlFor="customerEmail">Customer email</Label>
              <Input
                id="customerEmail"
                name="customerEmail"
                type="email"
                placeholder="customer@example.com"
              />
              <FieldError errors={state.fieldErrors?.customerEmail} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customerName">Customer name</Label>
              <Input id="customerName" name="customerName" placeholder="Ada Lovelace" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customerId">Customer ID</Label>
              <Input
                id="customerId"
                name="customerId"
                placeholder="Optional external customer id"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="callbackUrl">Callback URL</Label>
              <Input
                id="callbackUrl"
                name="callbackUrl"
                placeholder="https://example.com/billing/callback"
              />
              <FieldError errors={state.fieldErrors?.callbackUrl} />
            </div>
            <CheckoutSubmitButton />
          </form>
        </div>

        {state.checkoutLink && (
          <div className="border-t border-black/10 bg-zinc-50 p-5">
            <div className="flex flex-col gap-3 rounded-lg border border-black/10 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-black text-black">
                  <Link2 className="size-4" />
                  Checkout link
                </p>
                <p className="mt-1 break-all font-mono text-xs text-zinc-500 sm:truncate">
                  {state.checkoutLink}
                </p>
                {state.orderReference && (
                  <p className="mt-1 break-all font-mono text-[11px] text-zinc-400">
                    {state.orderReference}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <CopyButton
                  value={state.checkoutLink}
                  className="h-9 w-9 rounded-lg border border-black/10 text-black"
                />
                <Button asChild className="h-9 bg-black text-white hover:bg-zinc-900">
                  <a href={state.checkoutLink} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4" />
                    Open
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] items-start gap-3">
      <span className="min-w-0 text-xs uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </span>
      <span className="min-w-0 break-words text-right text-sm font-black text-black">
        {value}
      </span>
    </div>
  );
}

function CheckoutSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-black text-white hover:bg-zinc-900"
    >
      {pending ? "Creating checkout..." : "Create checkout link"}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.[0]) return null;
  return <p className="text-xs text-red-600">{errors[0]}</p>;
}
