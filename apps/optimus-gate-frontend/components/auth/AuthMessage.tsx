import { cn } from "@/lib/utils";
import type { AuthActionState } from "@/lib/auth/types";

export function AuthMessage({ state }: { state: AuthActionState }) {
  if (!state.message) return null;

  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        state.status === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700",
      )}
    >
      <p>{state.message}</p>
      {state.resetToken && (
        <p className="mt-2 break-all font-mono text-xs">
          Reset token: {state.resetToken}
        </p>
      )}
    </div>
  );
}
