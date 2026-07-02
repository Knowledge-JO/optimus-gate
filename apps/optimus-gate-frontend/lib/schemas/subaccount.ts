import { z } from "zod";

export const subaccountFormSchema = z
  .object({
    currency: z.string().min(1, "Currency is required"),
    bankName: z.string().min(1, "Bank name is required"),
    accountNumber: z
      .string()
      .min(1, "Account number is required")
      .regex(/^\d{10}$/, "Account number must be exactly 10 digits"),
    subaccountName: z.string().min(1, "Subaccount name is required"),
    transactionSplit: z
      .string()
      .min(1, "Transaction split is required")
      .refine((val) => {
        const n = Number(val);
        return !Number.isNaN(n) && n >= 0 && n <= 100;
      }, "Must be a number between 0 and 100"),
    subaccountPercentage: z
      .string()
      .min(1, "Subaccount percentage is required")
      .refine((val) => {
        const n = Number(val);
        return !Number.isNaN(n) && n >= 0 && n <= 100;
      }, "Must be a number between 0 and 100"),
    keepOnLive: z.boolean(), // no .default()
  })
  .refine(
    (data) =>
      Number(data.transactionSplit) + Number(data.subaccountPercentage) === 100,
    {
      message:
        "Transaction split and subaccount percentage must add up to 100%",
      path: ["subaccountPercentage"],
    },
  );

export type SubaccountFormValues = z.infer<typeof subaccountFormSchema>;
