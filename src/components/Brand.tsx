import Link from "next/link";

export default function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2">
      <span className="inline-block h-3.5 w-3.5 bg-accent" aria-hidden />
      <span
        className={`font-mono text-sm font-bold tracking-[0.18em] ${
          light ? "text-white" : "text-ink"
        }`}
      >
        SG BEST LEADS
      </span>
    </Link>
  );
}
