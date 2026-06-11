import express, { Express, Request, Response } from "express";
import Stripe from "stripe";
import { upsertSubscription } from "./db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-05-27.dahlia",
});

export function registerStripeRoutes(app: Express) {
  // Webhook must use raw body BEFORE json middleware
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      let event: Stripe.Event;

      try {
        if (!sig || !webhookSecret) {
          return res.status(400).json({ error: "Missing signature or webhook secret" });
        }
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err: any) {
        console.error("[Stripe Webhook] Signature verification failed:", err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
      }

      // Handle test events
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      console.log(`[Stripe Webhook] Event: ${event.type} | ID: ${event.id}`);

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = parseInt(session.metadata?.user_id || "0");
            if (userId && session.subscription) {
              await upsertSubscription(userId, {
                plan: "pro",
                status: "active",
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
              });
              console.log(`[Stripe] PRO activated for user ${userId}`);
            }
            break;
          }

          case "customer.subscription.updated": {
            const sub = event.data.object as Stripe.Subscription;
            const userId = parseInt(sub.metadata?.user_id || "0");
            if (userId) {
              const isActive = sub.status === "active" || sub.status === "trialing";
              await upsertSubscription(userId, {
                plan: isActive ? "pro" : "free",
                status: sub.status,
                stripeSubscriptionId: sub.id,
                stripeCustomerId: sub.customer as string,
              });
            }
            break;
          }

          case "customer.subscription.deleted": {
            const sub = event.data.object as Stripe.Subscription;
            const userId = parseInt(sub.metadata?.user_id || "0");
            if (userId) {
              await upsertSubscription(userId, {
                plan: "free",
                status: "canceled",
                stripeSubscriptionId: sub.id,
              });
              console.log(`[Stripe] PRO canceled for user ${userId}`);
            }
            break;
          }

          case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice;
            const subId = (invoice as any).subscription as string;
            console.log(`[Stripe] Payment failed for subscription ${subId}`);
            break;
          }

          default:
            console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }
      } catch (err) {
        console.error("[Stripe Webhook] Error processing event:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      res.json({ received: true });
    }
  );
}

export async function createCheckoutSession(
  userId: number,
  userEmail: string,
  userName: string,
  origin: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    customer_email: userEmail,
    client_reference_id: userId.toString(),
    metadata: {
      user_id: userId.toString(),
      customer_email: userEmail,
      customer_name: userName,
    },
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "AuraFit Pro",
            description: "Unlimited AI coaching, personalized plans, and advanced analytics",
            images: [],
          },
          unit_amount: 999, // $9.99
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
    success_url: `${origin}/upgrade?success=true`,
    cancel_url: `${origin}/upgrade?canceled=true`,
    subscription_data: {
      metadata: {
        user_id: userId.toString(),
      },
    },
  });

  return session.url || "";
}
