"use client";

import { Ban, Clock3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cancelSubscriptionAction } from "@/lib/api/actions";

export function CancelSubscriptionAction({
  disabled,
  subscriptionId,
}: {
  disabled?: boolean;
  subscriptionId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function cancel(cancelAtPeriodEnd: boolean) {
    const formData = new FormData();
    formData.set("subscriptionId", subscriptionId);
    formData.set("cancelAtPeriodEnd", String(cancelAtPeriodEnd));

    startTransition(async () => {
      const result = await cancelSubscriptionAction(formData);
      setMessage(result.message ?? null);

      if (result.status === "success") {
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            className="h-8 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
          >
            <Ban className="size-4" />
            Cancel
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] overflow-hidden sm:max-w-md">
          <AlertDialogHeader className="min-w-0 place-items-start text-left">
            <AlertDialogTitle className="min-w-0 wrap-break-words">
              Cancel subscription?
            </AlertDialogTitle>
            <AlertDialogDescription className="min-w-0 wrap-break-words text-left">
              Period-end cancellation keeps the subscriber active until their
              current paid period ends. Immediate cancellation stops the
              subscription now.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {message && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {message}
            </p>
          )}
          <AlertDialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <AlertDialogCancel disabled={isPending} className="w-full sm:w-auto">
              Keep active
            </AlertDialogCancel>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => cancel(false)}
              className="w-full sm:w-auto"
            >
              <Ban className="size-4" />
              Cancel now
            </Button>
            <Button
              type="button"
              disabled={isPending}
              onClick={() => cancel(true)}
              className="w-full bg-black text-white hover:bg-zinc-900 sm:w-auto"
            >
              <Clock3 className="size-4" />
              {isPending ? "Saving..." : "At period end"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
