import Link from "next/link";

export default function Footer() {
  const footerLinks = {
    product: [
      { label: "Features", href: "#features" },
      { label: "FAQ", href: "#faq" },
    ],
    company: [
      { label: "Login", href: "/login" },
      { label: "Get Started", href: "/signup" },
    ],
  };
  return (
    <section className="mt-20 rounded-t-3xl border-t border-zinc-800 bg-zinc-900 px-4 py-12 sm:px-6 lg:px-30">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xs">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight text-white"
          >
            Optimus Gate
          </Link>
          <p className="mt-2 text-xs leading-relaxed text-zinc-400">
            Recurring billing infrastructure for Nigerian businesses. Built on
            Nomba for reliability.
          </p>
        </div>

        <div className="flex gap-10 sm:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Product
            </p>
            <ul className="mt-3 space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Account
            </p>
            <ul className="mt-3 space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-2 border-t border-zinc-800 pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Optimus Gate. All rights reserved.</p>
        <p className="text-zinc-500">Powered by Nomba</p>
      </div>
    </section>
  );
}
