import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, PRICE_IDS, PlanKey } from "@/lib/stripe";

export async function POST(req: NextRequest) {
 const session = await auth();
 if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const { plan } = (await req.json()) as { plan: PlanKey };

 if (!PRICE_IDS[plan]) {
 return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
 }

 const user = await prisma.user.findUnique({
 where: { id: session.user.id },
 select: { email: true, stripeCustomerId: true },
 });

 if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

 // Get or create Stripe customer
 let customerId = user.stripeCustomerId;
 if (!customerId) {
 const customer = await stripe.customers.create({
 email: user.email,
 metadata: { userId: session.user.id },
 });
 customerId = customer.id;
 await prisma.user.update({
 where: { id: session.user.id },
 data: { stripeCustomerId: customerId },
 });
 }

 const origin = req.headers.get("origin") || "http://localhost:3000";

 const checkoutSession = await stripe.checkout.sessions.create({
 customer: customerId,
 mode: "subscription",
 line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
 success_url: `${origin}/dashboard/settings?upgraded=true`,
 cancel_url: `${origin}/pricing`,
 metadata: { userId: session.user.id, plan },
 subscription_data: {
 metadata: { userId: session.user.id, plan },
 },
 });

 return NextResponse.json({ url: checkoutSession.url });
}
