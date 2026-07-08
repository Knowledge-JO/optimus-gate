"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Zap, RefreshCw, ShieldCheck, Layers } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { icon: Zap, value: "< 2 min", label: "To set up a billing plan" },
  { icon: RefreshCw, value: "Automatic", label: "Recurring charge retries" },
  { icon: ShieldCheck, value: "BVN + KYC", label: "Verified onboarding" },
  {
    icon: Layers,
    value: "1 dashboard",
    label: "For plans, payouts & reconciliation",
  },
];

export default function StatsBar() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".stat-item", {
        opacity: 0,
        y: 16,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="px-4 pt-16 sm:px-6 lg:px-30 lg:pt-20">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 rounded-2xl border border-slate-200 bg-white px-6 py-10 shadow-lg sm:px-8 md:grid-cols-4 md:gap-8 md:divide-x md:divide-slate-200 md:py-8">
        {stats.map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="stat-item flex items-center justify-center gap-3 md:justify-start md:pl-8 md:first:pl-0"
          >
            <Icon
              className="h-6 w-6 shrink-0 text-slate-900"
              strokeWidth={1.75}
            />
            <div>
              <p className="text-sm font-bold leading-tight sm:text-lg">
                {value}
              </p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
