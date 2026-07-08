import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
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
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body
        className={`${geistMono.variable} min-h-full flex flex-col font-sans`}
      >
        <NextTopLoader color="#000000" height={3} showSpinner={false} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
