import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthFieldProps = {
  label?: string;
  name: string;
  type?: string;
  placeholder: string;
  autoComplete?: string;
  defaultValue?: string;
  error?: string[];
  required?: boolean;
};

export function AuthField({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  defaultValue,
  error,
  required,
}: AuthFieldProps) {
  const errorId = `${name}-error`;

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className="text-sm text-slate-700">
          {label}
        </Label>
      )}
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        required={required}
        aria-invalid={Boolean(error?.length)}
        aria-describedby={error?.length ? errorId : undefined}
        className="h-11"
      />
      {error?.[0] && (
        <p id={errorId} className="text-xs text-red-600">
          {error[0]}
        </p>
      )}
    </div>
  );
}
