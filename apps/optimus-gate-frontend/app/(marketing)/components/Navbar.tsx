"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { ActionButton } from "@/components/layout/ActionButton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const menuItems = [
  { id: "home", name: "Home", href: "#home" },
  { id: "features", name: "Features", href: "#features" },
  { id: "faq", name: "FAQ", href: "#faq" },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = menuItems
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-md shadow-sm"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Optimus Gate
        </Link>

        <nav aria-label="Main navigation" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {menuItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`inline-block origin-center text-sm font-medium transition-all duration-300 ease-out motion-reduce:scale-100 motion-reduce:transition-none ${
                      isActive
                        ? "scale-110 text-primary"
                        : "scale-100 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login">
            <ActionButton
              variant="outline"
              className="w-full bg-white text-black hover:bg-zinc-100"
            >
              Login
            </ActionButton>
          </Link>
          <Link href="/signup">
            <ActionButton>Get Started</ActionButton>
          </Link>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <button type="button" aria-label="Open menu">
              <Menu size={22} />
            </button>
          </SheetTrigger>

          <SheetContent side="right" className="flex flex-col">
            <SheetHeader>
              <SheetTitle className="text-left">Optimus Gate</SheetTitle>
            </SheetHeader>

            <ul className="flex flex-col gap-1 px-4">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block py-2 text-sm font-medium ${
                      activeSection === item.id
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-auto flex flex-col gap-2 border-t border-border px-4 py-4">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full bg-white text-black hover:bg-zinc-100"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)}>
                <ActionButton className="w-full">Get Started</ActionButton>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
