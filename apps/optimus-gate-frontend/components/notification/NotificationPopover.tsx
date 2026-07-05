"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FilterTabs } from "./NotificationFilterTabs";

type Notification = {
  id: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Payout processed",
    description:
      "Your payout of ₦245,000 has been sent to your default account. It should reflect within 24 hours depending on your bank's processing time and any additional verification steps required.",
    date: "Jul 3",
    read: false,
  },
  {
    id: "2",
    title: "New subscription created",
    description:
      "Adebayo T. subscribed to the Pro plan. Billing will begin on the next cycle and a receipt has been sent to their email address.",
    date: "Jul 2",
    read: true,
  },
  {
    id: "3",
    title: "Checkout link expired",
    description: "The checkout link for 'Team Plan – Q3' has expired.",
    date: "Jun 30",
    read: true,
  },
];

export function NotificationPopover() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [tab, setTab] = useState<"unread" | "all">("unread");

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered =
    tab === "unread" ? notifications.filter((n) => !n.read) : notifications;
  const visible = filtered.slice(0, 2);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative flex size-9 items-center cursor-pointer justify-center rounded-lg border border-black/10 bg-white text-zinc-500 transition hover:text-black">
          <IoMdNotificationsOutline className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-black" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[calc(100vw-1.5rem)] max-w-95 rounded-xl border border-black/10 bg-white p-0 shadow-lg sm:w-95"
      >
        <div className="relative px-3 py-3 sm:px-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-black">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllRead}
                className="h-7 shrink-0 px-2 text-xs font-medium text-zinc-600 hover:text-black"
              >
                Mark all as read
              </Button>
            )}
          </div>
          <div className="absolute inset-x-3 bottom-0 h-px bg-linear-to-r from-transparent via-black/10 to-transparent sm:inset-x-4" />
        </div>

        <FilterTabs tab={tab} setTab={setTab} />
        <div className="max-h-[70vh] overflow-y-auto sm:max-h-96">
          {visible.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-400">
              You&apos;re all caught up.
            </p>
          ) : (
            visible.map((n) => (
              <Link
                key={n.id}
                href="/notifications"
                onClick={() => setOpen(false)}
                className="flex gap-3 border-b border-black/5 px-3 py-3 last:border-b-0 hover:bg-black/2 sm:px-4"
              >
                <span
                  className={cn(
                    "mt-1.5 size-1.5 shrink-0 rounded-full",
                    n.read ? "bg-transparent" : "bg-black",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-black">{n.title}</p>
                  <p className="mt-0.5 line-clamp-3 text-xs leading-relaxed text-zinc-500">
                    {n.description}
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-400">{n.date}</p>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="border-t border-black/10 px-4 py-2.5 text-center">
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="text-xs font-medium text-zinc-600 hover:text-black cursor-pointer"
          >
            View all
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
