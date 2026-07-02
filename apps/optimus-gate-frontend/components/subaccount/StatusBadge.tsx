import { Check, Clock } from "lucide-react";
import {
  StatusBadge as GenericStatusBadge,
  type StatusConfig,
} from "@/components/layout/StatusBadge";
import type { SubAccountStatus } from "./type";

const subAccountStatusConfig: Record<SubAccountStatus, StatusConfig> = {
  Verified: {
    label: "verified",
    icon: Check,
    className:
      "bg-green-50 text-emerald-600 hover:bg-green-50 dark:bg-green-950 dark:text-green-300",
  },
  Unverified: {
    label: "unverified",
    icon: Clock,
    className:
      "bg-amber-50 text-amber-700 hover:bg-amber-50 dark:bg-amber-950 dark:text-amber-300",
  },
};

export function StatusBadge({ status }: { status: SubAccountStatus }) {
  return <GenericStatusBadge status={status} config={subAccountStatusConfig} />;
}
