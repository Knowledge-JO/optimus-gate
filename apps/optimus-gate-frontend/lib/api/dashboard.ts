import { backendFetch } from "./backend";
import type {
  ApiKeyRecord,
  BankRecord,
  DashboardMetric,
  OnboardingChecklistItem,
  PayoutBankAccountRecord,
  PayoutBankAccountSnapshot,
  PayoutRecord,
  PlanRecord,
  RefundRecord,
  SubscriberRecord,
  SubaccountRecord,
  SubscriptionRecord,
  TransactionRecord,
} from "./types";

type BackendPlan = {
  id: string;
  name: string;
  code?: string;
  currency?: string;
  description?: string | null;
  amount: string | number;
  interval: string;
  subscriptions?: number;
  revenue?: string | number;
  status?: string;
  isActive?: boolean;
};

type BackendSubscriber = Partial<SubscriberRecord> & {
  id: string;
  name?: string | null;
  email?: string | null;
  plan?: string | null;
  lifetimeValue?: string | number | null;
  paymentMethod?: string | null;
  status?: string | null;
};

type BackendSubscription = Partial<SubscriptionRecord> & {
  id: string;
  code?: string | null;
  customer?: string | null;
  customerEmail?: string | null;
  plan?: string | null;
  amount?: string | number | null;
  nextCharge?: string | null;
  currentPeriodEnd?: string | null;
  attempts?: number | null;
  status?: string | null;
};

type BackendPayout = Partial<PayoutRecord> & {
  id: string;
  amount?: string | number | null;
  currency?: string | null;
  status?: string | null;
  providerReference?: string | null;
  nombaTransactionId?: string | null;
  bankAccount?: PayoutBankAccountSnapshot | null;
  failureReason?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type BackendBanksResponse = {
  banks?: BankRecord[];
};

export const apiTags = {
  stats: "dashboard:stats",
  plans: "dashboard:plans",
  subscribers: "dashboard:subscribers",
  subscriptions: "dashboard:subscriptions",
  apiKeys: "dashboard:api-keys",
  transactions: "dashboard:transactions",
  refunds: "dashboard:refunds",
  payouts: "dashboard:payouts",
  payoutBanks: "dashboard:payout-banks",
  payoutBankAccounts: "dashboard:payout-bank-accounts",
  subaccounts: "dashboard:subaccounts",
  onboarding: "dashboard:onboarding",
};

export async function getDashboardMetrics() {
  return readOrEmpty<DashboardMetric>("/billing/dashboard/stats", {
    tags: [apiTags.stats],
    revalidate: 20,
  });
}

export async function getPlans() {
  const plans = await readOrEmpty<BackendPlan>("/billing/plans", {
    tags: [apiTags.plans],
    revalidate: 30,
  });

  return plans.map(toPlanRecord);
}

export async function getSubscribers() {
  const subscribers = await readOrEmpty<BackendSubscriber>(
    "/billing/subscribers",
    {
      tags: [apiTags.subscribers],
      revalidate: 30,
    },
  );

  return subscribers.map(toSubscriberRecord);
}

export async function getSubscriptions() {
  const subscriptions = await readOrEmpty<BackendSubscription>(
    "/billing/subscriptions",
    {
      tags: [apiTags.subscriptions],
      revalidate: 30,
    },
  );

  return subscriptions.map(toSubscriptionRecord);
}

export async function getTransactions() {
  return readOrEmpty<TransactionRecord>("/billing/transactions", {
    tags: [apiTags.transactions],
    revalidate: 20,
  });
}

export async function getRefunds() {
  return readOrEmpty<RefundRecord>("/billing/refunds", {
    tags: [apiTags.refunds],
    revalidate: 30,
  });
}

export async function getPayouts() {
  const payouts = await readOrEmpty<BackendPayout>("/billing/payouts", {
    tags: [apiTags.payouts],
    revalidate: 30,
  });

  return payouts.map(toPayoutRecord);
}

export async function getPayoutBanks() {
  const response = await backendFetch<BackendBanksResponse>(
    "/billing/payouts/banks",
    {
      tags: [apiTags.payoutBanks],
      revalidate: 60 * 60,
    },
  );

  if (!response.ok || !response.data?.banks) {
    return [];
  }

  return response.data.banks;
}

export async function getPayoutBankAccounts() {
  return readOrEmpty<PayoutBankAccountRecord>(
    "/billing/payouts/bank-accounts",
    {
      tags: [apiTags.payoutBankAccounts],
      revalidate: 30,
    },
  );
}

export async function getSubaccounts() {
  return readOrEmpty<SubaccountRecord>("/billing/subaccounts", {
    tags: [apiTags.subaccounts],
    revalidate: 30,
  });
}

export async function getOnboardingChecklist() {
  return readOrEmpty<OnboardingChecklistItem>("/billing/onboarding/checklist", {
    tags: [apiTags.onboarding],
    revalidate: 30,
  });
}

export async function getApiKeys() {
  return readOrEmpty<ApiKeyRecord>("/api-keys", {
    tags: [apiTags.apiKeys],
    revalidate: 15,
  });
}

async function readOrEmpty<T>(
  path: string,
  options: {
    tags: string[];
    revalidate: number;
  },
): Promise<T[]> {
  const response = await backendFetch<T[]>(path, options);

  if (!response.ok || response.data === null) {
    return [];
  }

  return response.data;
}

function toPlanRecord(plan: BackendPlan): PlanRecord {
  return {
    id: plan.id,
    name: plan.name,
    code: plan.code ?? plan.id.slice(0, 8),
    currency: plan.currency ?? "NGN",
    description: plan.description,
    amount: toNumber(plan.amount),
    interval: plan.interval,
    subscriptions: plan.subscriptions ?? 0,
    revenue: toNumber(plan.revenue),
    status: plan.status ?? (plan.isActive === false ? "inactive" : "active"),
  };
}

function toSubscriberRecord(subscriber: BackendSubscriber): SubscriberRecord {
  return {
    id: subscriber.id,
    name: subscriber.name ?? subscriber.email ?? "Unnamed customer",
    email: subscriber.email ?? "No email",
    plan: subscriber.plan ?? "No plan",
    lifetimeValue: toNumber(subscriber.lifetimeValue),
    paymentMethod: subscriber.paymentMethod ?? "No payment method",
    status: subscriber.status ?? "unknown",
  };
}

function toSubscriptionRecord(
  subscription: BackendSubscription,
): SubscriptionRecord {
  return {
    id: subscription.id,
    code: subscription.code ?? subscription.id.slice(0, 8),
    customer:
      subscription.customer ?? subscription.customerEmail ?? "Unnamed customer",
    plan: subscription.plan ?? "No plan",
    amount: toNumber(subscription.amount),
    nextCharge:
      subscription.nextCharge ??
      subscription.currentPeriodEnd ??
      "Not scheduled",
    attempts: subscription.attempts ?? 0,
    status: subscription.status ?? "unknown",
  };
}

function toPayoutRecord(payout: BackendPayout): PayoutRecord {
  const providerReference =
    payout.providerReference ?? payout.batch ?? payout.id.slice(0, 8);
  const bankAccount = payout.bankAccount ?? null;
  const accountNumber = bankAccount?.accountNumber
    ? maskAccount(bankAccount.accountNumber)
    : "No account";
  const bankName = bankAccount?.bankName ?? bankAccount?.bankCode ?? "Bank";

  return {
    id: payout.id,
    batch: providerReference,
    account: `${bankName} · ${accountNumber}`,
    amount: toNumber(payout.amount),
    currency: payout.currency ?? "NGN",
    entries: payout.entries ?? 1,
    eta: payout.updatedAt ?? payout.createdAt ?? "Pending",
    status: payout.status ?? "unknown",
    providerReference,
    nombaTransactionId: payout.nombaTransactionId,
    bankAccount,
    failureReason: payout.failureReason,
    createdAt: payout.createdAt ?? undefined,
    updatedAt: payout.updatedAt ?? undefined,
  };
}

function maskAccount(accountNumber: string) {
  if (accountNumber.length <= 4) return accountNumber;
  return `${accountNumber.slice(0, 2)}****${accountNumber.slice(-4)}`;
}

function toNumber(value: string | number | null | undefined) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
