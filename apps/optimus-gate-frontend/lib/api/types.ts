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
  subscriptionId?: string;
  name: string;
  email: string;
  plan: string;
  lifetimeValue: number;
  paymentMethod: string;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: string | null;
  status: string;
};

export type SubscriptionRecord = {
  id: string;
  code: string;
  customer: string;
  plan: string;
  amount: number;
  nextCharge: string;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: string | null;
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

export type NotificationRecord = {
  id: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
};

export type RefundRecord = {
  id: string;
  reference: string;
  transaction: string;
  paymentReference?: string;
  customer: string;
  reason: string;
  amount: number;
  currency?: string;
  status: string;
};

export type PayoutRecord = {
  id: string;
  batch: string;
  account: string;
  amount: number;
  currency: string;
  entries: number;
  eta: string;
  status: string;
  providerReference: string;
  nombaTransactionId?: string | null;
  bankAccount?: PayoutBankAccountSnapshot | null;
  failureReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BankRecord = {
  code: string;
  name: string;
};

export type PayoutBankAccountSnapshot = {
  id?: string;
  bankCode?: string;
  bankName?: string | null;
  accountNumber?: string;
  accountName?: string;
};

export type PayoutBankAccountRecord = {
  id: string;
  bankCode: string;
  bankName?: string | null;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
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
