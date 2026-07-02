import type { Column } from "@/components/layout/DataTable";
import { moneyCell } from "@/components/layout/cells";
import { StatusBadge } from "./StatusBadge";
import type { Plan } from "./type";
import { ChevronRight } from "lucide-react";

export const planColumns: Column<Plan>[] = [
  {
    id: "name",
    header: "PLAN NAME",
    cell: (p) => (
      <span className="font-semibold text-sm text-gray-900 tracking-wide">
        {p.name}
      </span>
    ),
  },
  {
    id: "amount",
    header: "AMOUNT",
    cell: (p) => moneyCell(p.amount),
    className: "text-sm font-semibold text-gray-900",
  },
  {
    id: "interval",
    header: "INTERVAL",
    cell: (p) => (
      <span className="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-0.5 text-[13px] font-medium text-gray-700">
        {p.interval}
      </span>
    ),
  },
  {
    id: "planCode",
    header: "PLAN CODE",
    cell: (p) => (
      <span className="font-mono text-[13px] text-gray-600">{p.planCode}</span>
    ),
  },
  {
    id: "subscriptionCount",
    header: "NO. OF SUBSCRIPTIONS",
    cell: (p) => (
      <span className="text-[13px] font-medium text-gray-700">
        {p.subscriptionCount}
      </span>
    ),
  },
  {
    id: "totalRevenue",
    header: "TOTAL REVENUE",
    cell: (p) => moneyCell(p.totalRevenue),
    className: "text-sm font-semibold text-gray-900",
  },
  {
    id: "status",
    header: "STATUS",
    cell: (p) => <StatusBadge status={p.status} />,
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
