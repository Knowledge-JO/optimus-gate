import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export type Column<T> = {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string | ((row: T) => string);
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  selectedIds,
  allOnPageSelected,
  someOnPageSelected,
  onToggleAll,
  onToggleRow,
  onRowClick,
  isRowSelectable,
  showSelection = true,
  emptyMessage = "No results found",
}: {
  columns: Column<T>[];
  rows: T[];
  selectedIds: Set<string>;
  allOnPageSelected: boolean;
  someOnPageSelected: boolean;
  onToggleAll?: () => void;
  onToggleRow: (id: string) => void;
  onRowClick?: (row: T) => void;
  isRowSelectable?: (row: T) => boolean;
  showSelection?: boolean;
  emptyMessage?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {showSelection && (
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    allOnPageSelected
                      ? true
                      : someOnPageSelected
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={onToggleAll}
                  aria-label="select all on page"
                />
              </TableHead>
            )}
            {columns.map((col) => (
              <TableHead
                key={col.id}
                className="text-slate-400 text-[11px] font-semibold tracking-widest"
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={showSelection ? columns.length + 1 : columns.length}
                className="py-8 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const selectable = isRowSelectable ? isRowSelectable(row) : true;

              return (
                <TableRow
                  key={row.id}
                  className={cn(
                    "border-b-border/40",
                    onRowClick && "group cursor-pointer hover:bg-muted/40",
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {showSelection && (
                    <TableCell
                      className="py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {selectable && (
                        <Checkbox
                          checked={selectedIds.has(row.id)}
                          onCheckedChange={() => onToggleRow(row.id)}
                          aria-label={`select ${row.id}`}
                        />
                      )}
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      className={cn(
                        "py-4",
                        typeof col.className === "function"
                          ? col.className(row)
                          : col.className,
                      )}
                    >
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
