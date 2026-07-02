export type PlanFilterTab = "Active" | "Archived" | "Disabled";

export type FilterTab = "All" | PlanFilterTab;

export type PlanInterval = "Daily" | "Weekly" | "Monthly" | "Yearly";

export interface Plan {
  id: string;
  name: string;
  amount: number;
  interval: PlanInterval;
  planCode: string;
  subscriptionCount: number;
  totalRevenue: number;
  status: PlanFilterTab;
  createdAt: string;
}
