"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { TopBar } from "@/components/ui/TopBar";
import Icon from "@/components/ui/Icon";

type NotificationKind = "reminder" | "activity" | "security";
type Filter = "all" | "unread";

type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  href?: string;
};

const initialNotifications: AppNotification[] = [
  {
    id: "welcome",
    kind: "activity",
    title: "أهلاً بيك في روشتاتي",
    message: "كل روشتات العيلة هتفضل مرتبة وسهلة الوصول في أي وقت.",
    time: "منذ فترة قصيرة",
    unread: true,
  },
  {
    id: "backup",
    kind: "security",
    title: "بياناتك محفوظة على جهازك",
    message: "صور الروشتات وبياناتها محفوظة محلياً وبخصوصية كاملة.",
    time: "أمس",
    unread: true,
  },
  {
    id: "add-prescription",
    kind: "reminder",
    title: "جاهز تضيف روشتة جديدة؟",
    message: "سجل الروشتة الجديدة واختار الشخص من أفراد العيلة.",
    time: "منذ يومين",
    unread: false,
    href: "/add-prescription",
  },
];

const kindConfig: Record<
  NotificationKind,
  { icon: string; background: string; color: string }
> = {
  reminder: {
    icon: "event_note",
    background: "bg-primary-fixed",
    color: "text-primary-container",
  },
  activity: {
    icon: "notifications_active",
    background: "bg-secondary-fixed",
    color: "text-secondary",
  },
  security: {
    icon: "verified_user",
    background: "bg-tertiary-fixed",
    color: "text-tertiary",
  },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<Filter>("all");

  const unreadCount = notifications.filter(
    (notification) => notification.unread,
  ).length;
  const visibleNotifications = useMemo(
    () =>
      filter === "unread"
        ? notifications.filter((notification) => notification.unread)
        : notifications,
    [filter, notifications],
  );

  function markAsRead(id: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification,
      ),
    );
  }

  function markAllAsRead() {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, unread: false })),
    );
  }

  function clearNotifications() {
    setNotifications([]);
  }

  return (
    <>
      <TopAppBar />
      <TopBar title="التنبيهات" onBack={() => window.history.back()} />

      <div className="flex flex-col gap-5 w-full pb-8">
        <section className="flex items-start justify-between gap-4 pt-1">
          <div>
            <p className="text-label-caption text-secondary font-bold mb-1">
              مركز المتابعة
            </p>
            <h1 className="text-screen-title text-on-surface leading-tight">
              كل التنبيهات
            </h1>
            <p className="text-body-muted text-on-surface-variant mt-2">
              تابع آخر التحديثات المهمة الخاصة بأرشيف العيلة.
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-sm">
            <Icon name="notifications" className="text-[28px]" filled />
          </div>
        </section>

        <div className="flex items-center justify-between gap-3">
          <div
            className="flex items-center gap-2"
            role="tablist"
            aria-label="فلترة التنبيهات"
          >
            <FilterButton
              active={filter === "all"}
              onClick={() => setFilter("all")}
            >
              الكل
            </FilterButton>
            <FilterButton
              active={filter === "unread"}
              onClick={() => setFilter("unread")}
            >
              غير المقروءة
              {unreadCount > 0 && (
                <span className="min-w-5 h-5 px-1 rounded-full bg-primary text-on-primary text-[11px] flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </FilterButton>
          </div>

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="text-label-caption font-bold text-primary-container disabled:text-outline disabled:cursor-not-allowed hover:underline"
            >
              تحديد الكل كمقروء
            </button>
          )}
        </div>

        {visibleNotifications.length > 0 ? (
          <div className="flex flex-col gap-3">
            {visibleNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={() => markAsRead(notification.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyNotifications filter={filter} />
        )}

        {notifications.length > 0 && (
          <button
            type="button"
            onClick={clearNotifications}
            className="self-center flex items-center gap-2 min-h-touch-min px-4 text-label-caption font-bold text-error hover:bg-error-container/30 rounded-full transition-colors"
          >
            <Icon name="delete_sweep" className="text-[19px]" />
            مسح كل التنبيهات
          </button>
        )}
      </div>
    </>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`min-h-10 px-3.5 rounded-full flex items-center gap-2 text-label-caption font-bold transition-colors ${
        active
          ? "bg-primary-container text-on-primary shadow-sm"
          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
      }`}
    >
      {children}
    </button>
  );
}

function NotificationItem({
  notification,
  onRead,
}: {
  notification: AppNotification;
  onRead: () => void;
}) {
  const config = kindConfig[notification.kind];
  const content = (
    <div
      className={`relative flex items-start gap-3.5 p-4 rounded-2xl border transition-colors ${
        notification.unread
          ? "bg-surface-container-lowest border-primary-fixed shadow-sm"
          : "bg-surface-container-low border-transparent"
      }`}
    >
      {notification.unread && (
        <span
          className="absolute top-4 left-4 w-2 h-2 rounded-full bg-secondary"
          aria-label="غير مقروء"
        />
      )}
      <div
        className={`w-12 h-12 rounded-2xl ${config.background} ${config.color} flex items-center justify-center shrink-0`}
      >
        <Icon
          name={config.icon}
          className="text-[24px]"
          filled={notification.unread}
        />
      </div>
      <div className="flex flex-col min-w-0 flex-1 gap-1">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-card-title font-bold text-on-surface">
            {notification.title}
          </h2>
          <span className="text-label-caption text-outline whitespace-nowrap">
            {notification.time}
          </span>
        </div>
        <p className="text-body-muted text-on-surface-variant leading-relaxed">
          {notification.message}
        </p>
        {notification.href && (
          <span className="mt-1 text-label-caption font-bold text-primary-container flex items-center gap-1">
            افتح الآن
            <Icon name="arrow_back" className="text-[16px]" />
          </span>
        )}
      </div>
    </div>
  );

  if (notification.href) {
    return (
      <Link href={notification.href} onClick={onRead} className="block">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onRead} className="block w-full text-right">
      {content}
    </button>
  );
}

function EmptyNotifications({ filter }: { filter: Filter }) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6 bg-surface-container-low rounded-2xl">
      <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-outline mb-4">
        <Icon
          name={filter === "unread" ? "done_all" : "notifications_none"}
          className="text-[32px]"
        />
      </div>
      <h2 className="text-section-title text-on-surface mb-1">
        {filter === "unread"
          ? "مفيش تنبيهات غير مقروءة"
          : "مفيش تنبيهات حالياً"}
      </h2>
      <p className="text-body-muted text-on-surface-variant max-w-xs">
        {filter === "unread"
          ? "أنت متابع كل جديد. التنبيهات الجديدة هتظهر هنا."
          : "لما يكون فيه تحديث مهم، هتلاقيه هنا."}
      </p>
    </div>
  );
}
