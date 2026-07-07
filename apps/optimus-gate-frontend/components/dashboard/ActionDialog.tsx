"use client";

import { useRef, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PortalContainerProvider } from "@/components/ui/portal-container";

export function ActionDialog({
  children,
  description,
  closeOnOutsideInteract = true,
  title,
  triggerLabel,
}: {
  children: ReactNode;
  closeOnOutsideInteract?: boolean;
  description?: string;
  title: string;
  triggerLabel: string;
}) {
  const portalContainerRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-black text-white hover:bg-zinc-900">
          <Plus className="size-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] overflow-hidden sm:max-w-lg"
        onInteractOutside={(event) => {
          if (!closeOnOutsideInteract || isComboboxPortalEvent(event)) {
            event.preventDefault();
          }
        }}
        onPointerDownOutside={(event) => {
          if (!closeOnOutsideInteract || isComboboxPortalEvent(event)) {
            event.preventDefault();
          }
        }}
        onFocusOutside={(event) => {
          if (!closeOnOutsideInteract || isComboboxPortalEvent(event)) {
            event.preventDefault();
          }
        }}
        onEscapeKeyDown={(event) => {
          if (!closeOnOutsideInteract) {
            event.preventDefault();
          }
        }}
      >
        <PortalContainerProvider value={portalContainerRef}>
          <div ref={portalContainerRef} className="contents min-w-0">
            <DialogHeader className="min-w-0">
              <DialogTitle className="min-w-0 wrap-break-words pr-8">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="min-w-0 wrap-break-words pr-8">
                  {description}
                </DialogDescription>
              )}
            </DialogHeader>
            {children}
          </div>
        </PortalContainerProvider>
      </DialogContent>
    </Dialog>
  );
}

function isComboboxPortalEvent(event: Event) {
  return event.composedPath().some((target) => {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    return Boolean(
      target.closest(
        '[data-slot="combobox-content"], [data-slot="combobox-portal"]',
      ),
    );
  });
}
