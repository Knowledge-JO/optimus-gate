import { CheckCircle2, Archive, Ban } from "lucide-react";
import {
  StatusBadge as GenericStatusBadge,
  type StatusConfig,
} from "@/components/layout/StatusBadge";
import type { PlanFilterTab } from "./type";

const planStatusConfig: Record<PlanFilterTab, StatusConfig> = {
  Active: {
    label: "active",
    icon: CheckCircle2,
    className:
      "bg-green-50 text-emerald-600 hover:bg-green-50 dark:bg-green-950 dark:text-green-300",
  },
  Archived: {
    label: "archived",
    icon: Archive,
    className:
      "bg-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300",
  },
  Disabled: {
    label: "disabled",
    icon: Ban,
    className:
      "bg-red-50 text-red-600 hover:bg-red-50 dark:bg-red-950 dark:text-red-300",
  },
};

export function StatusBadge({ status }: { status: PlanFilterTab }) {
  return <GenericStatusBadge status={status} config={planStatusConfig} />;
}
