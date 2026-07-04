"use client";

import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { refreshDashboardAction } from "@/lib/api/actions";
import { Button } from "@/components/ui/button";

export function DashboardRefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRefresh() {
    startTransition(async () => {
      await refreshDashboardAction();
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      onClick={handleRefresh}
      className="h-9 w-full border-black/10 bg-white text-black hover:bg-zinc-100 sm:w-auto"
    >
      <RefreshCcw className={`size-4 ${isPending ? "animate-spin" : ""}`} />
      {isPending ? "Refreshing..." : "Refresh"}
    </Button>
  );
}
