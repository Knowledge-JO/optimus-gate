"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { backendMutation } from "./backend";
import { apiTags } from "./dashboard";
import type { CheckoutLinkRecord, CreatedApiKey } from "./types";

export type MutationState = {
  status: "idle" | "success" | "error";
  checkoutLink?: string;
  message?: string;
  orderReference?: string;
  secret?: string;
  fieldErrors?: Record<string, string[]>;
};

export type ReconcileCheckoutOrdersState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const createPlanSchema = z.object({
  name: z.string().min(2, "Plan name must be at least 2 characters"),
  description: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  currency: z.string().default("NGN"),
  interval: z.enum(["day", "week", "month", "year"]),
});

const createApiKeySchema = z.object({
  name: z.string().min(2, "Key name must be at least 2 characters"),
  environment: z.enum(["test", "live"]).default("test"),
  scopes: z.string().optional(),
});

const createCheckoutLinkSchema = z.object({
  planId: z.string().uuid("Plan id is invalid"),
  customerEmail: z.string().email("Customer email is required"),
  customerName: z.string().optional(),
  customerId: z.string().optional(),
  callbackUrl: z.string().url("Callback URL must be valid").optional().or(z.literal("")),
});

const reconcileCheckoutOrdersSchema = z
  .array(z.string().trim().min(1))
  .min(1, "At least one order reference is required");

export async function createPlanAction(
  _state: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const parsed = createPlanSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const result = await backendMutation("/billing/plans", {
    method: "POST",
    body: parsed.data,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.error.message,
    };
  }

  revalidateTag(apiTags.plans, "max");
  revalidateTag(apiTags.stats, "max");
  return { status: "success", message: "Plan created successfully." };
}

export async function createApiKeyAction(
  _state: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const parsed = createApiKeySchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const scopes = parsed.data.scopes
    ?.split(",")
    .map((scope) => scope.trim())
    .filter(Boolean);

  const result = await backendMutation<CreatedApiKey>("/api-keys", {
    method: "POST",
    body: {
      name: parsed.data.name,
      environment: parsed.data.environment,
      scopes: scopes?.length ? scopes : undefined,
    },
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.error.message,
    };
  }

  revalidateTag(apiTags.apiKeys, "max");
  return {
    status: "success",
    message: "API key created. Copy it now; it will not be shown again.",
    secret: result.data.apiKey,
  };
}

export async function createCheckoutLinkAction(
  _state: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const parsed = createCheckoutLinkSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const result = await backendMutation<CheckoutLinkRecord>(
    "/v1/checkout/subscriptions/start",
    {
      method: "POST",
      body: {
        planId: parsed.data.planId,
        customerId: parsed.data.customerId || parsed.data.customerEmail,
        customerEmail: parsed.data.customerEmail,
        customerName: parsed.data.customerName || undefined,
        callbackUrl: parsed.data.callbackUrl || undefined,
      },
    },
  );

  if (!result.ok) {
    return {
      status: "error",
      message: result.error.message,
    };
  }

  if (!result.data.checkoutLink) {
    return {
      status: "error",
      message: "Checkout link was not returned by the backend.",
    };
  }

  revalidateTag(apiTags.subscriptions, "max");
  revalidateTag(apiTags.transactions, "max");
  return {
    status: "success",
    checkoutLink: result.data.checkoutLink,
    orderReference: result.data.orderReference,
    message: "Checkout link created.",
  };
}

export async function reconcileCheckoutOrdersAction(
  orderReferences: string[],
): Promise<ReconcileCheckoutOrdersState> {
  const parsed = reconcileCheckoutOrdersSchema.safeParse(orderReferences);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Order reference is required.",
    };
  }

  const result = await backendMutation<Array<{ status?: string }>>(
    "/v1/checkout/orders/verify",
    {
      method: "POST",
      body: {
        orderReferences: parsed.data,
      },
    },
  );

  if (!result.ok) {
    return {
      status: "error",
      message: result.error.message,
    };
  }

  revalidateTag(apiTags.stats, "max");
  revalidateTag(apiTags.plans, "max");
  revalidateTag(apiTags.subscribers, "max");
  revalidateTag(apiTags.subscriptions, "max");
  revalidateTag(apiTags.transactions, "max");

  const succeeded = result.data.filter((entry) => entry.status === "succeeded").length;
  const failed = result.data.length - succeeded;

  if (failed > 0) {
    return {
      status: "error",
      message: `${failed} checkout order${failed === 1 ? "" : "s"} could not be verified.`,
    };
  }

  return {
    status: "success",
    message: `${succeeded} checkout order${succeeded === 1 ? "" : "s"} reconciled.`,
  };
}

export async function refreshDashboardAction() {
  revalidateTag(apiTags.stats, "max");
  revalidateTag(apiTags.plans, "max");
  revalidateTag(apiTags.subscribers, "max");
  revalidateTag(apiTags.subscriptions, "max");
  revalidateTag(apiTags.apiKeys, "max");
  revalidateTag(apiTags.transactions, "max");
  revalidateTag(apiTags.refunds, "max");
  revalidateTag(apiTags.payouts, "max");
  revalidateTag(apiTags.subaccounts, "max");
  revalidateTag(apiTags.onboarding, "max");
}

function validationError(
  fieldErrors: Record<string, string[] | undefined>,
): MutationState {
  return {
    status: "error",
    message: "Please fix the highlighted fields.",
    fieldErrors: Object.fromEntries(
      Object.entries(fieldErrors).filter(
        (entry): entry is [string, string[]] => Boolean(entry[1]?.length),
      ),
    ),
  };
}
