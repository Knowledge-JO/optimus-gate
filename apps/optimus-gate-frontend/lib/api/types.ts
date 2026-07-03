export type DashboardMetric = {
  label: string;
  value: string;
  change?: string;
  tone: "green" | "blue" | "amber" | "red" | "black";
};

export type PlanRecord = {
  id: string;
  name: string;
  code: string;
  currency?: string;
  description?: string | null;
  amount: number;
  interval: string;
  subscriptions: number;
  revenue: number;
  status: string;
};

export type CheckoutLinkRecord = {
  subscriptionId: string;
  invoiceId: string;
  paymentAttemptId: string;
  orderReference: string;
  checkoutLink?: string | null;
};

export type SubscriberRecord = {
  id: string;
  name: string;
  email: string;
  plan: string;
  lifetimeValue: number;
  paymentMethod: string;
  status: string;
};

export type SubscriptionRecord = {
  id: string;
  code: string;
  customer: string;
  plan: string;
  amount: number;
  nextCharge: string;
  attempts: number;
  status: string;
};

export type ApiKeyRecord = {
  id: string;
  name: string;
  prefix: string;
  environment: string;
  scopes: string[];
  lastUsedAt?: string | null;
  revokedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreatedApiKey = {
  apiKey: string;
  key: ApiKeyRecord;
};

export type TransactionRecord = {
  id: string;
  reference: string;
  customer: string;
  type: string;
  provider: string;
  amount: number;
  date: string;
  status: string;
};

export type RefundRecord = {
  id: string;
  reference: string;
  transaction: string;
  customer: string;
  reason: string;
  amount: number;
  status: string;
};

export type PayoutRecord = {
  id: string;
  batch: string;
  account: string;
  amount: number;
  entries: number;
  eta: string;
  status: string;
};

export type SubaccountRecord = {
  id: string;
  name: string;
  bank: string;
  account: string;
  split: string;
  received: number;
  status: string;
};

export type OnboardingChecklistItem = {
  id: string;
  title: string;
  description: string;
  status: string;
};
