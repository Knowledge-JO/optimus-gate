import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/layout/Header";
import { AppSidebar } from "@/components/layout/Sidebar";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Optimus Gate",
    template: "%s | Optimus Gate",
  },
  description: "A web application for managing transactions and overviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className={`${inter.className} ${jetbrainsMono.variable} min-h-full flex flex-col`}
      >
        <NextTopLoader color="#1E293B" height={3} showSpinner={false} />
        <SidebarProvider
          style={{ "--sidebar-width": "14rem" } as React.CSSProperties}
        >
          <div className="flex h-screen w-full overflow-hidden">
            <AppSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto bg-slate-50">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
