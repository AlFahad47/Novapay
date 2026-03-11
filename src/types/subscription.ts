export type SubscriptionPlan = "monthly" | "yearly";

export const SUBSCRIPTION_PRICES: Record<SubscriptionPlan, number> = {
  monthly: 299,
  yearly: 2499,
};

export const SUBSCRIPTION_DURATION_DAYS: Record<SubscriptionPlan, number> = {
  monthly: 30,
  yearly: 365,
};

export const ELITE_FEATURES = [
  "International Pay",
  "Split Bill",
  "Micro Saving",
];

export interface SubscriptionData {
  active: boolean;
  plan: SubscriptionPlan;
  startDate: string;
  expiresAt: string;
  amount: number;
}

export interface SubscriptionStatusResponse {
  subscribed: boolean;
  subscription: SubscriptionData | null;
  daysLeft: number | null;
}
