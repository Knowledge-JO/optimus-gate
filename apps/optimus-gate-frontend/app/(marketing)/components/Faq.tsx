"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActionButton } from "@/components/layout/ActionButton";

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "Is Optimus Gate a payment processor?",
    answer:
      "No. Optimus Gate is billing infrastructure that sits on top of Nomba's payment rails. Nomba handles the actual money movement; we handle plans, subscriptions, renewals, and reconciliation on top of it.",
  },
  {
    question: "Why do you need my BVN during onboarding?",
    answer:
      "BVN and KYC verification confirm you're a legitimate business before you can accept recurring payments. It's a one-time check during signup, required to comply with Nigerian financial regulations.",
  },
  {
    question: "What happens when a customer's payment fails?",
    answer:
      "Failed charges are flagged in your dashboard and automatically retried on a schedule. You can see exactly which subscriptions are past due and why, without digging through logs.",
  },
  {
    question:
      "Can I use my own pricing plans, or do I have to use fixed tiers?",
    answer:
      "You create your own plans, amounts, and billing intervals. Optimus Gate doesn't dictate pricing structure, it just handles the recurring billing mechanics for whatever plans you set up.",
  },
  {
    question: "How do payouts work?",
    answer:
      "Settled funds move to your payout account on a schedule you control. You can track pending versus confirmed payouts directly from the dashboard.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. Sensitive verification data is handled through licensed KYC providers, and all payment processing runs through Nomba's infrastructure rather than being stored or handled directly by us.",
  },
];

export default function Faq() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        defaults: { ease: "power2.out" },
      });

      tl.from(".faq-card", { opacity: 0, y: 24, duration: 0.6 }).from(
        ".faq-item",
        { opacity: 0, y: 12, duration: 0.4, stagger: 0.06 },
        "-=0.3",
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="scroll-mt-10 px-4 pt-16 sm:px-6 lg:px-30 lg:pt-20"
    >
      <div className=" faq-card grid gap-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Frequently Asked Questions
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Have questions? We have answers.
          </h2>

          <Accordion type="single" collapsible className="mt-8 w-full">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={faq.question}
                value={`item-${i}`}
                className="faq-item"
              >
                <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-slate-500">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Still Stuck?
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Send us a message and we&apos;ll get back to you.
          </p>

          <form className="mt-8 flex flex-col gap-4">
            <Input type="email" placeholder="Your email" required />
            <Textarea
              placeholder="Your message"
              rows={5}
              required
              className="resize-none"
            />
            <ActionButton type="submit" className="w-fit">
              Send Message
            </ActionButton>
          </form>
        </div>
      </div>
    </section>
  );
}
