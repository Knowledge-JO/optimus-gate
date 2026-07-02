import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldGroup } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FormTextField, FormSelectField } from "@/components/forms/fields";
import {
  subaccountFormSchema,
  SubaccountFormValues,
} from "@/lib/schemas/subaccount";
import { useEffect } from "react";

interface SubaccountFormProps {
  onSubmit: (values: SubaccountFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function SubaccountForm({
  onSubmit,
  onCancel,
  isSubmitting,
}: SubaccountFormProps) {
  const { control, handleSubmit, trigger } = useForm<SubaccountFormValues>({
    resolver: zodResolver(subaccountFormSchema),
    defaultValues: {
      currency: "",
      bankName: "",
      accountNumber: "",
      subaccountName: "",
      transactionSplit: "",
      subaccountPercentage: "",
      keepOnLive: false,
    },
  });

  const transactionSplit = useWatch({ control, name: "transactionSplit" });
  const subaccountPercentage = useWatch({
    control,
    name: "subaccountPercentage",
  });

  useEffect(() => {
    if (transactionSplit && subaccountPercentage) {
      trigger("subaccountPercentage");
    }
  }, [transactionSplit, subaccountPercentage, trigger]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <FieldGroup className="grid grid-cols-2 gap-4">
        <FormSelectField
          name="currency"
          control={control}
          label="Currency"
          placeholder="Select a currency"
          options={[
            { value: "NGN", label: "NGN — Nigerian Naira" },
            { value: "USD", label: "USD" },
            { value: "EUR", label: "EUR" },
            { value: "GBP", label: "GBP" },
          ]}
        />

        <FormSelectField
          name="bankName"
          control={control}
          label="Bank Name (For payouts)"
          placeholder="Choose Bank"
          options={[
            { value: "Chase", label: "Chase" },
            { value: "Bank of America", label: "Bank of America" },
            { value: "Wells Fargo", label: "Wells Fargo" },
          ]}
        />
      </FieldGroup>

      <FieldGroup className="grid grid-cols-2 gap-4 mt-4">
        <FormTextField
          name="accountNumber"
          control={control}
          label="Account Number"
          placeholder="Enter account number"
        />

        <FormTextField
          name="subaccountName"
          control={control}
          label="Subaccount Name"
          placeholder="Enter subaccount name"
        />

        <FormTextField
          name="transactionSplit"
          control={control}
          label="Transaction Split"
          placeholder="Enter transaction split"
          description="Your share of payment (%). The two values must add up to 100%."
        />

        <FormTextField
          name="subaccountPercentage"
          control={control}
          label="Subaccount Percentage"
          placeholder="100"
          className="mt-7"
        />
      </FieldGroup>

      <div className="mt-4">
        <label className="font-medium text-sm text-gray-500 tracking-wide flex items-center gap-2 cursor-pointer">
          <Checkbox />
          Keep this subaccount when my account goes live
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
          {isSubmitting ? "Creating..." : "Create Subaccount"}
        </Button>
      </div>
    </form>
  );
}
