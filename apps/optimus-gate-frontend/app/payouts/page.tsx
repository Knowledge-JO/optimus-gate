import Header from "@/components/payouts/Header";
import { PayoutsTable } from "@/components/payouts/PayoutsTable";
import { PayoutsSummaryCards } from "@/components/payouts/PayoutsSummaryCards";
import { MOCK_PAYOUTS } from "@/lib/payout-data";

export const metadata = {
  title: "PayoutPage",
};

export default function PayoutPage() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <Header />
      <PayoutsSummaryCards payouts={MOCK_PAYOUTS} />
      <PayoutsTable />
    </div>
  );
}
