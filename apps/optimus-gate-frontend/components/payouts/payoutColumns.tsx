import type { Column } from "@/components/layout/DataTable";
import {
  bankDetailsCell,
  formatDate,
  moneyCell,
} from "@/components/layout/cells";
import { StatusBadge } from "./StatusBadge";
import type { Payout } from "./type";
import { ChevronRight } from "lucide-react";

export const payoutColumns: Column<Payout>[] = [
  {
    id: "payoutId",
    header: "PAYOUT ID",
    cell: (p) => (
      <span className="font-semibold text-sm text-gray-900 tracking-wide">
        {p.payoutId}
      </span>
    ),
  },
  {
    id: "date",
    header: "DATE",
    cell: (p) => (
      <span className="text-[13px] font-medium text-gray-700">
        {formatDate(p.date)}
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
    id: "bank",
    header: "BANK ACCOUNT",
    cell: (p) => bankDetailsCell(p.bankName, p.accountNumberMasked),
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
