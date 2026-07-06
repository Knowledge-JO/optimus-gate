"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Send } from "lucide-react";
import { createPayoutAction, type MutationState } from "@/lib/api/actions";
import type { PayoutBankAccountRecord } from "@/lib/api/types";
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
import { Textarea } from "@/components/ui/textarea";

const initialState: MutationState = { status: "idle" };

export function PayoutRequestForm({
  bankAccounts,
}: {
  bankAccounts: PayoutBankAccountRecord[];
}) {
  const [state, formAction] = useActionState(createPayoutAction, initialState);
  const defaultAccount = bankAccounts.find((account) => account.isDefault);
  const [bankAccountId, setBankAccountId] = useState(
    defaultAccount?.id ?? bankAccounts[0]?.id ?? "",
  );
  const accountItems = useMemo(
    () => [
      { id: "", value: "", label: "No bank" },
      ...bankAccounts.map((account) => ({
        id: account.id,
        value: account.id,
        label: `${account.bankName ?? account.bankCode} · ${account.accountNumber}`,
      })),
    ],
    [bankAccounts],
  );
  const selectedAccount =
    accountItems.find((account) => account.id === bankAccountId) ??
    accountItems[0];

  if (!bankAccounts.length) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          No bank account is saved for payouts.
        </div>
        <Button asChild className="w-full bg-black text-white hover:bg-zinc-900">
          <Link href="/settings">Add bank account</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="bankAccountId" value={bankAccountId} />
      <Combobox
        items={accountItems}
        value={selectedAccount}
        onValueChange={(item) => setBankAccountId(item?.id ?? "")}
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
          <ComboboxInput showTrigger={false} placeholder="Search accounts" />
          <ComboboxEmpty>No bank accounts found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item.id || "empty"} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      <Input name="amount" inputMode="decimal" placeholder="Amount e.g. 50000" />
      <Textarea
        name="narration"
        maxLength={120}
        rows={3}
        placeholder="Narration"
      />
      <Input
        name="idempotencyKey"
        placeholder="Optional payout reference"
      />
      <Message state={state} />
      <SubmitButton disabled={!bankAccountId} />
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={disabled || pending}
      className="w-full bg-black text-white hover:bg-zinc-900"
    >
      <Send className="size-4" />
      {pending ? "Submitting..." : "Request payout"}
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
