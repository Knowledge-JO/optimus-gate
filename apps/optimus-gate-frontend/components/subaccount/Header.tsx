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

export default function Header() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="space-y-1 pb-10">
          <h1 className="text-2xl font-extrabold text-navy">Subaccount</h1>
          <p className="text-slate-400 text-sm font-extralight">
            Split payments across linked bank accounts
          </p>
        </div>
        <div>
          <Dialog>
            <DialogTrigger asChild>
              <ActionButton icon={FaPlus}>Add Subaccount</ActionButton>
            </DialogTrigger>
            <DialogContent className=" w-full sm:max-w-180 p-8">
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
        </div>
      </div>
    </div>
  );
}
