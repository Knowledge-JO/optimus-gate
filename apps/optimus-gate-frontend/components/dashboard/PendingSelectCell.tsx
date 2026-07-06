"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { useReconcileSelection } from "./reconcile-selection-context";

export function PendingSelectCell({
  reference,
  status,
}: {
  reference: string;
  status: string;
}) {
  const { isSelected, toggle } = useReconcileSelection();

  if (status.toLowerCase() !== "pending") return null;

  return (
    <Checkbox
      checked={isSelected(reference)}
      onCheckedChange={() => toggle(reference)}
      onClick={(event) => event.stopPropagation()}
      aria-label={`Select ${reference} for reconciliation`}
    />
  );
}