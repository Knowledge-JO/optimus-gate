"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { FilterTabs } from "./NotificationFilterTabs";
import type { NotificationRecord } from "@/lib/api/types";

export function NotificationPage({
  initialNotifications,
}: {
  initialNotifications: NotificationRecord[];
}) {
  const [tab, setTab] = useState<"unread" | "all">("all");
  const [notifications, setNotifications] =
    useState<NotificationRecord[]>(initialNotifications);
  const [selected, setSelected] = useState<string[]>([]);

  const filtered =
    tab === "unread"
      ? notifications.filter((notification) => !notification.read)
      : notifications;

  const allChecked = filtered.length > 0 && selected.length === filtered.length;

  const toggleAll = () => {
    setSelected(allChecked ? [] : filtered.map((n) => n.id));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const selectedAreRead = notifications.filter(
    (n) => selected.includes(n.id) && n.read,
  ).length;
  const markLabel =
    selected.length > 0 && selectedAreRead === selected.length
      ? `Mark ${selected.length} as unread`
      : `Mark ${selected.length} as read`;
  const toggleSelectedReadState = () => {
    const shouldMarkUnread =
      selected.length > 0 && selectedAreRead === selected.length;

    setNotifications((current) =>
      current.map((notification) =>
        selected.includes(notification.id)
          ? { ...notification, read: !shouldMarkUnread }
          : notification,
      ),
    );
    setSelected([]);
  };

  return (
    <div className="flex flex-col gap-4 px-2 sm:px-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-bold">Notifications</h1>
          <p className="text-sm text-zinc-500">
            Everything that&apos;s happened across your account.
          </p>
        </div>
        <FilterTabs tab={tab} setTab={setTab} />
      </div>

      <div className="flex items-center justify-between">
        {selected.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSelectedReadState}
            className="h-8 border-black/10 text-xs font-medium text-zinc-600 hover:text-black"
          >
            {markLabel}
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-black/10 bg-white">
        <div className="grid grid-cols-[auto_1fr] items-center gap-2 border-b border-black/10 px-2 py-2.5 text-xs font-medium text-zinc-500 sm:grid-cols-[auto_1fr_auto] sm:gap-4 sm:px-4">
          <Checkbox
            checked={allChecked}
            onCheckedChange={toggleAll}
            className="border-black/20"
          />
          <span>Notification</span>
          <span className="hidden pr-2 sm:block">Date</span>
        </div>

        {filtered.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-zinc-400">
            You&apos;re all caught up.
          </p>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className="grid grid-cols-[auto_1fr] items-start gap-2 border-b border-black/5 px-2 py-3 last:border-b-0 hover:bg-black/2 sm:grid-cols-[auto_1fr_auto] sm:gap-4 sm:px-4 sm:py-4"
            >
              <Checkbox
                checked={selected.includes(n.id)}
                onCheckedChange={() => toggleOne(n.id)}
                className="mt-0.5 border-black/20"
              />

              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex items-start gap-2">
                  {!n.read && (
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-black" />
                  )}
                  <p
                    className={cn(
                      "text-xs leading-relaxed text-zinc-700 sm:text-sm",
                      !n.read && "font-medium text-black",
                    )}
                  >
                    {n.description}
                  </p>
                </div>
                <span className="text-xs text-zinc-500 sm:hidden">
                  {formatNotificationDate(n.date)}
                </span>
              </div>

              <span className="hidden whitespace-nowrap pr-2 text-xs text-zinc-500 sm:block">
                {formatNotificationDate(n.date)}
              </span>
            </div>
          ))
        )}
      </div>

      <p className="text-xs text-zinc-400">
        {filtered.length} item{filtered.length !== 1 && "s"}
      </p>
    </div>
  );
}

function formatNotificationDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}
