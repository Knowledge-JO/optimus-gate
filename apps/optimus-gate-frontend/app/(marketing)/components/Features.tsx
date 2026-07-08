"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  RefreshCw,
  Layers,
  Banknote,
  ShieldCheck,
  Bell,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: LayoutDashboard,
    title: "Overview",
    description:
      "See revenue, renewals, and settlement pressure in one command surface, no digging through spreadsheets.",
  },
  {
    icon: RefreshCw,
    title: "Subscriptions",
    description:
      "Track every customer's billing status, from active to past due, and know exactly who needs attention.",
  },
  {
    icon: Layers,
    title: "Plans",
    description:
      "Create and manage pricing plans once, then let customers check out without manual invoicing.",
  },
  {
    icon: Banknote,
    title: "Payouts",
    description:
      "Move settled funds out on schedule, backed by Nomba's payment rails for reliability.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Onboarding",
    description:
      "BVN and KYC checks built into signup, so every merchant is verified before they go live.",
  },
  {
    icon: Bell,
    title: "Alerts",
    description:
      "Get notified the moment a charge fails, a renewal is due, or an expense looks off.",
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".feature-card", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="features"
      ref={sectionRef}
      className="scroll-mt-10 px-4 pt-16 sm:px-6 lg:px-30 lg:pt-20"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Everything billing needs, in one place
        </h2>
        <p className="mt-4 text-sm text-slate-500">
          Optimus Gate handles the operational surface for recurring billing, so
          you spend less time reconciling and more time building.
        </p>
      </div>

      <div className="mt-12 flex flex-col gap-4 sm:mt-16 sm:grid sm:grid-cols-2 sm:gap-px sm:overflow-hidden sm:rounded-2xl sm:border sm:border-slate-200 sm:bg-slate-200 sm:shadow-lg lg:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="feature-card group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:bg-slate-50 sm:flex-col sm:gap-4 sm:rounded-none sm:border-0 sm:p-8 sm:shadow-none"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
