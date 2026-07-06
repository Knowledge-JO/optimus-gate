"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Search } from "lucide-react";
import {
  lookupPayoutBankAccountAction,
  savePayoutBankAccountAction,
  type MutationState,
} from "@/lib/api/actions";
import type { BankRecord } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";

const initialState: MutationState = { status: "idle" };

export function PayoutBankAccountForm({ banks }: { banks: BankRecord[] }) {
  const [lookupState, lookupAction] = useActionState(
    lookupPayoutBankAccountAction,
    initialState,
  );
  const [saveState, saveAction] = useActionState(
    savePayoutBankAccountAction,
    initialState,
  );
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const bankItems = useMemo(
    () => [
      { code: "", value: "", label: "Select bank" },
      ...banks.map((bank) => ({
        code: bank.code,
        value: bank.code,
        label: bank.name,
      })),
    ],
    [banks],
  );
  const selectedBank = useMemo(
    () => banks.find((bank) => bank.code === bankCode),
    [bankCode, banks],
  );
  const canSave =
    lookupState.status === "success" &&
    Boolean(lookupState.accountName) &&
    lookupState.bankCode === bankCode &&
    lookupState.accountNumber === accountNumber;
  const visibleState = canSave
    ? saveState.message
      ? saveState
      : lookupState
    : lookupState.status === "error"
      ? lookupState
      : initialState;

  return (
    <form action={canSave ? saveAction : lookupAction} className="space-y-3">
      <BankFields
        bankItems={bankItems}
        bankCode={bankCode}
        accountNumber={accountNumber}
        onBankCodeChange={setBankCode}
        onAccountNumberChange={setAccountNumber}
      />
      <input type="hidden" name="bankName" value={selectedBank?.name ?? ""} />
      <Message state={visibleState} />
      <SubmitButton
        label={canSave ? "Save" : "Search"}
        pendingLabel={canSave ? "Saving..." : "Searching..."}
      />
    </form>
  );
}

function BankFields({
  bankCode,
  bankItems,
  accountNumber,
  onAccountNumberChange,
  onBankCodeChange,
}: {
  accountNumber: string;
  bankCode: string;
  bankItems: Array<{ code: string; value: string; label: string }>;
  onAccountNumberChange: (value: string) => void;
  onBankCodeChange: (value: string) => void;
}) {
  const selectedItem =
    bankItems.find((item) => item.code === bankCode) ?? bankItems[0];

  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(9rem,0.7fr)]">
      <div>
        <input type="hidden" name="bankCode" value={bankCode} />
        <Combobox
          items={bankItems}
          value={selectedItem}
          onValueChange={(item) => onBankCodeChange(item?.code ?? "")}
        >
          <ComboboxTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between font-normal"
              >
                <ComboboxValue />
              </Button>
            }
          />
          <ComboboxContent>
            <ComboboxInput showTrigger={false} placeholder="Search banks" />
            <ComboboxEmpty>No banks found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item.code || "empty"} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
      <Input
        name="accountNumber"
        inputMode="numeric"
        maxLength={10}
        placeholder="Account number"
        value={accountNumber}
        onChange={(event) =>
          onAccountNumberChange(
            event.target.value.replace(/\D/g, "").slice(0, 10),
          )
        }
      />
    </div>
  );
}

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-black text-white hover:bg-zinc-900"
    >
      <Search className="size-4" />
      {pending ? pendingLabel : label}
    </Button>
  );
}

function Message({ state }: { state: MutationState }) {
  if (!state.message) return null;

  return (
    <p
      className={`rounded-lg border px-3 py-2 text-sm ${
        state.status === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {state.message}
    </p>
  );
}
