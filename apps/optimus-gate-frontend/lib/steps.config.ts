import {
  businessProfileSchema,
  contactSchema,
  billingConfigSchema,
  payoutAccountSchema,
  reviewSchema,
} from "./schemas/onboarding";

export const steps = [
  {
    id: "business",
    title: "Business Profile",
    fields: Object.keys(businessProfileSchema.shape),
  },
  {
    id: "contact",
    title: "Contact",
    fields: Object.keys(contactSchema.shape),
  },
  {
    id: "billing",
    title: "Billing Config",
    fields: Object.keys(billingConfigSchema.shape),
  },
  {
    id: "payout",
    title: "Payout Account",
    fields: Object.keys(payoutAccountSchema.shape),
  },
  {
    id: "review",
    title: "Review",
    fields: Object.keys(reviewSchema.shape),
  },
] as const;
