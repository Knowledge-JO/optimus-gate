"use client";

import { LuLogOut } from "react-icons/lu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { logoutAction } from "@/lib/auth/actions";

export function LogoutDialog() {
  return (
    <AlertDialog>
      <SidebarMenuItem>
        <AlertDialogTrigger asChild>
          <SidebarMenuButton className="h-10 rounded-lg px-3 text-sm font-normal text-zinc-400 transition-colors hover:bg-white/10 hover:text-white">
            <LuLogOut className="mr-2 h-4.5 w-4.5 shrink-0 text-zinc-500" />
            Logout
          </SidebarMenuButton>
        </AlertDialogTrigger>
      </SidebarMenuItem>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Log out?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be signed out of this browser and returned to the login
            page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={logoutAction}>
            <AlertDialogAction type="submit">Log out</AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
