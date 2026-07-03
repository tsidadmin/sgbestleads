import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import LedgerHero from "@/components/LedgerHero";
import FaqList from "@/components/FaqList";
import { ANNUAL_SAVE_PCT, PLANS } from "@/lib/plans";
import { sgd } from "@/lib/format";

const STEPS = [
  {
    n: "01",
    title: "Subscribe to a feed",
    body: "Pick the lead type that matches your pipeline — monthly or annual billing, no lock-in. Your feed switches on immediately.",
  },
  {
    n: "02",
    title: "We source and verify",
    body: "Each feed runs its own pipeline over publicly published business information. Records are checked, deduplicated and enriched with decision-maker contacts.",
  },
  {
    n: "03",
    title: "Weekly drop, ready to work",
    body: "Fresh records land in your dashboard every Monday. Filter them, then export CSV straight into your CRM or outreach tool.",
  },
];

export default function HomePage() {
  const feeds = PLANS.filter((p) => p.id !== "all-access");
  const allAccess = PLANS.find((p) => p.id === "all-access")!;

  return (
    <>
      <SiteNav />
      <main>
        {/* Hero */}
        <section className="border-b border-line">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
            <div>
              <p className="eyebrow">Singapore B2B lead feeds</p>
              <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl md:text-6xl">
                Fresh Singapore leads, delivered like clockwork.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-soft">
                Pick a lead feed. We source, verify and enrich the records
                every week — you get them in a live dashboard and as CSV.
                Monthly or annual, cancel anytime.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/pricing" className="btn btn-primary">
                  Browse lead feeds
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/#feeds" className="btn btn-ghost">
                  See what is inside
                </Link>
              </div>
              <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-soft">
                From {sgd(129)}/mo · Annual saves {ANNUAL_SAVE_PCT}% · No
                lock-in
              </p>
            </div>
            <LedgerHero />
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-b border-line bg-wash">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-3 px-5 py-5 font-mono text-[11px] uppercase tracking-widest text-soft sm:grid-cols-5 sm:text-center">
            <span>5 feeds + bundle</span>
            <span>Weekly drops</span>
            <span>Verified contacts</span>
            <span>CSV + dashboard</span>
            <span>PDPA-aware sourcing</span>
          </div>
        </section>

        {/* Feed catalogue */}
        <section id="feeds" className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <p className="eyebrow">The catalogue</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em]">
            Pick your feed.
          </h2>
          <p className="mt-3 max-w-2xl text-soft">
            Each feed is a distinct pipeline with its own sourcing signals and
            volume. Subscribe to one, or take All-Access for the full spread.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {feeds.map((plan) => (
              <div
                key={plan.id}
                className="flex flex-col rounded-[4px] border border-line bg-card p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="code-chip">{plan.code}</span>
                  <span className="font-mono text-[11px] text-soft">
                    ~{plan.perMonth} records/mo
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold">{plan.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-soft">
                  {plan.description}
                </p>
                <p className="mb-5 mt-4 font-mono text-[11px] uppercase tracking-wider text-soft">
                  For: {plan.audience}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-line pt-4">
                  <span className="font-mono text-sm font-bold">
                    {sgd(plan.monthly)}
                    <span className="font-normal text-soft">/mo</span>
                  </span>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-deep"
                  >
                    Subscribe
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* All-access banner */}
          <div className="mt-6 flex flex-col gap-5 rounded-[4px] bg-ink p-7 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-[3px] bg-accent px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider text-white">
                  {allAccess.code}
                </span>
                <h3 className="text-lg font-bold">{allAccess.name}</h3>
              </div>
              <p className="mt-1.5 text-sm text-white/70">
                {allAccess.tagline} Around {allAccess.perMonth} records a month
                across every pipeline.
              </p>
            </div>
            <div className="flex items-center gap-5">
              <span className="font-mono text-lg font-bold">
                {sgd(allAccess.monthly)}
                <span className="text-sm font-normal text-white/60">/mo</span>
              </span>
              <Link href="/pricing" className="btn btn-light shrink-0">
                Get All-Access
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="border-y border-line bg-wash">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em]">
              Subscribe once. Work leads weekly.
            </h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.n}>
                  <span className="font-mono text-sm font-bold text-accent">
                    {s.n}
                  </span>
                  <h3 className="mt-2 text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-soft">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Annual banner */}
        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid gap-8 rounded-[4px] border border-line bg-card p-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="eyebrow">Annual billing</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                Two months free on every feed.
              </h2>
              <p className="mt-2 max-w-xl text-soft">
                Switch any subscription to annual and pay for 10 months instead
                of 12 — a {ANNUAL_SAVE_PCT}% saving, locked in for the year.
              </p>
            </div>
            <Link href="/pricing" className="btn btn-dark">
              Compare pricing
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-3xl px-5 py-16">
            <p className="eyebrow">Questions</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em]">
              The short answers.
            </h2>
            <div className="mt-8">
              <FaqList />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-inkdeep">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-16 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow">Get started</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
                Your first drop can land this week.
              </h2>
              <p className="mt-2 text-white/70">
                Create an account, pick a feed, and start working fresh
                Singapore leads.
              </p>
            </div>
            <Link href="/signup" className="btn btn-light shrink-0">
              Create free account
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
