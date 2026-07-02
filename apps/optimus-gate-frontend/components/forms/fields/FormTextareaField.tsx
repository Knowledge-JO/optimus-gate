import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FormTextareaFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export function FormTextareaField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  className,
  rows = 3,
}: FormTextareaFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field className={className}>
          <FieldLabel
            htmlFor={name}
            className="font-semibold text-sm text-gray-500 tracking-wide"
          >
            {label}
          </FieldLabel>
          <Textarea
            id={name}
            placeholder={placeholder}
            rows={rows}
            className={cn(
              "w-full resize-none",
              "transition-colors",
              "focus-visible:border-brand focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-brand/30",
              fieldState.error && "border-red-500",
            )}
            {...field}
          />
          {fieldState.error && (
            <FieldDescription className="text-xs text-red-500">
              {fieldState.error.message}
            </FieldDescription>
          )}
        </Field>
      )}
    />
  );
}
