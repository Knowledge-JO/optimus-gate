import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
        <section className="hidden bg-black px-10 py-8 text-white lg:flex lg:flex-col">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-950">
              OG
            </div>
            <div>
              <p className="text-sm font-semibold">Optimus Gate</p>
              <p className="text-xs text-slate-400">Merchant dashboard</p>
            </div>
          </Link>

          <div className="flex flex-1 items-center">
            <div className="max-w-md space-y-5">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-zinc-300">
                Payments command center
              </p>
              <h1 className="text-5xl font-semibold leading-tight">
                Keep plans, payouts, and subscriptions under control.
              </h1>
              <p className="text-base leading-7 text-slate-300">
                Secure access for the teams managing recurring payments,
                settlement operations, and merchant account setup.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="rounded-lg border border-white/10 p-3">
              <p className="font-semibold text-white">Token security</p>
              <p className="mt-1">HTTP-only session storage</p>
            </div>
            <div className="rounded-lg border border-white/10 p-3">
              <p className="font-semibold text-white">SSR ready</p>
              <p className="mt-1">Server-side API access</p>
            </div>
            <div className="rounded-lg border border-white/10 p-3">
              <p className="font-semibold text-white">Fast routes</p>
              <p className="mt-1">Streaming-ready screens</p>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          {children}
        </section>
      </div>
    </main>
  );
}
