export type PayoutStatus = "completed" | "pending" | "failed";

export type Payout = {
  id: string;
  payoutId: string;
  date: string;
  amount: number;
  bankName: string;
  accountNumberMasked: string;
  status: PayoutStatus;
};

export type PayoutFilterTab = "All" | PayoutStatus;

export type PayoutLineItem = {
  id: string;
  description: string;
  amount: number;
};

export type PayoutDetail = {
  payoutId: string;
  lineItems: PayoutLineItem[];
  feeAmount: number;
  failureReason?: string;
};
