import Header from "@/components/subscription/Header";
import { SubscriptionsSummaryCards } from "@/components/subscription/SubscriptionsSummaryCards";
import SubscriptionTable from "@/components/subscription/SubscriptionTable";
import { MOCK_SUBSCRIPTION_DETAILS } from "@/lib/subcription-detail-data";
import { MOCK_SUBCRIPTION } from "@/lib/subcription_data";

export const metadata = {
  title: "Subscription",
};

export default function Subscription() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <Header />
      <SubscriptionsSummaryCards
        subscriptions={MOCK_SUBCRIPTION}
        details={MOCK_SUBSCRIPTION_DETAILS}
      />
      <SubscriptionTable />
    </div>
  );
}
