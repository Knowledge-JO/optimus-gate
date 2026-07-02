import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface CurrencyAmountFieldProps<T extends FieldValues> {
  currencyName: Path<T>;
  amountName: Path<T>;
  control: Control<T>;
  label: string;
  currencies: Option[];
  helperText?: string;
}

export function CurrencyAmountField<T extends FieldValues>({
  currencyName,
  amountName,
  control,
  label,
  currencies,
  helperText,
}: CurrencyAmountFieldProps<T>) {
  return (
    <Field>
      <FieldLabel className="font-semibold text-sm text-gray-500 tracking-wide">
        {label}
      </FieldLabel>
      <div className="flex gap-2">
        <Controller
          name={currencyName}
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-28 h-11! shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {currencies.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        <Controller
          name={amountName}
          control={control}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <Input
                className={cn(
                  "w-full h-11!",
                  "transition-colors",
                  "focus-visible:border-brand focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-brand/30",
                  fieldState.error && "border-red-500",
                )}
                placeholder="Cost of the plan (NGN)"
                {...field}
              />
              {fieldState.error && (
                <FieldDescription className="text-xs text-red-500 mt-1">
                  {fieldState.error.message}
                </FieldDescription>
              )}
            </div>
          )}
        />
      </div>
      {helperText && (
        <FieldDescription className="text-xs text-gray-400 tracking-wide">
          {helperText}
        </FieldDescription>
      )}
    </Field>
  );
}
