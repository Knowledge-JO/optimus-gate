"use client";

import { FaPlus } from "react-icons/fa6";
import { ActionButton } from "../layout/ActionButton";
import PageHeader from "../layout/PageHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PlanForm from "../forms/PlanForm";

export default function Header() {
  return (
    <PageHeader title="Plan">
      <Dialog>
        <DialogTrigger asChild>
          <ActionButton icon={FaPlus}>Add Plan</ActionButton>
        </DialogTrigger>
        <DialogContent className="w-full sm:max-w-180 p-8">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">
              New Plan
            </DialogTitle>
          </DialogHeader>
          <PlanForm
            onSubmit={(values) => console.log("submitted:", values)}
            onCancel={() => console.log("cancelled")}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>
    </PageHeader>
  );
}
