import Link from "next/link";
import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footerText?: string;
  footerHref?: string;
  footerLinkText?: string;
};

export function AuthCard({
  title,
  description,
  children,
  footerText,
  footerHref,
  footerLinkText,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-7 space-y-2">
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          {/* <div className="flex size-9 items-center justify-center rounded-lg bg-black text-xs font-bold text-white">
            OG
          </div> */}
          <span className="text-sm font-semibold text-slate-900">
            Optimus Gate
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
        <p className="text-sm leading-6 text-slate-500">{description}</p>
      </div>

      {children}

      {footerText && footerHref && footerLinkText && (
        <p className="mt-6 text-center text-sm text-slate-500">
          {footerText}{" "}
          <Link
            href={footerHref}
            className="font-semibold text-slate-950 hover:underline"
          >
            {footerLinkText}
          </Link>
        </p>
      )}
    </div>
  );
}
