"use client";

import { useActionState, useState } from "react";
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
import { useActionToast } from "@/hooks/use-action-toast";

const initialState: MutationState = { status: "idle" };
const DESCRIPTION_MAX = 200;

export function CreatePlanForm() {
  const [state, formAction] = useActionState(createPlanAction, initialState);
  const [description, setDescription] = useState("");
  useActionToast(state);

  return (
    <form action={formAction} className="min-w-0 space-y-3">
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
      <Input
        name="name"
        placeholder="Plan name"
        className="w-full text-xs placeholder:text-xs sm:text-sm sm:placeholder:text-sm"
      />

      <div className="space-y-1">
        <Textarea
          name="description"
          placeholder="Short plan description"
          rows={3}
          maxLength={DESCRIPTION_MAX}
          value={description}
          onChange={(e) =>
            setDescription(e.target.value.slice(0, DESCRIPTION_MAX))
          }
          className="w-full min-w-0 text-xs placeholder:text-xs sm:text-sm sm:placeholder:text-sm"
        />
        <p
          className={`text-right text-xs ${
            description.length >= DESCRIPTION_MAX
              ? "text-red-600"
              : "text-zinc-400"
          }`}
        >
          {description.length}/{DESCRIPTION_MAX}
        </p>
      </div>

      <FieldError errors={state.fieldErrors?.amount} />
      <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(5.5rem,0.7fr)_minmax(0,1fr)_minmax(8.5rem,1fr)]">
        <Input
          name="currency"
          defaultValue="NGN"
          placeholder="Currency"
          className="w-full text-xs placeholder:text-xs sm:text-sm sm:placeholder:text-sm"
        />
        <Input
          name="amount"
          placeholder="Amount e.g. 25000"
          inputMode="numeric"
          className="w-full text-xs placeholder:text-xs sm:text-sm sm:placeholder:text-sm"
        />
        <Select name="interval" defaultValue="month">
          <SelectTrigger className="w-full min-w-0">
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
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-black text-white hover:bg-zinc-900"
    >
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.[0]) return null;
  return <p className="text-xs text-red-600">{errors[0]}</p>;
}
