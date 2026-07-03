import Link from "next/link";
import Brand from "./Brand";

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Brand />
        <nav className="flex items-center gap-2 sm:gap-5">
          <Link
            href="/pricing"
            className="hidden font-mono text-xs uppercase tracking-widest text-soft hover:text-ink sm:block"
          >
            Feeds &amp; pricing
          </Link>
          <Link
            href="/#how"
            className="hidden font-mono text-xs uppercase tracking-widest text-soft hover:text-ink sm:block"
          >
            How it works
          </Link>
          <Link href="/login" className="btn btn-ghost h-9 px-4 text-xs">
            Log in
          </Link>
          <Link href="/signup" className="btn btn-primary h-9 px-4 text-xs">
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
