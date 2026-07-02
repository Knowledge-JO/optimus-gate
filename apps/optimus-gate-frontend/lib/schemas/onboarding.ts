import { z } from "zod";

const businessProfileSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessDescription: z
    .string()
    .min(1, "Business description is required")
    .max(130, "Must be 130 characters or less"),
  businessCategory: z.string().min(1, "Please select a category"),
  staffSize: z.string().min(1, "Please select a staff size"),
  annualSalesVolume: z.coerce.number().min(0).optional(),
});

const contactSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phoneCountryCode: z.string().min(1).default("+234"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(11, "Enter a valid phone number"),
});

const billingConfigSchema = z.object({
  currency: z.enum(["NGN", "USD"], {
    error: "Please select a default currency",
  }),
  webhookUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

const payoutAccountSchema = z.object({
  bankName: z.string().min(1, "Please select your bank"),
  accountNumber: z
    .string()
    .length(10, "Must be exactly 10 digits")
    .regex(/^\d+$/, "Must contain only digits"),
  accountName: z.string().min(1, "Account name is required"),
});

const reviewSchema = z.object({
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms of Service and Privacy Policy",
  }),
});

export const onboardingSchema = businessProfileSchema
  .merge(contactSchema)
  .merge(billingConfigSchema)
  .merge(payoutAccountSchema)
  .merge(reviewSchema);

export type OnboardingData = z.infer<typeof onboardingSchema>;

export {
  businessProfileSchema,
  contactSchema,
  billingConfigSchema,
  payoutAccountSchema,
  reviewSchema,
};
