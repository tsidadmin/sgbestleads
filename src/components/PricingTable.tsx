"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  ANNUAL_SAVE_PCT,
  priceFor,
  type Plan,
  type PlanInterval,
} from "@/lib/plans";
import { sgd } from "@/lib/format";

export default function PricingTable({ plans }: { plans: Plan[] }) {
  const [billing, setBilling] = useState<PlanInterval>("month");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subscribe(planId: string) {
    setLoading(planId);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, interval: billing }),
      });
      if (res.status === 401) {
        window.location.href = "/login?next=/pricing";
        return;
      }
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Something went wrong. Try again.");
        setLoading(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Try again.");
      setLoading(null);
    }
  }

  function features(plan: Plan): string[] {
    return [
      `~${plan.perMonth} records per month`,
      `${plan.cadence} — new records every week`,
      "Company, UEN, contact, email, phone",
      "Buying signal on every record",
      "Dashboard access + CSV export",
      "Cancel anytime",
    ];
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="inline-flex rounded-[3px] border border-line bg-card p-1 font-mono text-xs">
          <button
            type="button"
            onClick={() => setBilling("month")}
            className={`rounded-[2px] px-4 py-1.5 font-semibold uppercase tracking-wider transition-colors ${
              billing === "month" ? "bg-ink text-white" : "text-soft hover:text-ink"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBilling("year")}
            className={`rounded-[2px] px-4 py-1.5 font-semibold uppercase tracking-wider transition-colors ${
              billing === "year" ? "bg-ink text-white" : "text-soft hover:text-ink"
            }`}
          >
            Annual
          </button>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-widest text-verify">
          Annual = 2 months free (save {ANNUAL_SAVE_PCT}%)
        </span>
      </div>

      {error && (
        <p className="mt-5 rounded-[3px] border border-accent/40 bg-accent/5 px-3 py-2 text-sm text-accent-deep">
          {error}
        </p>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-[4px] border bg-card p-6 ${
              plan.popular
                ? "border-ink shadow-[0_2px_0_rgba(20,27,34,0.15)]"
                : "border-line"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-2.5 left-6 rounded-[3px] bg-accent px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                Most popular
              </span>
            )}

            <div className="flex items-center justify-between">
              <span className="code-chip">{plan.code}</span>
              <span className="font-mono text-[11px] text-soft">
                ~{plan.perMonth}/mo
              </span>
            </div>

            <h3 className="mt-4 text-lg font-bold">{plan.name}</h3>
            <p className="mt-1 text-sm leading-relaxed text-soft">
              {plan.tagline}
            </p>

            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="font-mono text-3xl font-bold tracking-tight">
                {sgd(priceFor(plan, billing))}
              </span>
              <span className="font-mono text-xs text-soft">
                /{billing === "month" ? "mo" : "yr"}
              </span>
            </div>
            {billing === "year" ? (
              <p className="mt-1 font-mono text-[11px] text-verify">
                2 months free — vs {sgd(plan.monthly * 12)} billed monthly
              </p>
            ) : (
              <p className="mt-1 font-mono text-[11px] text-soft">
                or {sgd(priceFor(plan, "year"))}/yr on annual
              </p>
            )}

            <ul className="mt-5 space-y-2 text-sm">
              {features(plan).map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-verify"
                    strokeWidth={3}
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => subscribe(plan.id)}
              disabled={loading === plan.id}
              className={`btn mt-6 w-full ${
                plan.popular ? "btn-primary" : "btn-dark"
              }`}
            >
              {loading === plan.id ? "Redirecting…" : "Subscribe"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
