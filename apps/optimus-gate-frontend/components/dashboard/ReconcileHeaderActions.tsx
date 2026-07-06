"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReconcileSelection } from "./reconcile-selection-context";
import { reconcileCheckoutOrdersAction } from "@/lib/api/actions";

export function ReconcileHeaderActions({
  pendingReferences,
}: {
  pendingReferences: string[];
}) {
  const { selected, selectAll, clear } = useReconcileSelection();
  const router = useRouter();
  const [isReconciling, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    status: "success" | "error";
    text: string;
  } | null>(null);

  if (pendingReferences.length === 0) return null;

  const allSelected = pendingReferences.every((ref) => selected.has(ref));

  function handleBulkReconcile() {
    const references = Array.from(selected);
    if (references.length === 0) return;

    startTransition(async () => {
      const result = await reconcileCheckoutOrdersAction(references);
      setMessage({
        status: result.status === "success" ? "success" : "error",
        text: result.message ?? "Reconcile request completed.",
      });

      if (result.status === "success") {
        clear();
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-3">
        {selected.size > 0 && (
          <Button
            type="button"
            size="sm"
            disabled={isReconciling}
            onClick={handleBulkReconcile}
            className="bg-black text-white hover:bg-zinc-900"
          >
            <RefreshCcw
              className={`size-4 ${isReconciling ? "animate-spin" : ""}`}
            />
            {isReconciling ? "Reconciling..." : `Reconcile (${selected.size})`}
          </Button>
        )}
        <button
          type="button"
          onClick={() => selectAll(pendingReferences)}
          className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 hover:text-black"
        >
          {allSelected ? "Clear all" : "Select all"}
        </button>
      </div>
      {message && (
        <p
          className={`text-xs ${
            message.status === "success" ? "text-emerald-700" : "text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
