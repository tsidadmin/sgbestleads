import Link from "next/link";
import { Lock } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { accessibleSubsFor } from "@/lib/db";
import { FEED_IDS, feedsForPlan, getPlan } from "@/lib/plans";
import { generateLeads } from "@/lib/sample-leads";
import LeadsTable from "@/components/LeadsTable";

export const metadata = { title: "Leads" };

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ feed?: string }>;
}) {
  const sp = await searchParams;
  const user = (await getSessionUser())!; // layout guards
  const subs = await accessibleSubsFor(user.id);
  const unlocked = new Set(subs.flatMap((s) => feedsForPlan(s.planId)));

  const requested = sp.feed && unlocked.has(sp.feed) ? sp.feed : null;
  const active = requested ?? [...unlocked][0] ?? null;

  return (
    <div>
      <p className="eyebrow">Leads</p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight">
        This month&apos;s records
      </h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {FEED_IDS.map((id) => {
          const plan = getPlan(id)!;
          const has = unlocked.has(id);
          const isActive = id === active;
          const base =
            "inline-flex items-center gap-1.5 rounded-[3px] border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors";
          if (has) {
            return (
              <Link
                key={id}
                href={`/dashboard/leads?feed=${id}`}
                className={`${base} ${
                  isActive
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-card text-ink hover:border-ink"
                }`}
              >
                {plan.code} — {plan.name}
              </Link>
            );
          }
          return (
            <Link
              key={id}
              href="/pricing"
              title="Subscribe to unlock this feed"
              className={`${base} border-line bg-card text-soft opacity-70 hover:opacity-100`}
            >
              <Lock className="h-3 w-3" />
              {plan.code} — {plan.name}
            </Link>
          );
        })}
      </div>

      {active === null ? (
        <div className="mt-8 rounded-[4px] border border-line bg-card p-8">
          <h2 className="text-lg font-bold">No feeds unlocked yet.</h2>
          <p className="mt-1.5 max-w-xl text-sm text-soft">
            Subscribe to a lead feed and this page fills with fresh records
            every week — filterable, exportable, ready for outreach.
          </p>
          <Link href="/pricing" className="btn btn-primary mt-5">
            Browse lead feeds
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-5 rounded-[3px] border border-line bg-wash px-3 py-2 font-mono text-[11px] text-soft">
            SAMPLE DATASET — records shown are fictional demo data. The
            production sourcing pipeline plugs in at src/lib/sample-leads.ts.
          </p>
          <div className="mt-5">
            <LeadsTable
              leads={generateLeads(active)}
              feedCode={getPlan(active)!.code}
              feedName={getPlan(active)!.name}
            />
          </div>
        </>
      )}
    </div>
  );
}
