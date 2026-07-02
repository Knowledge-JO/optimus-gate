import Header from "@/components/plan/Header";
import PlanTable from "@/components/plan/PlanTable";

export const metadata = {
  title: "Plan",
};

export default function Plan() {
  return (
    <div className="p-4 md:p-6 space-y-3">
      <Header />
      <PlanTable />
    </div>
  );
}
