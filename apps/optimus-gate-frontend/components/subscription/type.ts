export type SubscriptionStatus =
  "Active" | "Cancelled" | "Completed" | "Attention";

export type SubscriptionFilterTab = "All" | SubscriptionStatus;

export type Interval = "daily" | "weekly" | "monthly" | "annually";

export interface Subscription {
  id: string;
  subscriptionCode: string;
  plan: {
    id: string;
    name: string;
  };
  subscriber: {
    name: string;
    email: string;
  };
  amount: number;
  interval: Interval;
  status: SubscriptionStatus;
  nextChargeDate: string | null;
}

export interface Card {
  brand: "visa" | "mastercard" | "verve";
  last4: string;
  expiryMonth: string;
  expiryYear: string;
}

export interface SubscriptionDetail extends Subscription {
  card?: Card;
  subscribedOn: string;
  paymentsCompleted: number;
  paymentsTotal?: number;
  lifetimeValue: number;
}
