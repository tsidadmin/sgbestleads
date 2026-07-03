import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { accessibleSubsFor, activateSubscription } from "@/lib/db";
import { getPlan, priceFor, type PlanInterval } from "@/lib/plans";
import { appUrl, getStripe, stripeEnabled } from "@/lib/stripe";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Log in to subscribe." },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  const plan = getPlan(String(body?.planId ?? ""));
  const interval: PlanInterval = body?.interval === "year" ? "year" : "month";
  if (!plan) {
    return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
  }

  const existing = await accessibleSubsFor(user.id);
  if (existing.some((s) => s.planId === plan.id && s.status === "active")) {
    return NextResponse.json(
      { error: "You already have an active subscription to this feed." },
      { status: 409 }
    );
  }

  const origin = appUrl(new URL(req.url).origin);

  // Demo mode: no Stripe key configured — activate instantly.
  if (!stripeEnabled()) {
    await activateSubscription({ userId: user.id, planId: plan.id, interval });
    return NextResponse.json({
      url: `${origin}/dashboard?activated=${plan.id}&demo=1`,
    });
  }

  const stripe = getStripe()!;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "sgd",
          unit_amount: priceFor(plan, interval) * 100,
          recurring: { interval },
          product_data: {
            name: `${plan.name} — SG Best Leads`,
            description: plan.tagline,
          },
        },
      },
    ],
    metadata: { userId: user.id, planId: plan.id, interval },
    subscription_data: {
      metadata: { userId: user.id, planId: plan.id, interval },
    },
    success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?cancelled=1`,
  });

  return NextResponse.json({ url: session.url });
}
