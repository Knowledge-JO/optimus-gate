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
  fullWidth?: boolean;
};

type DetailBlock =
  | { kind: "single"; field: RecordDetailField }
  | { kind: "group"; fields: RecordDetailField[] };

function buildDetailBlocks(fields: RecordDetailField[]): DetailBlock[] {
  const blocks: DetailBlock[] = [];
  let currentGroup: RecordDetailField[] = [];

  const flushGroup = () => {
    if (currentGroup.length > 0) {
      blocks.push({ kind: "group", fields: currentGroup });
      currentGroup = [];
    }
  };

  for (const field of fields) {
    const isFullWidth = field.fullWidth ?? Boolean(field.copyValue);
    if (isFullWidth) {
      flushGroup();
      blocks.push({ kind: "single", field });
    } else {
      currentGroup.push(field);
    }
  }
  flushGroup();

  return blocks;
}

export function RecordDetailsDialog({
  amount,
  canReconcile,
  description,
  fields,
  onOpenChange,
  open,
  reconcileReference,
  status,
}: {
  amount?: {
    value: React.ReactNode;
    crossedOut?: boolean;
  };
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
          <DialogHeader className="flex-row items-start justify-between space-y-0">
            <DialogTitle className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Payment Details
            </DialogTitle>
          </DialogHeader>
        </div>

        <div>
          {amount && (
            <p
              className={`mt-4 text-center text-3xl font-black text-black sm:text-4xl ${
                amount.crossedOut ? "line-through decoration-2" : ""
              }`}
            >
              {amount.value}
            </p>
          )}
          {description && (
            <DialogDescription className="wrap-break-words mt-1 text-center text-xs">
              {description}
            </DialogDescription>
          )}

          <div className="mt-3 flex justify-center">
            <StatusCell status={status} />
          </div>
        </div>
        <div className="max-h-[calc(100dvh-14rem)] overflow-y-auto p-4 sm:p-5">
          <div className="flex flex-col gap-2">
            {buildDetailBlocks(fields).map((block, blockIndex) => {
              if (block.kind === "single") {
                const field = block.field;
                return (
                  <div
                    key={field.label}
                    className="flex min-w-0 flex-col gap-1 rounded-lg border border-black/10 bg-gray-50/50 px-3 py-2.5"
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                      {field.label}
                    </span>
                    <span className="flex min-w-0 items-center gap-2 text-sm font-black text-black">
                      <span className="min-w-0 wrap-break-words">
                        {field.value}
                      </span>
                      {field.copyValue && (
                        <CopyButton value={field.copyValue} />
                      )}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={`group-${blockIndex}`}
                  className="grid grid-cols-2 overflow-hidden rounded-lg border border-black/10 bg-gray-50/50 "
                >
                  {block.fields.map((field, fieldIndex) => (
                    <div
                      key={field.label}
                      className={`flex min-w-0 flex-col gap-1 px-3 py-2.5 ${
                        fieldIndex % 2 === 1 ? "border-l border-black/10" : ""
                      } ${fieldIndex >= 2 ? "border-t border-black/10" : ""}`}
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                        {field.label}
                      </span>
                      <span className="text-sm font-black text-black wrap-break-words">
                        {field.value}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
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
              className="w-full bg-black text-white hover:bg-zinc-900 sm:w-auto mb-1"
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
