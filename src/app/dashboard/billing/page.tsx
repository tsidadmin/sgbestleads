import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { hasAccess, subscriptionsFor } from "@/lib/db";
import { getPlan, priceFor } from "@/lib/plans";
import { stripeEnabled } from "@/lib/stripe";
import { fmtDate, sgd } from "@/lib/format";
import CancelButton from "@/components/CancelButton";

export const metadata = { title: "Billing" };

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await searchParams; // consume a request-time API so the route renders dynamically
  const user = (await getSessionUser())!; // layout guards
  const subs = await subscriptionsFor(user.id);
  const stripeOn = stripeEnabled();

  return (
    <div>
      <p className="eyebrow">Billing</p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight">
        Your subscriptions
      </h1>

      {!stripeOn && (
        <p className="mt-5 rounded-[3px] border border-line bg-wash px-3 py-2 font-mono text-[11px] text-soft">
          DEMO BILLING MODE — Stripe keys are not configured, so subscriptions
          activate instantly without payment. Set STRIPE_SECRET_KEY to enable
          real checkout.
        </p>
      )}

      {subs.length === 0 ? (
        <div className="mt-8 rounded-[4px] border border-line bg-card p-8">
          <h2 className="text-lg font-bold">Nothing here yet.</h2>
          <p className="mt-1.5 max-w-xl text-sm text-soft">
            When you subscribe to a feed, it shows up here with its billing
            interval, renewal date and a one-click cancel.
          </p>
          <Link href="/pricing" className="btn btn-primary mt-5">
            Browse lead feeds
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {subs.map((s) => {
            const plan = getPlan(s.planId);
            if (!plan) return null;
            const access = hasAccess(s);
            return (
              <div
                key={s.id}
                className="flex flex-col gap-4 rounded-[4px] border border-line bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="code-chip">{plan.code}</span>
                    <h2 className="font-bold">{plan.name}</h2>
                    <span className="chip">
                      {s.interval === "month" ? "Monthly" : "Annual"}
                    </span>
                  </div>
                  <p className="mt-1.5 font-mono text-[11px] text-soft">
                    {sgd(priceFor(plan, s.interval))}/
                    {s.interval === "month" ? "mo" : "yr"} · started{" "}
                    {fmtDate(s.startedAt)} ·{" "}
                    {s.status === "active"
                      ? `renews ${fmtDate(s.currentPeriodEnd)}`
                      : access
                        ? `cancelled — access until ${fmtDate(s.currentPeriodEnd)}`
                        : `ended ${fmtDate(s.currentPeriodEnd)}`}
                  </p>
                </div>
                {s.status === "active" && (
                  <CancelButton id={s.id} planName={plan.name} />
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-8 font-mono text-[11px] text-soft">
        Card payments and invoices are handled by Stripe Checkout. Annual plans
        include 2 months free.
      </p>
    </div>
  );
}
