"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type ToastableState = {
  status?: string;
  message?: string | null;
  fieldErrors?: Record<string, string[] | undefined> | null;
};

export function useActionToast(state: ToastableState) {
  const lastShown = useRef<string | undefined>(undefined);

  useEffect(() => {
    const hasFieldErrors =
      !!state.fieldErrors &&
      Object.values(state.fieldErrors).some((errs) => errs && errs.length > 0);

    if (hasFieldErrors) return;

    if (state.message && state.message !== lastShown.current) {
      if (state.status === "success") {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
      lastShown.current = state.message;
    }
  }, [state.message, state.status, state.fieldErrors]);
}
