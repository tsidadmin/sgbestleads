import { Plus } from "lucide-react";

const FAQS: { q: string; a: string }[] = [
  {
    q: "Where do the leads come from?",
    a: "Each feed runs its own sourcing pipeline over publicly published business information — company registry data, live job postings, public business listings and review platforms. Records are verified and enriched with business contact details before they reach your dashboard.",
  },
  {
    q: "How often is each feed refreshed?",
    a: "Weekly. New records land in your dashboard every Monday and are included in your CSV export. Your monthly volume is spread across the weekly drops.",
  },
  {
    q: "How does the annual discount work?",
    a: "Annual billing includes 2 months free — you pay for 10 months instead of 12, a 17% saving. The price is locked for the year and the feed runs continuously.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from the billing page in one click. You keep access to your feed until the end of the current billing period, and everything you have exported is yours to keep.",
  },
  {
    q: "Is this PDPA-aware?",
    a: "Feeds carry business contact information compiled from publicly published sources — no consumer lists. If you plan to call Singapore numbers, Do Not Call registry obligations still apply to your outreach, and we flag this in the dashboard.",
  },
  {
    q: "Can you build a custom feed?",
    a: "Yes — specific industries, territories or volumes can be set up as a private feed for your team. Reach out and we will scope it with you.",
  },
];

export default function FaqList() {
  return (
    <div className="divide-y divide-line border-y border-line">
      {FAQS.map((item) => (
        <details key={item.q} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-semibold [&::-webkit-details-marker]:hidden">
            {item.q}
            <Plus className="h-4 w-4 shrink-0 text-soft transition-transform group-open:rotate-45" />
          </summary>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-soft">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
