"use client";

import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface RowAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  disabled?: (row: T) => boolean;
  variant?: "default" | "destructive";
  confirm?: {
    title: string;
    description: string;
    confirmLabel?: string;
  };
}

interface RowActionsDropdownProps<T> {
  row: T;
  actions: RowAction<T>[];
}

export function RowActionsDropdown<T>({
  row,
  actions,
}: RowActionsDropdownProps<T>) {
  const [pendingAction, setPendingAction] = useState<RowAction<T> | null>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <BsThreeDotsVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.label}
              variant={action.variant}
              disabled={action.disabled?.(row)}
              onSelect={() => {
                if (action.confirm) {
                  setPendingAction(action);
                } else {
                  action.onClick(row);
                }
              }}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={!!pendingAction}
        onOpenChange={(open) => !open && setPendingAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingAction?.confirm?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.confirm?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                pendingAction?.onClick(row);
                setPendingAction(null);
              }}
            >
              {pendingAction?.confirm?.confirmLabel ?? "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
