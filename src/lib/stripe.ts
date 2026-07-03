import Stripe from "stripe";

/**
 * Billing runs in one of two modes:
 *  - Stripe mode: STRIPE_SECRET_KEY is set. Checkout + webhooks handle payment.
 *  - Demo mode: no key. Subscriptions activate instantly so the product can be
 *    demoed end-to-end without a Stripe account.
 */

export function stripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let client: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!client) client = new Stripe(key);
  return client;
}

export function appUrl(fallbackOrigin: string): string {
  return process.env.NEXT_PUBLIC_APP_URL || fallbackOrigin;
}
