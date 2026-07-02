import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormTextFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  description?: string;
  className?: string;
  type?: string;
}

export function FormTextField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  description,
  className,
  type = "text",
}: FormTextFieldProps<T>) {
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
          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            className={cn(
              "w-full h-11!",
              "transition-colors",
              "focus-visible:border-brand focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-brand/30",
              fieldState.error && "border-red-500",
            )}
            {...field}
          />
          {description && !fieldState.error && (
            <FieldDescription className="text-xs text-gray-400 tracking-wide">
              {description}
            </FieldDescription>
          )}
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
