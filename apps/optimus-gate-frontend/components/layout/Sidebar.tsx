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

export function AppSidebar() {
  const pathname = usePathname();
  const slug = pathname.split("/")[1];
  const { state } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      className="border-none shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]"
      style={{ "--sidebar-width": "14rem" } as React.CSSProperties}
    >
      <SidebarHeader className="bg-white px-4 py-4 ">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md  pr-3">
            <Avatar>
              <AvatarFallback>OG</AvatarFallback>
            </Avatar>
          </div>
          {state === "expanded" && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-navy">
                Optimus Gate
              </span>
              <span className="text-[11px] text-slate-400">ID: 1234567890</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white px-2 py-4">
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
                        "h-10 rounded-xl px-3 text-sm font-normal text-slate-500 transition-colors hover:bg-slate-800 hover:text-white",
                        isActive && "bg-slate-800 font-medium text-white",
                      )}
                    >
                      <Link href={`/${item.slug}`}>
                        <item.icon
                          className={cn(
                            "mr-2 h-4.5 w-4.5 shrink-0",
                            isActive ? "text-white" : "text-slate-400",
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

      <SidebarFooter className="bg-white px-2 py-2">
        <SidebarMenu className="gap-0.5">
          {bottomNav.map((item) => (
            <SidebarMenuItem key={item.slug}>
              <SidebarMenuButton
                asChild
                className="h-10 rounded-xl px-3 text-sm font-normal text-slate-500   transition-colors hover:bg-slate-800 hover:text-white"
              >
                <Link href={`/dashboard/${item.slug}`}>
                  <item.icon className="mr-2 h-4.5 w-4.5 shrink-0 text-slate-400" />
                  {item.name}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
