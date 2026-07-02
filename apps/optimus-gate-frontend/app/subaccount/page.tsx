import Header from "@/components/subaccount/Header";
import { SubAccountsTable } from "@/components/subaccount/SubAccountsTable";
export const metadata = {
  title: "Subaccount",
};

export default function Subaccount() {
  return (
    <div className="p-4 md:p-6 space-y-3">
      <Header />
      <SubAccountsTable />
    </div>
  );
}
