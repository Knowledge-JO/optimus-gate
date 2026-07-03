import { Check, X, AlertTriangle } from "lucide-react";
import {
  StatusBadge as GenericStatusBadge,
  type StatusConfig,
} from "@/components/layout/StatusBadge";
import type { Subscription } from "./type";

type SubscriptionStatus = Subscription["status"];

const subscriptionStatusConfig: Record<SubscriptionStatus, StatusConfig> = {
  Active: {
    label: "Active",
    icon: Check,
    className:
      "bg-green-50 text-emerald-600 hover:bg-green-50 dark:bg-green-950 dark:text-green-300",
  },
  Cancelled: {
    label: "Cancelled",
    icon: X,
    className:
      "bg-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300",
  },
  Completed: {
    label: "Completed",
    icon: Check,
    className:
      "bg-blue-50 text-blue-600 hover:bg-blue-50 dark:bg-blue-950 dark:text-blue-300",
  },
  Attention: {
    label: "Attention",
    icon: AlertTriangle,
    className:
      "bg-amber-50 text-amber-700 hover:bg-amber-50 dark:bg-amber-950 dark:text-amber-300",
  },
};

export function StatusBadge({ status }: { status: SubscriptionStatus }) {
  return (
    <GenericStatusBadge status={status} config={subscriptionStatusConfig} />
  );
}
