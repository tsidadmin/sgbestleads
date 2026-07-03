export type PlanInterval = "month" | "year";

export type Plan = {
  id: string;
  code: string;
  name: string;
  tagline: string;
  description: string;
  monthly: number; // SGD per month
  perMonth: number; // approx records per month
  cadence: string;
  audience: string;
  popular?: boolean;
};

/** Annual plans include this many free months (12 - free = billed). */
export const ANNUAL_MONTHS_FREE = 2;
export const ANNUAL_SAVE_PCT = Math.round((ANNUAL_MONTHS_FREE / 12) * 100); // 17

export const FEED_IDS = [
  "new-companies",
  "hiring",
  "digital-gap",
  "fnb-retail",
  "finance",
] as const;

export const PLANS: Plan[] = [
  {
    id: "new-companies",
    code: "NC",
    name: "New Company Leads",
    tagline: "Every fresh Singapore incorporation, enriched.",
    description:
      "Companies newly registered with ACRA, segmented by industry and enriched with business contact details while they are still setting up suppliers and services.",
    monthly: 179,
    perMonth: 300,
    cadence: "Weekly drop",
    audience: "Corp-sec, banking, insurance, office services, agencies",
  },
  {
    id: "hiring",
    code: "HR",
    name: "HR & Hiring Leads",
    tagline: "Companies actively hiring, with HR decision makers.",
    description:
      "Singapore companies with live job openings, matched to the HR or hiring decision maker. A hiring signal is a budget signal.",
    monthly: 199,
    perMonth: 150,
    cadence: "Weekly drop",
    audience: "Recruiters, HR tech, payroll, training providers",
  },
  {
    id: "digital-gap",
    code: "DG",
    name: "Digital Gap Leads",
    tagline: "Great reviews. Weak website. Ready to upgrade.",
    description:
      "Businesses with strong Google ratings but outdated or missing websites, scored 1–5 on web presence. The weakest sites surface first.",
    monthly: 149,
    perMonth: 120,
    cadence: "Weekly drop",
    audience: "Web agencies, marketers, SaaS, POS and booking tools",
  },
  {
    id: "fnb-retail",
    code: "FB",
    name: "F&B & Retail Leads",
    tagline: "New outlets, renovations and expansion signals.",
    description:
      "Food and beverage and retail operators showing growth signals — new outlets, fit-outs, franchise activity and crew hiring across Singapore.",
    monthly: 129,
    perMonth: 150,
    cadence: "Weekly drop",
    audience: "F&B suppliers, fit-out firms, POS, hygiene, logistics",
  },
  {
    id: "finance",
    code: "FS",
    name: "Corporate Finance Prospects",
    tagline: "SMEs signalling funding and coverage needs.",
    description:
      "Singapore SMEs with expansion signals relevant to corporate financing, business insurance and advisory — new directors, grants, fleet and headcount growth.",
    monthly: 249,
    perMonth: 100,
    cadence: "Weekly drop",
    audience: "Financial advisers, business insurance, lenders",
  },
  {
    id: "all-access",
    code: "ALL",
    name: "All-Access",
    tagline: "Every feed. One subscription.",
    description:
      "All five lead feeds in one plan — the full weekly pipeline across new companies, hiring, digital gap, F&B and finance signals.",
    monthly: 599,
    perMonth: 820,
    cadence: "Weekly drop",
    audience: "Agencies and sales teams running multi-line outbound",
    popular: true,
  },
];

export function getPlan(id: string): Plan | null {
  return PLANS.find((p) => p.id === id) ?? null;
}

export function priceFor(plan: Plan, interval: PlanInterval): number {
  return interval === "month"
    ? plan.monthly
    : plan.monthly * (12 - ANNUAL_MONTHS_FREE);
}

/** Which feeds a given plan unlocks in the dashboard. */
export function feedsForPlan(planId: string): string[] {
  if (planId === "all-access") return [...FEED_IDS];
  return FEED_IDS.includes(planId as (typeof FEED_IDS)[number]) ? [planId] : [];
}
