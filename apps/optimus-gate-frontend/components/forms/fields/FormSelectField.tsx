
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

interface Option {
  value: string;
  label: string;
}

interface FormSelectFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  options: Option[];
  className?: string;
}

export function FormSelectField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  options,
  className,
}: FormSelectFieldProps<T>) {
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
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="w-full h-11!" id={name}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
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