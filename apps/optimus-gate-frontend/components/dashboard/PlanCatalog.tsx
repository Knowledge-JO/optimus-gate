"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import {
  CreditCard,
  ExternalLink,
  Hash,
  Link2,
  Mail,
  RefreshCcw,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import {
  createCheckoutLinkAction,
  reconcileCheckoutOrdersAction,
  type MutationState,
  type ReconcileCheckoutOrdersState,
} from "@/lib/api/actions";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TablePagination } from "@/components/layout/TablePagination";
import { useTableState } from "@/hooks/useTableState";

const initialState: MutationState = { status: "idle" };
const initialReconcileState: ReconcileCheckoutOrdersState = { status: "idle" };

export function PlanCatalog({ plans }: { plans: PlanRecord[] }) {
  const [selectedPlan, setSelectedPlan] = useState<PlanRecord | null>(null);

  const { pageRows, filtered, page, totalPages, goToPage } = useTableState<
    PlanRecord,
    PlanRecord["status"]
  >({
    data: plans,
    filterTabs: ["active", "inactive"],
    getStatus: (item) => item.status,
    getSearchableText: (item) => `${item.name} ${item.code}`,
    pageSize: 5,
  });

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
      render: (row) => (
        <span className="font-black">{formatNaira(row.amount)}</span>
      ),
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
      <div className=" bg-white overflow-hidden">
        <OperationsTable
          rows={pageRows}
          columns={columns}
          emptyTitle="No plans yet"
          emptyDescription="Create a backend plan to populate this catalog."
          onRowClick={setSelectedPlan}
        />
        <div className="p-4">
          <TablePagination
            page={page}
            totalPages={totalPages}
            showingCount={pageRows.length}
            totalCount={filtered.length}
            onPageChange={goToPage}
          />
        </div>
      </div>

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
      <DialogContent className="flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] flex-col overflow-hidden p-0 sm:max-w-xl lg:max-w-2xl">
        <div className="shrink-0 border-b border-black/10 px-3 py-3 sm:px-5 sm:py-4">
          <DialogHeader>
            <div className="flex items-start gap-2.5 pr-8">
              <div className="min-w-0">
                <DialogTitle className="wrap-break-words text-lg font-black leading-tight text-black sm:text-xl">
                  {plan.name}
                </DialogTitle>
                <DialogDescription className="mt-1 wrap-break-words text-xs">
                  {plan.description ||
                    "Subscription plan details and checkout link creation."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="grid min-h-0 min-w-0 flex-1 gap-4 overflow-y-auto p-3 sm:gap-0 sm:p-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="lg:pr-6 lg:shadow-[inset_-24px_0_16px_-27px_rgba(0,0,0,0.1)]">
            <PlanSummary plan={plan} />
          </div>

          <div className="lg:pl-5">
            {state.checkoutLink ? (
              <CheckoutLinkPanel
                checkoutLink={state.checkoutLink}
                orderReference={state.orderReference}
              />
            ) : (
              <CheckoutLinkForm
                formAction={formAction}
                state={state}
                plan={plan}
              />
            )}
          </div>
        </div>

        {/* <DialogFooter showCloseButton /> */}
      </DialogContent>
    </Dialog>
  );
}

function PlanSummary({ plan }: { plan: PlanRecord }) {
  return (
    <div className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
          Plan summary
        </p>
        <PlanStatusPill status={plan.status} />
      </div>

      <div className="mb-3">
        <p className="wrap-break-words text-2xl font-black leading-tight text-black">
          {formatNaira(plan.amount)}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">per {plan.interval}</p>
      </div>

      <div className="space-y-1.5 border-t border-black/10 pt-3">
        <Detail
          icon={<Hash className="size-3.5" />}
          label="Plan code"
          value={plan.code}
        />
        <Detail
          icon={<CreditCard className="size-3.5" />}
          label="Currency"
          value={plan.currency ?? "NGN"}
        />
        <Detail
          icon={<Users className="size-3.5" />}
          label="Subscriptions"
          value={plan.subscriptions.toLocaleString()}
        />
        <Detail
          icon={<TrendingUp className="size-3.5" />}
          label="Revenue"
          value={formatNaira(plan.revenue)}
        />
      </div>
    </div>
  );
}

function PlanStatusPill({ status }: { status: string }) {
  const isActive = status.toLowerCase() === "active";
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
        isActive ? "bg-emerald-500 text-white" : "bg-zinc-200 text-zinc-600"
      }`}
    >
      {status}
    </span>
  );
}

function CheckoutLinkForm({
  formAction,
  plan,
  state,
}: {
  formAction: (formData: FormData) => void;
  plan: PlanRecord;
  state: MutationState;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-3 text-xs uppercase tracking-[0.14em] text-zinc-500">
        Customer details
      </p>
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
          <Label htmlFor="customerEmail">Email</Label>
          <IconInput icon={<Mail className="size-4" />}>
            <Input
              id="customerEmail"
              name="customerEmail"
              type="email"
              placeholder="customer@example.com"
              className="border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
            />
          </IconInput>
          <FieldError errors={state.fieldErrors?.customerEmail} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="customerName">Name</Label>
          <IconInput icon={<User className="size-4" />}>
            <Input
              id="customerName"
              name="customerName"
              placeholder="Ada Lovelace"
              className="border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
            />
          </IconInput>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="customerId">Customer ID</Label>
          <IconInput icon={<Hash className="size-4" />}>
            <Input
              id="customerId"
              name="customerId"
              placeholder="Optional external ID"
              className="border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
            />
          </IconInput>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="callbackUrl">Callback URL</Label>
          <IconInput icon={<Link2 className="size-4" />}>
            <Input
              id="callbackUrl"
              name="callbackUrl"
              placeholder="https://example.com/billing/callback"
              className="border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
            />
          </IconInput>
          <FieldError errors={state.fieldErrors?.callbackUrl} />
        </div>
        <CheckoutSubmitButton />
      </form>
    </div>
  );
}

function IconInput({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative flex items-center rounded-lg border border-black/10 bg-zinc-50">
      <span className="pointer-events-none absolute left-3 flex items-center text-zinc-400">
        {icon}
      </span>
      {children}
    </div>
  );
}

function CheckoutLinkPanel({
  checkoutLink,
  orderReference,
}: {
  checkoutLink: string;
  orderReference?: string;
}) {
  const [reconcileState, setReconcileState] = useState(initialReconcileState);
  const [isReconciling, startReconcileTransition] = useTransition();

  function handleReconcile() {
    if (!orderReference) return;

    startReconcileTransition(async () => {
      const result = await reconcileCheckoutOrdersAction([orderReference]);
      setReconcileState(result);
    });
  }

  return (
    <div className="min-w-0 rounded-lg border border-black/10 bg-white p-3">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-md bg-black text-white">
          <Link2 className="size-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-black">Checkout link</p>
          <p className="text-xs text-zinc-500">
            Ready to share with the customer.
          </p>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-2 rounded-lg border border-black/10 bg-zinc-50 p-1.5">
        <input
          readOnly
          value={checkoutLink}
          className="h-8 min-w-0 flex-1 bg-transparent px-2 font-mono text-xs text-zinc-600 outline-none"
        />
        <CopyButton
          value={checkoutLink}
          className="h-8 w-8 shrink-0 rounded-md border border-black/10 bg-white text-black hover:bg-zinc-100"
        />
      </div>

      {orderReference && (
        <p className="mt-2 truncate font-mono text-[11px] text-zinc-400">
          {orderReference}
        </p>
      )}

      {reconcileState.message && (
        <p
          className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
            reconcileState.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {reconcileState.message}
        </p>
      )}

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Button
          asChild
          className="h-9 w-full bg-black text-white hover:bg-zinc-900"
        >
          <a href={checkoutLink} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" />
            Open checkout
          </a>
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!orderReference || isReconciling}
          onClick={handleReconcile}
          className="h-9 w-full border-black/10 bg-white text-black hover:bg-zinc-100"
        >
          <RefreshCcw
            className={`size-4 ${isReconciling ? "animate-spin" : ""}`}
          />
          {isReconciling ? "Reconciling..." : "Reconcile"}
        </Button>
      </div>
    </div>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-md px-2.5 py-2">
      <span className="flex min-w-0 items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-zinc-500">
        {icon}
        {label}
      </span>
      <span className="min-w-0 truncate text-xs font-black text-black">
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
      <Link2 className="size-4" />
      {pending ? "Creating Checkout..." : "Create Checkout Link"}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.[0]) return null;
  return <p className="text-xs text-red-600">{errors[0]}</p>;
}
