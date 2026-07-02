"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldGroup } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  FormTextField,
  FormTextareaField,
  FormSelectField,
  CurrencyAmountField,
} from "@/components/forms/fields";
import { planFormSchema, PlanFormValues } from "@/lib/schemas/plan";

interface PlanFormProps {
  onSubmit: (values: PlanFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function PlanForm({
  onSubmit,
  onCancel,
  isSubmitting,
}: PlanFormProps) {
  const { control, handleSubmit } = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      planName: "",
      description: "",
      currency: "NGN",
      amount: "",
      interval: undefined,
      maxPayments: "",
      createSubscriptionPage: false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      {/* Row 1: Plan name + Interval */}
      <FieldGroup className="grid grid-cols-2 gap-4">
        <FormTextField
          name="planName"
          control={control}
          label="Plan name"
          placeholder="Name of your plan"
        />

        <FormSelectField
          name="interval"
          control={control}
          label="Interval"
          placeholder="Choose plan interval"
          options={[
            { value: "daily", label: "Daily" },
            { value: "weekly", label: "Weekly" },
            { value: "monthly", label: "Monthly" },
            { value: "quarterly", label: "Quarterly" },
            { value: "yearly", label: "Yearly" },
          ]}
        />
      </FieldGroup>

      {/* Row 2: Description, spans both columns, taller */}
      <FieldGroup className="grid grid-cols-1 gap-4 mt-4">
        <FormTextareaField
          name="description"
          control={control}
          label="Description"
          placeholder="Describe your plan"
          rows={4}
        />
      </FieldGroup>

      {/* Row 3: Plan amount + Max payments */}
      <FieldGroup className="grid grid-cols-2 gap-4 mt-4">
        <CurrencyAmountField
          currencyName="currency"
          amountName="amount"
          control={control}
          label="Plan amount"
          currencies={[
            { value: "NGN", label: "NGN" },
            { value: "USD", label: "USD" },
          ]}
          helperText="Minimum plan amount is NGN 100"
        />

        <FormTextField
          name="maxPayments"
          control={control}
          label="Max. number of payments"
          placeholder="Set limit (optional)"
        />
      </FieldGroup>

      <div className="mt-4">
        <label className="font-medium text-sm text-gray-500 tracking-wide flex items-center gap-2 cursor-pointer">
          <Checkbox />
          Create a subscription page for this plan
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="rounded-lg px-3 py-2 h-9 text-xs font-semibold gap-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg px-3 py-2 h-9 text-xs font-semibold gap-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
        >
          {isSubmitting ? "Creating..." : "Create Plan"}
        </Button>
      </div>
    </form>
  );
}
