import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import PricingTable from "@/components/PricingTable";
import FaqList from "@/components/FaqList";
import { ANNUAL_SAVE_PCT, PLANS } from "@/lib/plans";

export const metadata: Metadata = { title: "Feeds & pricing" };

export default function PricingPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-6xl px-5 py-14 md:py-20">
        <p className="eyebrow">Feeds &amp; pricing</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.02em]">
          One subscription per feed.
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-soft">
          Every plan includes weekly drops, verified contacts, dashboard access
          and CSV export. Annual billing takes {ANNUAL_SAVE_PCT}% off.
        </p>

        <div className="mt-10">
          <PricingTable plans={PLANS} />
        </div>

        <div className="mt-16 grid gap-6 rounded-[4px] border border-line bg-wash p-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-lg font-bold">Need a custom feed?</h2>
            <p className="mt-1.5 max-w-xl text-sm text-soft">
              Specific industry, territory or volume — we build private feeds
              for teams, delivered to your dashboard on the same weekly cycle.
            </p>
          </div>
          <a
            href="mailto:hello@sgbestleads.com"
            className="btn btn-dark shrink-0"
          >
            hello@sgbestleads.com
          </a>
        </div>

        <section className="mt-16 max-w-3xl">
          <h2 className="text-2xl font-extrabold tracking-tight">Questions</h2>
          <div className="mt-6">
            <FaqList />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
