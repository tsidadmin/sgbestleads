"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/leads", label: "Leads" },
  { href: "/dashboard/billing", label: "Billing" },
];

export default function DashNav({ email }: { email: string }) {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <header className="border-b border-line bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-5">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="inline-block h-3 w-3 bg-accent" aria-hidden />
            <span className="hidden font-mono text-xs font-bold tracking-[0.18em] md:block">
              SG BEST LEADS
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-[3px] px-3 py-1.5 text-sm font-medium transition-colors ${
                    active ? "bg-wash text-ink" : "text-soft hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden font-mono text-[11px] text-soft lg:block">
            {email}
          </span>
          <button
            type="button"
            onClick={logout}
            className="btn btn-ghost h-8 px-3 text-xs"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
