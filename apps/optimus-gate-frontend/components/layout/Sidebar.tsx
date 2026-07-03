"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItem } from "@/lib/navItem";
import { bottomNav } from "@/lib/navItem";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogoutDialog } from "./LogoutDialog";
import type { AuthUser } from "@/lib/auth/types";

export function AppSidebar({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const slug = pathname.split("/")[1];
  const { state } = useSidebar();
  const initials = getInitials(user);

  return (
    <Sidebar
      collapsible="icon"
      className="border-none bg-black text-white shadow-[4px_0_18px_-6px_rgba(0,0,0,0.45)]"
      style={{ "--sidebar-width": "14rem" } as React.CSSProperties}
    >
      <SidebarHeader className="bg-black px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md pr-3">
            <Avatar className="border border-white/20 bg-white text-black">
              <AvatarFallback className="bg-white text-black">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          {state === "expanded" && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-white">
                Optimus Gate
              </span>
              <span className="text-[11px] text-zinc-400">
                {user.email}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-black px-2 py-4">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItem.map((item) => {
                const isActive = slug === item.slug;
                return (
                  <SidebarMenuItem key={item.slug}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "h-10 rounded-lg px-3 text-sm font-normal text-zinc-400 transition-colors hover:bg-white/10 hover:text-white",
                        isActive && "bg-white font-medium text-black hover:bg-white hover:text-black",
                      )}
                    >
                      <Link href={`/${item.slug}`}>
                        <item.icon
                          className={cn(
                            "mr-2 h-4.5 w-4.5 shrink-0",
                            isActive ? "text-black" : "text-zinc-500",
                          )}
                        />
                        {item.name}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-black px-2 py-2">
        <SidebarMenu className="gap-0.5">
          {bottomNav.map((item) => {
            if (item.slug === "logout") {
              return <LogoutDialog key={item.slug} />;
            }

            return (
              <SidebarMenuItem key={item.slug}>
                <SidebarMenuButton
                  asChild
                  className="h-10 rounded-lg px-3 text-sm font-normal text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Link href={`/${item.slug}`}>
                    <item.icon className="mr-2 h-4.5 w-4.5 shrink-0 text-zinc-500" />
                    {item.name}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function getInitials(user: AuthUser) {
  const names = [user.firstName, user.lastName].filter(Boolean);
  const source = names.length ? names.join(" ") : user.email;

  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
