import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { activateSubscription, cancelByStripeId } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 501 }
    );
  }

  const signature = req.headers.get("stripe-signature") ?? "";
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const md = session.metadata;
    if (
      md?.userId &&
      md.planId &&
      (md.interval === "month" || md.interval === "year")
    ) {
      const stripeSubscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      await activateSubscription({
        userId: md.userId,
        planId: md.planId,
        interval: md.interval,
        stripeSubscriptionId,
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    await cancelByStripeId(sub.id);
  }

  return NextResponse.json({ received: true });
}
