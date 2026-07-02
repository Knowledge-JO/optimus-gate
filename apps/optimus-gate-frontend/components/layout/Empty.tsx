"use client";

import { FaPlus } from "react-icons/fa6";
import { ActionButton } from "@/components/layout/ActionButton";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function Empty({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-2xl border bg-white p-5",
        className,
      )}
    >
      <span>{icon}</span>
      <h3 className="text-lg font-semibold tracking-wide">{title}</h3>
      <p className="text-sm text-gray-500 w-1/2 text-center mb-3">
        {description}
      </p>
      <ActionButton icon={FaPlus} onClick={action?.onClick}>
        {action?.label}
      </ActionButton>
    </div>
  );
}
