import Stripe from "stripe";

function getStripeClient() {
 const key = process.env.STRIPE_SECRET_KEY;
 if (!key) throw new Error("STRIPE_SECRET_KEY is not set. Add it to .env.local after creating your Stripe account.");
 return new Stripe(key);
}

// Lazy initialization, only creates client when actually called
export const stripe = new Proxy({} as Stripe, {
 get(_, prop) {
 return (getStripeClient() as unknown as Record<string | symbol, unknown>)[prop];
 },
});

/**
 * Stripe Price IDs, set these in .env.local after creating products in Stripe Dashboard.
 *
 * You need to create 2 products in Stripe:
 * 1. "THE FORGE Pro" with 2 prices: monthly ($9) and annual ($86.40 = $7.20/mo)
 * 2. "THE FORGE Team" with 2 prices: monthly ($29) and annual ($278.40 = $23.20/mo)
 */
export const PRICE_IDS = {
 pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
 pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL!,
 team_monthly: process.env.STRIPE_PRICE_TEAM_MONTHLY!,
 team_annual: process.env.STRIPE_PRICE_TEAM_ANNUAL!,
} as const;

export type PlanKey = keyof typeof PRICE_IDS;

export function priceIdToTier(priceId: string): "pro" | "team" | null {
 if (priceId === PRICE_IDS.pro_monthly || priceId === PRICE_IDS.pro_annual) return "pro";
 if (priceId === PRICE_IDS.team_monthly || priceId === PRICE_IDS.team_annual) return "team";
 return null;
}
