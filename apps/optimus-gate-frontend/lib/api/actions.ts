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
