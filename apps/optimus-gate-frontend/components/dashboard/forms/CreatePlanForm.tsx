"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createPlanAction, type MutationState } from "@/lib/api/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState: MutationState = { status: "idle" };

export function CreatePlanForm() {
  const [state, formAction] = useActionState(createPlanAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      {state.message && (
        <p
          className={`rounded-lg border px-3 py-2 text-sm ${
            state.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </p>
      )}
      <FieldError errors={state.fieldErrors?.name} />
      <Input name="name" placeholder="Plan name" />
      <Textarea name="description" placeholder="Short plan description" rows={3} />
      <FieldError errors={state.fieldErrors?.amount} />
      <div className="grid gap-3 sm:grid-cols-[0.8fr_1fr_1fr]">
        <Input name="currency" defaultValue="NGN" placeholder="Currency" />
        <Input name="amount" placeholder="Amount e.g. 25000" inputMode="numeric" />
        <Select name="interval" defaultValue="month">
          <SelectTrigger>
            <SelectValue placeholder="Interval" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Daily</SelectItem>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
            <SelectItem value="year">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <SubmitButton label="Create plan" pendingLabel="Creating..." />
    </form>
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
    <Button type="submit" disabled={pending} className="w-full bg-black text-white hover:bg-zinc-900">
      {pending ? pendingLabel : label}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.[0]) return null;
  return <p className="text-xs text-red-600">{errors[0]}</p>;
}
