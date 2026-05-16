import { NextRequest, NextResponse } from "next/server";
import { stripe, priceIdToTier } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    // ─── Checkout completed — upgrade user ─────────────────────────
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (!userId) break;

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        const tier = priceIdToTier(priceId ?? "");

        if (tier) {
          await prisma.user.update({
            where: { id: userId },
            data: { tier },
          });
          console.log(`[STRIPE] User ${userId} upgraded to ${tier}`);
        }
      }
      break;
    }

    // ─── Subscription updated (upgrade/downgrade) ──────────────────
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const userId = subscription.metadata?.userId;
      if (!userId) break;

      const priceId = subscription.items.data[0]?.price.id;
      const tier = priceIdToTier(priceId ?? "");

      if (tier) {
        await prisma.user.update({
          where: { id: userId },
          data: { tier },
        });
        console.log(`[STRIPE] User ${userId} subscription updated to ${tier}`);
      }
      break;
    }

    // ─── Subscription cancelled or expired — downgrade to free ─────
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const userId = subscription.metadata?.userId;
      if (!userId) break;

      await prisma.user.update({
        where: { id: userId },
        data: { tier: "free" },
      });
      console.log(`[STRIPE] User ${userId} downgraded to free (subscription ended)`);
      break;
    }

    // ─── Payment failed — warn but don't downgrade yet ─────────────
    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const customerId =
        typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.id;

      if (customerId) {
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
          select: { id: true, email: true },
        });
        if (user) {
          console.warn(`[STRIPE] Payment failed for user ${user.id} (${user.email})`);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
