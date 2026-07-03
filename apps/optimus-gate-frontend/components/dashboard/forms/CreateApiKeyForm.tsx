"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createApiKeyAction, type MutationState } from "@/lib/api/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState: MutationState = { status: "idle" };

export function CreateApiKeyForm() {
  const [state, formAction] = useActionState(createApiKeyAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      {state.message && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            state.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <p>{state.message}</p>
          {state.secret && (
            <p className="mt-2 break-all rounded bg-white/70 p-2 font-mono text-xs text-black">
              {state.secret}
            </p>
          )}
        </div>
      )}
      <FieldError errors={state.fieldErrors?.name} />
      <Input name="name" placeholder="Key name e.g. Checkout production" />
      <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
        <Select name="environment" defaultValue="test">
          <SelectTrigger>
            <SelectValue placeholder="Environment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
            <SelectItem value="live">Live</SelectItem>
          </SelectContent>
        </Select>
        <Input
          name="scopes"
          placeholder="subscriptions:create, subscriptions:read"
        />
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-black text-white hover:bg-zinc-900">
      {pending ? "Creating key..." : "Create API key"}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.[0]) return null;
  return <p className="text-xs text-red-600">{errors[0]}</p>;
}
