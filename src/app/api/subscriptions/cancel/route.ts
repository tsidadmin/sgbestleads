import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { cancelSubscription } from "@/lib/db";
import { getStripe, stripeEnabled } from "@/lib/stripe";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const id = String(body?.id ?? "");
  if (!id) {
    return NextResponse.json({ error: "Missing subscription id." }, { status: 400 });
  }

  const sub = await cancelSubscription(id, user.id);
  if (!sub) {
    return NextResponse.json(
      { error: "Subscription not found." },
      { status: 404 }
    );
  }

  if (sub.stripeSubscriptionId && stripeEnabled()) {
    try {
      await getStripe()!.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    } catch {
      // Local record is cancelled either way; Stripe state can be
      // reconciled from the dashboard if this call fails.
    }
  }

  return NextResponse.json({ ok: true });
}
