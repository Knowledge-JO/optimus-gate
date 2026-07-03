import type { Column } from "@/components/layout/DataTable";
import { moneyCell } from "@/components/layout/cells";
import { StatusBadge } from "./StatusBadge";
import type { Subscription } from "./type";
import { ChevronRight } from "lucide-react";

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const subscriptionColumns: Column<Subscription>[] = [
  {
    id: "plan",
    header: "PLAN",
    cell: (s) => (
      <div className="flex flex-col">
        <span className="font-semibold text-sm text-gray-900 tracking-wide">
          {s.plan.name}
        </span>
        <span className="font-mono text-[13px] text-gray-500">
          {s.subscriptionCode}
        </span>
      </div>
    ),
  },
  {
    id: "subscriber",
    header: "SUBSCRIBER",
    cell: (s) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">
          {s.subscriber.name}
        </span>
        <span className="text-[13px] text-gray-500">{s.subscriber.email}</span>
      </div>
    ),
  },
  {
    id: "amount",
    header: "AMOUNT",
    cell: (s) => (
      <div className="flex flex-col">
        {moneyCell(s.amount)}
        <span className="text-[13px] font-normal text-gray-500">
          / {s.interval}
        </span>
      </div>
    ),
    className: "text-sm font-semibold text-gray-900",
  },
  {
    id: "status",
    header: "STATUS",
    cell: (s) => <StatusBadge status={s.status} />,
  },
  {
    id: "nextChargeDate",
    header: "NEXT CHARGE",
    cell: (s) => (
      <span className="text-[13px] font-medium text-gray-700">
        {formatDate(s.nextChargeDate)}
      </span>
    ),
  },
  {
    id: "expand",
    header: "",
    cell: () => (
      <ChevronRight className="size-4 text-slate-400 transition-colors group-hover:text-slate-600" />
    ),
    className: "w-8",
  },
];
