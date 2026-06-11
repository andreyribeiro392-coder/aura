// AuraFit Pro — Stripe Products & Prices
// These are the Stripe price IDs for the PRO subscription plan.
// In production, create the product/price in the Stripe Dashboard and paste the price ID here.

export const PRODUCTS = {
  pro: {
    name: "AuraFit Pro",
    description: "Unlimited AI coaching, personalized plans, and advanced analytics",
    // Use the Stripe price ID from your dashboard (e.g., price_xxx)
    // For testing, we use a lookup key approach
    priceId: process.env.STRIPE_PRO_PRICE_ID || "price_pro_monthly",
    amount: 999, // $9.99 in cents
    currency: "usd",
    interval: "month" as const,
  },
} as const;
