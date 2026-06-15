// Billing plans — the single source of truth for pricing, limits and gated
// features. Kept as plain config so it is trivial to tweak or wire to Stripe.

import { PAGE_CHARS } from "./constants";
import type { PlanId } from "./types";

export interface Plan {
  id: PlanId;
  name: string;
  /** Monthly price in USD. 0 = free. */
  priceMonthly: number;
  tagline: string;
  limits: {
    /** Max number of chatbots. */
    bots: number;
    /** Max pages of knowledge (1 page = PAGE_CHARS characters). */
    pages: number;
    /** Max user messages answered per calendar month. */
    messagesPerMonth: number;
  };
  /** Whether the "Powered by" badge can be hidden on the widget. */
  removeBranding: boolean;
  /** Whether custom accent colors are allowed. */
  customColors: boolean;
  /** Marketing bullet points for the pricing page. */
  features: string[];
  /** Visually highlight this plan on the pricing page. */
  highlighted?: boolean;
}

export const PLAN_ORDER: PlanId[] = ["free", "pro", "business"];

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    tagline: "Try it on a side project.",
    limits: { bots: 1, pages: 50, messagesPerMonth: 100 },
    removeBranding: false,
    customColors: false,
    features: [
      "1 chatbot",
      "50 pages of knowledge",
      "100 messages / month",
      "Website embed widget",
      "Answer citations",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 29,
    tagline: "For a growing product with real users.",
    limits: { bots: 3, pages: 1000, messagesPerMonth: 2000 },
    removeBranding: true,
    customColors: true,
    features: [
      "3 chatbots",
      "1,000 pages of knowledge",
      "2,000 messages / month",
      "Remove “Powered by” badge",
      "Custom widget colors",
      "Email + PDF + URL sources",
    ],
    highlighted: true,
  },
  business: {
    id: "business",
    name: "Business",
    priceMonthly: 99,
    tagline: "For teams handling support at scale.",
    limits: { bots: 10, pages: 10000, messagesPerMonth: 20000 },
    removeBranding: true,
    customColors: true,
    features: [
      "10 chatbots",
      "10,000 pages of knowledge",
      "20,000 messages / month",
      "Everything in Pro",
      "Priority answer quality",
      "Custom branding",
    ],
  },
};

export function getPlan(id: PlanId | string | null | undefined): Plan {
  if (id && id in PLANS) return PLANS[id as PlanId];
  return PLANS.free;
}

/** Convert a character count into whole pages, for limit checks and display. */
export function charsToPages(chars: number): number {
  return Math.ceil(chars / PAGE_CHARS);
}
