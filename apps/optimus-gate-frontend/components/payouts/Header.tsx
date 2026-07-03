import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/layout/PageHeader";

export default function Header() {
  return (
    <PageHeader title="Payouts">
      <Select>
        <SelectTrigger className="bg-navy text-white data-placeholder:text-white rounded-lg px-4 py-4 h-10 text-xs font-semibold gap-2 shadow-sm hover:shadow-md transition-shadow duration-200 focus:ring-0 focus-visible:ring-0">
          <SelectValue placeholder="Request payout" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="request">Request payout</SelectItem>
            <SelectItem value="schedule">Schedule payout</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </PageHeader>
  );
}
