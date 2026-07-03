"use client";

import { FaPlus } from "react-icons/fa6";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SubaccountForm from "@/components/forms/SubaccountForm";
import { ActionButton } from "@/components/layout/ActionButton";
import PageHeader from "@/components/layout/PageHeader";

export default function Header() {
  return (
    <PageHeader
      title="Subaccount"
      description="Split payments across linked bank accounts"
    >
      <Dialog>
        <DialogTrigger asChild>
          <ActionButton icon={FaPlus}>Add Subaccount</ActionButton>
        </DialogTrigger>
        <DialogContent className="w-full sm:max-w-180 p-8">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">
              New Subaccount
            </DialogTitle>
          </DialogHeader>
          <SubaccountForm
            onSubmit={(values) => console.log("submitted:", values)}
            onCancel={() => console.log("cancelled")}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>
    </PageHeader>
  );
}
