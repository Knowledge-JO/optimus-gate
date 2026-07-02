import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "./StatusBadge";
import type { SubAccount } from "./type";
import { cn } from "@/lib/utils";

export function SubAccountRow({
  account,
  selected,
  onToggle,
}: {
  account: SubAccount;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <TableRow className="border-b-border/40">
      <TableCell className="py-4">
        <Checkbox
          checked={selected}
          onCheckedChange={() => onToggle(account.id)}
          aria-label={`select ${account.name}`}
        />
      </TableCell>
      <TableCell className="py-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-gray-900 tracking-wide">
            {account.name}
          </span>
        </div>
      </TableCell>
      <TableCell className="py-4 text-muted-foreground">
        <div className="text-[13px] font-medium text-gray-700">
          {account.bankName}
        </div>
        <div className="text-[11.5px] font-normal text-gray-400 tabular-nums font-mono">
          {account.accountNumberMasked}
        </div>
      </TableCell>
      <TableCell
        className={cn(
          "py-4 text-sm font-semibold",
          account.splitPercent === 0 ? "text-gray-400" : "text-gray-900",
        )}
      >
        {account.splitPercent}%
      </TableCell>
      <TableCell className="py-4 text-sm  font-semibold text-gray-900">
        ${account.receivedAmount.toFixed(2)}
      </TableCell>
      <TableCell className="py-4">
        <code className="rounded bg-muted px-1.5 py-0.5 text-[11.5px] text-gray-500 font-mono">
          {account.code}
        </code>
      </TableCell>
      <TableCell className="py-4">
        <StatusBadge status={account.status} />
      </TableCell>
    </TableRow>
  );
}
