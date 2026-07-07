"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { RotateCcw } from "lucide-react";
import { FieldError } from "@/components/dashboard/forms/CreatePlanForm";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createRefundAction,
  lookupPayoutBankAccountAction,
  type MutationState,
} from "@/lib/api/actions";
import type { BankRecord, TransactionRecord } from "@/lib/api/types";
import { formatNaira } from "@/lib/format";
import { useActionToast } from "@/hooks/use-action-toast";

type TransactionItem = {
  id: string;
  value: string;
  label: string;
};

type BankItem = {
  code: string;
  value: string;
  label: string;
};

const initialState: MutationState = { status: "idle" };

export function RefundRequestForm({
  banks,
  transactions,
}: {
  banks: BankRecord[];
  transactions: TransactionRecord[];
}) {
  const [refundState, refundAction] = useActionState(
    createRefundAction,
    initialState,
  );
  const [lookupState, lookupAction] = useActionState(
    lookupPayoutBankAccountAction,
    initialState,
  );
  const [paymentAttemptId, setPaymentAttemptId] = useState(
    transactions[0]?.id ?? "",
  );
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [useTransferRefund, setUseTransferRefund] = useState(false);
  useActionToast(refundState);
  useActionToast(lookupState);

  const transactionItems = useMemo<TransactionItem[]>(
    () =>
      transactions.map((transaction) => ({
        id: transaction.id,
        value: transaction.id,
        label: `${transaction.customer} · ${formatNaira(transaction.amount)} · ${transaction.reference}`,
      })),
    [transactions],
  );
  const bankItems = useMemo<BankItem[]>(
    () =>
      banks.map((bank) => ({
        code: bank.code,
        value: bank.code,
        label: `${bank.name} · ${bank.code}`,
      })),
    [banks],
  );
  const selectedTransaction =
    transactionItems.find((item) => item.id === paymentAttemptId) ??
    transactionItems[0];
  const selectedBank =
    bankItems.find((item) => item.code === bankCode) ?? bankItems[0];
  const isAccountConfirmed =
    useTransferRefund &&
    lookupState.status === "success" &&
    lookupState.accountNumber === accountNumber &&
    lookupState.bankCode === bankCode;
  const shouldConfirmAccount = useTransferRefund && !isAccountConfirmed;
  const action = shouldConfirmAccount ? lookupAction : refundAction;
  const activeState = shouldConfirmAccount ? lookupState : refundState;

  if (!transactions.length) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        No successful transactions are available to refund.
      </div>
    );
  }

  return (
    <form action={action} className="min-w-0 space-y-3 overflow-hidden">
      <input type="hidden" name="paymentAttemptId" value={paymentAttemptId} />

      <div className="space-y-1">
        <FieldError errors={refundState.fieldErrors?.paymentAttemptId} />
        <Combobox
          items={transactionItems}
          value={selectedTransaction}
          onValueChange={(item) => setPaymentAttemptId(item?.id ?? "")}
        >
          <ComboboxTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="min-w-0 w-full justify-between overflow-hidden font-normal"
              >
                <span className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-left [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {selectedTransaction?.label}
                </span>
              </Button>
            }
          />
          <ComboboxContent className="max-w-[calc(100vw-2rem)]">
            <ComboboxInput
              className="w-auto min-w-0"
              showTrigger={false}
              placeholder="Search transactions"
            />
            <ComboboxEmpty>No transactions found.</ComboboxEmpty>
            <ComboboxList className="max-w-full">
              {(item) => (
                <ComboboxItem key={item.id} value={item} className="min-w-0">
                  <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                    {item.label}
                  </span>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <FieldError errors={refundState.fieldErrors?.amount} />
      <Input
        name="amount"
        inputMode="decimal"
        placeholder="Amount, blank for full remaining refund"
      />

      <Textarea
        name="reason"
        maxLength={255}
        rows={3}
        placeholder="Reason"
      />

      <label className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm text-zinc-700">
        <input
          type="checkbox"
          checked={useTransferRefund}
          onChange={(event) => {
            const checked = event.target.checked;
            setUseTransferRefund(checked);

            if (!checked) {
              setAccountNumber("");
              setBankCode("");
            }
          }}
          className="size-4"
        />
        Refund to bank account
      </label>

      {useTransferRefund && (
        <div className="space-y-3 rounded-lg border border-black/10 p-3">
          <FieldError
            errors={
              lookupState.fieldErrors?.accountNumber ??
              refundState.fieldErrors?.accountNumber
            }
          />
          <FieldError
            errors={
              lookupState.fieldErrors?.bankCode ??
              refundState.fieldErrors?.bankCode
            }
          />
          <input type="hidden" name="bankCode" value={bankCode} />
          <Combobox
            items={bankItems}
            value={selectedBank}
            onValueChange={(item) => setBankCode(item?.code ?? "")}
          >
            <ComboboxTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="min-w-0 w-full justify-between overflow-hidden font-normal"
                >
                  <span className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-left [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {selectedBank?.label ?? "Select bank"}
                  </span>
                </Button>
              }
            />
            <ComboboxContent className="max-w-[calc(100vw-2rem)]">
              <ComboboxInput
                className="w-auto min-w-0"
                showTrigger={false}
                placeholder="Search banks"
              />
              <ComboboxEmpty>No banks found.</ComboboxEmpty>
              <ComboboxList className="max-w-full">
                {(item) => (
                  <ComboboxItem key={item.code} value={item} className="min-w-0">
                    <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                      {item.label}
                    </span>
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          <Input
            name="accountNumber"
            value={accountNumber}
            onChange={(event) =>
              setAccountNumber(event.target.value.replace(/\D/g, "").slice(0, 10))
            }
            inputMode="numeric"
            maxLength={10}
            placeholder="Customer account number"
          />
          {isAccountConfirmed && lookupState.accountName && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Confirmed {lookupState.accountName}.
            </p>
          )}
        </div>
      )}

      <Input
        name="idempotencyKey"
        placeholder="Optional refund reference"
      />

      {activeState.message && (
        <p
          className={`rounded-lg border px-3 py-2 text-sm ${
            activeState.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {activeState.message}
        </p>
      )}

      <SubmitButton
        disabled={!paymentAttemptId}
        label={shouldConfirmAccount ? "Confirm account first" : "Refund"}
        pendingLabel={shouldConfirmAccount ? "Confirming..." : "Refunding..."}
      />
    </form>
  );
}

function SubmitButton({
  disabled,
  label,
  pendingLabel,
}: {
  disabled: boolean;
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={disabled || pending}
      className="w-full bg-black text-white hover:bg-zinc-900"
    >
      <RotateCcw className="size-4" />
      {pending ? pendingLabel : label}
    </Button>
  );
}
