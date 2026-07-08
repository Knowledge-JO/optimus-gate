"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ActionButton } from "@/components/layout/ActionButton";
import Image from "next/image";
import dashboardImg from "@/image/dashboard.png";
import { Check } from "lucide-react";

const trustPoints = ["Easy to Use", "Secure & Reliable", "All-in-One Solution"];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-title", { opacity: 0, y: 20, duration: 0.6 })
        .from(".hero-sub", { opacity: 0, y: 16, duration: 0.5 }, "-=0.3")
        .from(".hero-cta", { opacity: 0, y: 12, duration: 0.5 }, "-=0.3")
        .from(".hero-trust", { opacity: 0, y: 10, duration: 0.5 }, "-=0.3")
        .from(
          ".hero-image",
          { opacity: 0, y: 24, scale: 0.98, duration: 0.7 },
          "-=0.5",
        );
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="home"
      ref={sectionRef}
      className="scroll-mt-10 mx-auto grid max-w-6xl grid-cols-1 items-start gap-10 px-4 pt-8 sm:px-6 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-0 lg:pt-13"
    >
      <div className="flex flex-col lg:pt-4">
        <h1 className="hero-title text-4xl font-bold leading-[0.95] tracking-tight sm:text-5xl lg:whitespace-nowrap lg:text-[4.5rem]">
          Optimus Gate
        </h1>
        <h2 className="hero-sub mt-6 max-w-sm text-sm font-medium leading-relaxed text-slate-600">
          Recurring billing infrastructure for Nigerian businesses
        </h2>
        <p className="hero-sub mt-2 text-xs text-slate-400">
          Built on Nomba for reliability.
        </p>
        <ActionButton className="hero-cta mt-4 w-fit">Read Docs</ActionButton>
        <div className="hero-trust mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          {trustPoints.map((point) => (
            <span
              key={point}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500"
            >
              <Check className="h-2.5 w-2.5 text-emerald-600" strokeWidth={3} />
              {point}
            </span>
          ))}
        </div>
      </div>
      <div className="hero-image relative mt-6 aspect-16/10 w-full lg:mt-28">
        <Image
          src={dashboardImg}
          alt="Hero Image"
          fill
          className="rounded-xl object-cover object-top-left shadow-2xl ring-1 ring-black/5"
          priority
        />
      </div>
    </section>
  );
}
