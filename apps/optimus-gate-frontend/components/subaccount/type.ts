export type SubAccountStatus = "Verified" | "Unverified";

export interface SubAccount {
  id: string;
  name: string;
  icon: "bank" | "users" | "speakerphone" | "chart-line";
  bankName: string;
  accountNumberMasked: string;
  receivedAmount: number;
  splitPercent: number;
  code: string;
  status: SubAccountStatus;
}

export type FilterTab = "All" | SubAccountStatus;

export const PAGE_SIZE = 5;
