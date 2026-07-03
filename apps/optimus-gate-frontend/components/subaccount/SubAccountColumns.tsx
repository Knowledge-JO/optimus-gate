import type { Column } from "@/components/layout/DataTable";
import {
  bankDetailsCell,
  codeCell,
  moneyCell,
} from "@/components/layout/cells";
import { StatusBadge } from "./StatusBadge";
import type { SubAccount } from "./type";
import { RowActionsDropdown } from "../layout/RowActionsDropdown";

export const subAccountColumns: Column<SubAccount>[] = [
  {
    id: "account",
    header: "ACCOUNT",
    cell: (a) => (
      <span className="font-semibold text-sm text-gray-900 tracking-wide">
        {a.name}
      </span>
    ),
  },
  {
    id: "bank",
    header: "BANK DETAILS",
    cell: (a) => bankDetailsCell(a.bankName, a.accountNumberMasked),
  },
  {
    id: "split",
    header: "SPLIT",
    cell: (a) => `${a.splitPercent}%`,
    className: (a) =>
      `text-sm font-semibold ${a.splitPercent === 0 ? "text-gray-400" : "text-gray-900"}`,
  },
  {
    id: "received",
    header: "RECEIVED",
    cell: (a) => moneyCell(a.receivedAmount),
    className: "text-sm font-semibold text-gray-900",
  },
  {
    id: "code",
    header: "CODE",
    cell: (a) => codeCell(a.code),
  },
  {
    id: "status",
    header: "STATUS",
    cell: (a) => <StatusBadge status={a.status} />,
  },
  {
    id: "dropdowns",
    header: "",
    cell: (a) => (
      <RowActionsDropdown
        row={a}
        actions={[
          {
            label: "Delete",
            variant: "destructive",
            confirm: {
              title: "Delete subaccount?",
              description: `This will permanently remove "${a.name}" and its split configuration. This action cannot be undone.`,
              confirmLabel: "Delete",
            },
            onClick: () => undefined,
          },
          { label: "Update", onClick: () => undefined },
        ]}
      />
    ),
  },
];
