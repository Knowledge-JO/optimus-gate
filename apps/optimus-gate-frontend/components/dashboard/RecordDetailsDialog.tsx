"use client";

import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CopyButton } from "@/components/layout/CopyButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { reconcileCheckoutOrdersAction } from "@/lib/api/actions";
import { StatusCell } from "./OperationsTable";

export type RecordDetailField = {
  label: string;
  value: React.ReactNode;
  copyValue?: string;
};

export function RecordDetailsDialog({
  canReconcile,
  description,
  fields,
  onOpenChange,
  open,
  reconcileReference,
  status,
  title,
}: {
  canReconcile: boolean;
  description?: string;
  fields: RecordDetailField[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
  reconcileReference?: string;
  status: string;
  title: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<{
    status: "success" | "error";
    text: string;
  } | null>(null);
  const [isReconciling, startTransition] = useTransition();

  function handleReconcile() {
    if (!reconcileReference) return;

    startTransition(async () => {
      const result = await reconcileCheckoutOrdersAction([reconcileReference]);
      setMessage({
        status: result.status === "success" ? "success" : "error",
        text: result.message ?? "Reconcile request completed.",
      });

      if (result.status === "success") {
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] overflow-hidden p-0 sm:max-w-xl">
        <div className="border-b border-black/10 px-4 py-4 sm:px-5">
          <DialogHeader>
            <DialogTitle className="wrap-break-words pr-8 text-xl font-black leading-tight text-black">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="wrap-break-words pr-8 text-xs">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">
              Status
            </span>
            <StatusCell status={status} />
          </div>
        </div>

        <div className="max-h-[calc(100dvh-14rem)] overflow-y-auto p-4 sm:p-5">
          <div className="grid gap-2">
            {fields.map((field) => (
              <div
                key={field.label}
                className="grid min-w-0 gap-1 rounded-lg border border-black/10 bg-[#fbfaf7] px-3 py-2.5 sm:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] sm:items-center"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  {field.label}
                </span>
                <span className="flex min-w-0 items-center gap-2 text-sm font-black text-black sm:justify-end sm:text-right">
                  <span className="min-w-0 wrap-break-words">{field.value}</span>
                  {field.copyValue && <CopyButton value={field.copyValue} />}
                </span>
              </div>
            ))}
          </div>

          {message && (
            <p
              className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
                message.status === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </p>
          )}
        </div>

        <DialogFooter showCloseButton>
          {canReconcile && (
            <Button
              type="button"
              disabled={!reconcileReference || isReconciling}
              onClick={handleReconcile}
              className="w-full bg-black text-white hover:bg-zinc-900 sm:w-auto"
            >
              <RefreshCcw
                className={`size-4 ${isReconciling ? "animate-spin" : ""}`}
              />
              {isReconciling ? "Reconciling..." : "Reconcile"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
