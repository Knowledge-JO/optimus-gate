import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { AppSidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/auth/api";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "14rem" } as React.CSSProperties}
    >
      <div className="flex w-full overflow-hidden">
        <AppSidebar user={user} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header user={user} />
          <main className="flex-1 overflow-y-auto bg-[#f5f5f3]">
            <Suspense fallback={<DashboardShellFallback />}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function DashboardShellFallback() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="h-8 w-44 animate-pulse rounded bg-slate-200" />
      <div className="h-56 animate-pulse rounded-lg bg-white" />
    </div>
  );
}
