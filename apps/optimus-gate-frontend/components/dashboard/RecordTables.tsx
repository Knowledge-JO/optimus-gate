"use client";

import { useState } from "react";
import type {
  SubscriberRecord,
  SubscriptionRecord,
  TransactionRecord,
} from "@/lib/api/types";
import { formatNaira } from "@/lib/format";
import {
  OperationsTable,
  StatusCell,
  type OperationsColumn,
} from "./OperationsTable";
import {
  RecordDetailsDialog,
  type RecordDetailField,
} from "./RecordDetailsDialog";

type InteractiveTableProps<T extends { id: string; status: string }> = {
  columns: OperationsColumn<T>[];
  emptyDescription: string;
  emptyTitle: string;
  getDescription?: (row: T) => string;
  getDetails: (row: T) => RecordDetailField[];
  getReconcileReference: (row: T) => string;
  getTitle: (row: T) => string;
  rows: T[];
};

function InteractiveRecordsTable<T extends { id: string; status: string }>({
  columns,
  emptyDescription,
  emptyTitle,
  getDescription,
  getDetails,
  getReconcileReference,
  getTitle,
  rows,
}: InteractiveTableProps<T>) {
  const [selectedRow, setSelectedRow] = useState<T | null>(null);
  const canReconcile = selectedRow
    ? selectedRow.status.toLowerCase() !== "active"
    : false;

  return (
    <>
      <OperationsTable
        rows={rows}
        columns={columns}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        onRowClick={setSelectedRow}
      />
      {selectedRow && (
        <RecordDetailsDialog
          key={selectedRow.id}
          open={Boolean(selectedRow)}
          onOpenChange={(open) => !open && setSelectedRow(null)}
          title={getTitle(selectedRow)}
          description={getDescription?.(selectedRow)}
          status={selectedRow.status}
          fields={getDetails(selectedRow)}
          canReconcile={canReconcile}
          reconcileReference={getReconcileReference(selectedRow)}
        />
      )}
    </>
  );
}

const transactionColumns: OperationsColumn<TransactionRecord>[] = [
  {
    key: "reference",
    header: "Reference",
    render: (row) => <span className="font-mono text-black">{row.reference}</span>,
  },
  { key: "customer", header: "Customer" },
  { key: "type", header: "Type" },
  { key: "provider", header: "Provider" },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    render: (row) => <span className="font-black">{formatNaira(row.amount)}</span>,
  },
  { key: "date", header: "Date" },
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusCell status={row.status} />,
  },
];

const latestMoneyMovementColumns: OperationsColumn<TransactionRecord>[] = [
  transactionColumns[0],
  { key: "customer", header: "Customer" },
  { key: "type", header: "Type" },
  transactionColumns[4],
  transactionColumns[6],
];

export function LatestMoneyMovementTable({
  emptyDescription,
  emptyTitle,
  rows,
}: {
  emptyDescription: string;
  emptyTitle: string;
  rows: TransactionRecord[];
}) {
  return (
    <InteractiveRecordsTable
      rows={rows}
      columns={latestMoneyMovementColumns}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      getTitle={(row) => row.reference}
      getDescription={(row) => `${row.type} payment for ${row.customer}`}
      getReconcileReference={(row) => row.reference}
      getDetails={transactionDetails}
    />
  );
}

export function TransactionsRecordTable({
  emptyDescription,
  emptyTitle,
  rows,
}: {
  emptyDescription: string;
  emptyTitle: string;
  rows: TransactionRecord[];
}) {
  return (
    <InteractiveRecordsTable
      rows={rows}
      columns={transactionColumns}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      getTitle={(row) => row.reference}
      getDescription={(row) => `${row.type} payment via ${row.provider}`}
      getReconcileReference={(row) => row.reference}
      getDetails={transactionDetails}
    />
  );
}

export function SubscriptionsRecordTable({
  emptyDescription,
  emptyTitle,
  rows,
}: {
  emptyDescription: string;
  emptyTitle: string;
  rows: SubscriptionRecord[];
}) {
  const columns: OperationsColumn<SubscriptionRecord>[] = [
    {
      key: "code",
      header: "Code",
      render: (row) => <span className="font-mono text-black">{row.code}</span>,
    },
    { key: "customer", header: "Customer" },
    { key: "plan", header: "Plan" },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (row) => <span className="font-black">{formatNaira(row.amount)}</span>,
    },
    { key: "nextCharge", header: "Next charge" },
    { key: "attempts", header: "Attempts", align: "right" },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusCell status={row.status} />,
    },
  ];

  return (
    <InteractiveRecordsTable
      rows={rows}
      columns={columns}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      getTitle={(row) => row.code}
      getDescription={(row) => `${row.customer} on ${row.plan}`}
      getReconcileReference={(row) => row.code}
      getDetails={(row) => [
        detail("Code", row.code, row.code),
        detail("Customer", row.customer),
        detail("Plan", row.plan),
        detail("Amount", formatNaira(row.amount)),
        detail("Next charge", row.nextCharge),
        detail("Attempts", row.attempts.toLocaleString()),
        detail("Record ID", row.id, row.id),
      ]}
    />
  );
}

export function SubscribersRecordTable({
  emptyDescription,
  emptyTitle,
  rows,
}: {
  emptyDescription: string;
  emptyTitle: string;
  rows: SubscriberRecord[];
}) {
  const columns: OperationsColumn<SubscriberRecord>[] = [
    { key: "name", header: "Customer" },
    { key: "email", header: "Email" },
    { key: "plan", header: "Plan" },
    { key: "paymentMethod", header: "Payment method" },
    {
      key: "lifetimeValue",
      header: "Lifetime value",
      align: "right",
      render: (row) => (
        <span className="font-black">{formatNaira(row.lifetimeValue)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusCell status={row.status} />,
    },
  ];

  return (
    <InteractiveRecordsTable
      rows={rows}
      columns={columns}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      getTitle={(row) => row.name}
      getDescription={(row) => row.email}
      getReconcileReference={(row) => row.id}
      getDetails={(row) => [
        detail("Name", row.name),
        detail("Email", row.email, row.email),
        detail("Plan", row.plan),
        detail("Payment method", row.paymentMethod),
        detail("Lifetime value", formatNaira(row.lifetimeValue)),
        detail("Subscriber ID", row.id, row.id),
      ]}
    />
  );
}

function transactionDetails(row: TransactionRecord): RecordDetailField[] {
  return [
    detail("Reference", row.reference, row.reference),
    detail("Customer", row.customer),
    detail("Type", row.type),
    detail("Provider", row.provider),
    detail("Amount", formatNaira(row.amount)),
    detail("Date", row.date),
    detail("Transaction ID", row.id, row.id),
  ];
}

function detail(
  label: string,
  value: React.ReactNode,
  copyValue?: string,
): RecordDetailField {
  return { label, value, copyValue };
}
