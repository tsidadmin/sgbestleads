import Link from "next/link";
import Brand from "./Brand";

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-wash">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Brand />
          <nav className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-widest text-soft">
            <Link href="/pricing" className="hover:text-ink">
              Pricing
            </Link>
            <Link href="/signup" className="hover:text-ink">
              Get started
            </Link>
            <Link href="/login" className="hover:text-ink">
              Log in
            </Link>
          </nav>
        </div>
        <p className="mt-8 max-w-3xl font-mono text-[11px] leading-relaxed text-soft">
          © {new Date().getFullYear()} SG Best Leads · A TSiD LLP brand.
          Records are compiled from publicly published business information
          with PDPA-aware sourcing practices. Business contact data only — no
          consumer lists.
        </p>
      </div>
    </footer>
  );
}
