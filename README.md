# SG Best Leads

Subscription SaaS for Singapore B2B lead feeds. Customers subscribe to a lead
category (monthly, or annual with 2 months free), and receive fresh, verified
records every week in a dashboard with CSV export.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4 and Stripe.

## What is in the box

- **Marketing site** — landing page with an animated live-feed ledger, feed
  catalogue, how-it-works, FAQ and CTA sections.
- **Pricing** — six plans (five feeds + All-Access bundle) with a
  monthly / annual toggle. Annual pricing bills 10 months instead of 12
  (17% saving), computed from one source of truth in `src/lib/plans.ts`.
- **Auth** — email + password accounts (bcrypt hashed), httpOnly cookie
  sessions, protected dashboard.
- **Billing** — Stripe Checkout subscriptions with inline prices (no manual
  Stripe product setup needed), webhook activation, checkout-return fallback
  verification, cancel-at-period-end. Runs in **demo mode** with zero
  configuration: without a Stripe key, subscriptions activate instantly so the
  whole product can be demoed.
- **Dashboard** — overview with stats and latest records, a leads workspace
  with per-feed tabs, locked states for unsubscribed feeds, search filter and
  one-click CSV export, plus a billing page with cancellation.
- **Sample data engine** — deterministic, clearly-fictional Singapore-style
  records per feed (`src/lib/sample-leads.ts`). This is the single file to
  replace with the real sourcing pipeline.

## The feeds

| Code | Feed                        | Monthly | Annual (2 mo free) | ~Records/mo |
| ---- | --------------------------- | ------- | ------------------ | ----------- |
| NC   | New Company Leads           | S$179   | S$1,790            | 300         |
| HR   | HR & Hiring Leads           | S$199   | S$1,990            | 150         |
| DG   | Digital Gap Leads           | S$149   | S$1,490            | 120         |
| FB   | F&B & Retail Leads          | S$129   | S$1,290            | 150         |
| FS   | Corporate Finance Prospects | S$249   | S$2,490            | 100         |
| ALL  | All-Access                  | S$599   | S$5,990            | 820         |

Edit names, pricing, volumes and copy in `src/lib/plans.ts` — everything else
(pricing page, checkout amounts, dashboard) derives from it.

## Quickstart

```bash
npm install
npm run dev
```

Open http://localhost:3000, create an account, and subscribe to a feed — with
no Stripe key set, the app runs in demo billing mode and activates the
subscription instantly.

## Enabling real payments (Stripe)

1. Copy the env template: `cp .env.example .env.local`
2. Add your secret key from the Stripe dashboard:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   ```
3. (Recommended) Forward webhooks in local dev:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   and put the printed signing secret in `STRIPE_WEBHOOK_SECRET`.
4. Restart the dev server. Checkout now goes through Stripe (use test card
   `4242 4242 4242 4242`).

No Stripe products or prices need to be created — checkout uses inline
`price_data` in SGD with the correct monthly/annual recurring interval.
Subscriptions are activated by the webhook; as a fallback (useful in local dev
without webhook forwarding), the dashboard verifies the checkout session on
return and activates it if paid.

| Variable                | Required          | Purpose                                    |
| ----------------------- | ----------------- | ------------------------------------------ |
| `STRIPE_SECRET_KEY`     | No (demo without) | Enables real Stripe Checkout               |
| `STRIPE_WEBHOOK_SECRET` | With Stripe       | Verifies webhook signatures                |
| `NEXT_PUBLIC_APP_URL`   | In production     | Absolute base URL for checkout redirects   |

## Project structure

```
src/
  lib/
    plans.ts          # feed catalogue + pricing (single source of truth)
    db.ts             # JSON file store: users, sessions, subscriptions
    auth.ts           # signup/login, bcrypt, cookie sessions
    stripe.ts         # Stripe client + demo-mode switch
    sample-leads.ts   # fictional sample data engine (swap for real pipeline)
    format.ts         # SGD currency, dates, next-drop date
  components/         # ledger hero, pricing table, leads table, nav, etc.
  app/
    page.tsx          # landing
    pricing/          # plans with monthly/annual toggle
    login/ signup/    # auth
    dashboard/        # overview, leads, billing (session-gated)
    api/              # auth, checkout, stripe webhook, cancel
data/                 # runtime JSON store (gitignored)
```

## Production notes

- **Database** — the JSON file store (`src/lib/db.ts`) is deliberate for the
  MVP: zero setup, one file to swap. For production (and for serverless hosts
  like Vercel, where the filesystem is ephemeral), replace it with Postgres /
  Supabase / Prisma. All reads and writes go through that one module.
- **Sample data** — `src/lib/sample-leads.ts` generates fictional records
  (reserved `.example` email domain, generated UENs) and the UI labels them as
  sample data. Plug the real sourcing pipeline in here.
- **Compliance** — feeds are positioned as business contact data from publicly
  published sources. Keep the PDPA framing in the footer/FAQ, and remember DNC
  registry obligations apply to outbound calls to Singapore numbers.
- **Hardening backlog** — rate-limit auth endpoints, add password reset,
  email verification, and a Stripe customer portal link for self-serve
  invoice/card management.

## Push this repo to GitHub

The repo is already initialised with a commit. From this folder:

```bash
# Option A — GitHub CLI (fastest)
gh repo create sg-best-leads --private --source=. --push

# Option B — manual
# 1) Create an empty repo named sg-best-leads on github.com (no README)
# 2) Then:
git remote add origin https://github.com/<your-username>/sg-best-leads.git
git branch -M main
git push -u origin main
```

## Scripts

| Command         | Purpose                  |
| --------------- | ------------------------ |
| `npm run dev`   | Dev server (Turbopack)   |
| `npm run build` | Production build         |
| `npm run start` | Serve production build   |

---

SG Best Leads · A TSiD LLP brand.
