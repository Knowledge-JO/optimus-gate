import { NotificationPage } from "@/components/notification/NotificationPage";
import { getNotifications } from "@/lib/api/dashboard";

export const metadata = {
  title: "Notification",
};
export default async function Page() {
  const notifications = await getNotifications();

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <NotificationPage initialNotifications={notifications} />
    </div>
  );
}
