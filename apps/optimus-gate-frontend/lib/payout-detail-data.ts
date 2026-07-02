import type { PayoutDetail } from "@/components/payouts/type";

export const MOCK_PAYOUT_DETAILS: Record<string, PayoutDetail> = {
  PYT_0001: {
    payoutId: "PYT_0001",
    lineItems: [
      { id: "li1", description: "Invoice #INV-2201", amount: 35000 },
      { id: "li2", description: "Invoice #INV-2208", amount: 28000 },
      { id: "li3", description: "Invoice #INV-2215", amount: 14000 },
    ],
    feeAmount: 2000,
  },
  PYT_0002: {
    payoutId: "PYT_0002",
    lineItems: [
      {
        id: "li3",
        description: "Invoice #INV-2299 — Lekki Boutique",
        amount: 135500,
      },
    ],
    feeAmount: 3500,
  },
  PYT_0003: {
    payoutId: "PYT_0003",
    lineItems: [{ id: "li4", description: "Invoice #INV-2310", amount: 59800 }],
    feeAmount: 1400,
    failureReason: "Insufficient balance in source account",
  },
  PYT_0004: {
    payoutId: "PYT_0004",
    lineItems: [
      { id: "li5", description: "Invoice #INV-2321", amount: 130000 },
      { id: "li6", description: "Invoice #INV-2330", amount: 85000 },
    ],
    feeAmount: 5000,
    failureReason: "Bank account details could not be verified",
  },
  PYT_0005: {
    payoutId: "PYT_0005",
    lineItems: [
      {
        id: "li7",
        description: "Invoice #INV-2344 — Velvet Hair Studio",
        amount: 100000,
      },
    ],
    feeAmount: 2500,
  },
  PYT_0006: {
    payoutId: "PYT_0006",
    lineItems: [
      {
        id: "li8",
        description: "Invoice #INV-2355 — Ikoyi Electronics Hub",
        amount: 66000,
      },
    ],
    feeAmount: 1800,
  },
};
