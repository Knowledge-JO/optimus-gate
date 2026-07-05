import { NotificationPage } from "@/components/notification/NotificationPage";

export const metadata = {
  title: "Notification",
};
export default function Page() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <NotificationPage />
    </div>
  );
}
