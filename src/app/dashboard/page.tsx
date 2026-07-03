import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { accessibleSubsFor, activateSubscription } from "@/lib/db";
import { feedsForPlan, getPlan, priceFor } from "@/lib/plans";
import { generateLeads, leadCountThisMonth } from "@/lib/sample-leads";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { fmtDate, nextDropDate, sgd } from "@/lib/format";

export const metadata = { title: "Dashboard" };

type SP = Promise<{ session_id?: string; activated?: string; demo?: string }>;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const sp = await searchParams;
  const user = (await getSessionUser())!; // layout guards

  let justActivated: string | null = sp.activated ?? null;

  // Fallback verification for Stripe checkout returns (covers local dev
  // where webhooks are not forwarded).
  if (sp.session_id && stripeEnabled()) {
    try {
      const stripe = getStripe()!;
      const session = await stripe.checkout.sessions.retrieve(sp.session_id);
      const md = session.metadata;
      if (
        session.payment_status === "paid" &&
        md?.userId === user.id &&
        md.planId &&
        (md.interval === "month" || md.interval === "year")
      ) {
        const stripeSubscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        await activateSubscription({
          userId: user.id,
          planId: md.planId,
          interval: md.interval,
          stripeSubscriptionId,
        });
        justActivated = md.planId;
      }
    } catch {
      // Ignore — the webhook remains the source of truth.
    }
  }

  const subs = await accessibleSubsFor(user.id);
  const feedIds = [...new Set(subs.flatMap((s) => feedsForPlan(s.planId)))];
  const recordCount = leadCountThisMonth(feedIds);
  const preview = feedIds.length ? generateLeads(feedIds[0]).slice(0, 6) : [];
  const activatedPlan = justActivated ? getPlan(justActivated) : null;
  const firstName = user.name.split(" ")[0];

  return (
    <div>
      {activatedPlan && (
        <div className="mb-8 rounded-[4px] border border-verify/40 bg-verify/5 px-4 py-3">
          <p className="text-sm font-semibold text-verify">
            Subscription active — {activatedPlan.name}. Your feed is live
            below.
          </p>
          {sp.demo && (
            <p className="mt-0.5 font-mono text-[11px] text-soft">
              Demo billing mode: activated instantly without payment.
            </p>
          )}
        </div>
      )}

      <p className="eyebrow">Overview</p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight">
        Welcome back, {firstName}.
      </h1>

      {subs.length === 0 ? (
        <div className="mt-8 rounded-[4px] border border-line bg-card p-8">
          <h2 className="text-lg font-bold">No active feeds yet.</h2>
          <p className="mt-1.5 max-w-xl text-sm text-soft">
            Subscribe to a lead feed and this dashboard fills with fresh,
            verified Singapore records every week.
          </p>
          <Link href="/pricing" className="btn btn-primary mt-5">
            Browse lead feeds
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[4px] border border-line bg-card p-5">
              <p className="font-mono text-[11px] uppercase tracking-widest text-soft">
                Active feeds
              </p>
              <p className="mt-2 font-mono text-3xl font-bold">
                {feedIds.length}
              </p>
            </div>
            <div className="rounded-[4px] border border-line bg-card p-5">
              <p className="font-mono text-[11px] uppercase tracking-widest text-soft">
                Records this month
              </p>
              <p className="mt-2 font-mono text-3xl font-bold">{recordCount}</p>
            </div>
            <div className="rounded-[4px] border border-line bg-card p-5">
              <p className="font-mono text-[11px] uppercase tracking-widest text-soft">
                Next drop
              </p>
              <p className="mt-2 font-mono text-3xl font-bold">
                {fmtDate(nextDropDate())}
              </p>
            </div>
          </div>

          <h2 className="mt-10 text-lg font-bold">Your subscriptions</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {subs.map((s) => {
              const plan = getPlan(s.planId);
              if (!plan) return null;
              const firstFeed = feedsForPlan(s.planId)[0] ?? s.planId;
              return (
                <div
                  key={s.id}
                  className="rounded-[4px] border border-line bg-card p-5"
                >
                  <div className="flex items-center gap-2">
                    <span className="code-chip">{plan.code}</span>
                    <h3 className="font-bold">{plan.name}</h3>
                    <span className="chip ml-auto">
                      {s.interval === "month" ? "Monthly" : "Annual"}
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-[11px] text-soft">
                    {sgd(priceFor(plan, s.interval))}/
                    {s.interval === "month" ? "mo" : "yr"} ·{" "}
                    {s.status === "active"
                      ? `renews ${fmtDate(s.currentPeriodEnd)}`
                      : `cancelled — access until ${fmtDate(s.currentPeriodEnd)}`}
                  </p>
                  <Link
                    href={`/dashboard/leads?feed=${firstFeed}`}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-deep"
                  >
                    Open feed
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>

          {preview.length > 0 && (
            <>
              <div className="mt-10 flex items-baseline justify-between">
                <h2 className="text-lg font-bold">Latest records</h2>
                <Link
                  href="/dashboard/leads"
                  className="text-sm font-semibold text-accent hover:text-accent-deep"
                >
                  Open leads
                </Link>
              </div>
              <div className="mt-4 overflow-x-auto rounded-[4px] border border-line bg-card">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="font-mono text-[10px] uppercase tracking-widest text-soft">
                      <th className="border-b border-line px-4 py-2.5 font-medium">
                        Company
                      </th>
                      <th className="border-b border-line px-4 py-2.5 font-medium">
                        Contact
                      </th>
                      <th className="border-b border-line px-4 py-2.5 font-medium">
                        Signal
                      </th>
                      <th className="border-b border-line px-4 py-2.5 font-medium">
                        Added
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {preview.map((l) => (
                      <tr key={l.id} className="hover:bg-wash/60">
                        <td className="px-4 py-3 font-semibold">{l.company}</td>
                        <td className="px-4 py-3">
                          {l.contact}
                          <span className="text-soft"> · {l.role}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block rounded-[3px] bg-wash px-2 py-1 font-mono text-[11px]">
                            {l.signal}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-soft">
                          {fmtDate(l.added)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
