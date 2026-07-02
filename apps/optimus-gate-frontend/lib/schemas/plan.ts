import { z } from "zod";

export const planFormSchema = z.object({
  planName: z.string().min(1, "Plan name is required"),
  description: z.string().min(1, "Description is required"),
  currency: z.string().min(1, "Currency is required"),
  amount: z
    .string()
    .min(1, "Plan amount is required")
    .refine((val) => Number(val) >= 100, "Minimum plan amount is NGN 100"),
  interval: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"], {
    error: "Choose a plan interval",
  }),
  maxPayments: z.string().optional(),
  createSubscriptionPage: z.boolean(),
});

export type PlanFormValues = z.infer<typeof planFormSchema>;
