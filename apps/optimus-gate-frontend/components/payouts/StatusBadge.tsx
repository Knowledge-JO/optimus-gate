import { Check, Clock, X } from "lucide-react";
import {
  StatusBadge as GenericStatusBadge,
  type StatusConfig,
} from "@/components/layout/StatusBadge";
import type { Payout } from "./type";

type PayoutStatus = Payout["status"];

const payoutStatusConfig: Record<PayoutStatus, StatusConfig> = {
  completed: {
    label: "completed",
    icon: Check,
    className:
      "bg-green-50 text-emerald-600 hover:bg-green-50 dark:bg-green-950 dark:text-green-300",
  },
  pending: {
    label: "pending",
    icon: Clock,
    className:
      "bg-amber-50 text-amber-700 hover:bg-amber-50 dark:bg-amber-950 dark:text-amber-300",
  },
  failed: {
    label: "failed",
    icon: X,
    className:
      "bg-red-50 text-red-600 hover:bg-red-50 dark:bg-red-950 dark:text-red-300",
  },
};

export function StatusBadge({ status }: { status: PayoutStatus }) {
  return <GenericStatusBadge status={status} config={payoutStatusConfig} />;
}
