"use client";

import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Icon from "./Icon";
import { getNotifications } from "@/lib/repository";

interface TopAppBarProps {
  /** مسار الشعار (Logo) */
  logoSrc?: string;
  /** العنوان الرئيسي (اسم الشاشة) */
  title?: string;
  /** سطر صغير فوق العنوان */
  eyebrow?: string;
  /** زرار رجوع */
  onBack?: () => void;
  /** صورة بروفايل صغيرة */
  avatarSrc?: string;
  /** عنصر يمين الهيدر */
  trailing?: ReactNode;
}

export function TopAppBar({
  // خلينا اللوجو الافتراضي هو logo1.png
  logoSrc = "/logo1.png",
  title,
  eyebrow,
  onBack,
  avatarSrc,
  // خلينا زرار التنبيهات هو العنصر الافتراضي في اليمين
  trailing = <NotificationBell />,
}: TopAppBarProps) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
      <div className="h-20 px-screen-margin flex items-center justify-between">
        <div className="flex items-center gap-touch-gap min-w-0">
          {onBack ? (
            <button
              aria-label="الرجوع"
              onClick={onBack}
              type="button"
              className="w-12 h-12 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container active:scale-95 transition-all flex-shrink-0"
            >
              <Icon name="arrow_forward" className="text-[28px]" />
            </button>
          ) : logoSrc ? (
            /* عرض الشعار في حالة عدم وجود زر رجوع */
            <div className="relative h-10 w-20 sm:w-24 flex-shrink-0">
              <Image
                src={logoSrc}
                alt="شعار روشتاتي"
                fill
                className="object-contain object-right"
                priority
              />
            </div>
          ) : avatarSrc ? (
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm relative flex-shrink-0">
              <Image
                src={avatarSrc}
                alt="صورة البروفايل"
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
          ) : null}

          {/* نمرر العنوان فقط إذا لم يكن هناك شعار، أو نتركه بجانب الشعار حسب الرغبة */}
          <div className="flex flex-col min-w-0">
            {eyebrow && !logoSrc && (
              <span className="text-card-title text-primary-container leading-none truncate">
                {eyebrow}
              </span>
            )}
            {title && (
              <h1 className="text-screen-title text-on-surface mt-0.5 leading-tight truncate">
                {title}
              </h1>
            )}
          </div>
        </div>

        {trailing && <div className="flex-shrink-0">{trailing}</div>}
      </div>
    </header>
  );
}

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadCount() {
      const notifications = await getNotifications();
      setUnreadCount(
        notifications.filter((notification) => notification.unread).length,
      );
    }

    void loadCount();
    window.addEventListener("notifications:changed", loadCount);
    return () => window.removeEventListener("notifications:changed", loadCount);
  }, []);

  return (
    <Link
      href="/notifications"
      aria-label={`مركز التنبيهات${unreadCount > 0 ? `، ${unreadCount} غير مقروءة` : ""}`}
      className="relative w-12 h-12 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
    >
      <Icon name="notifications" className="text-[26px]" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -end-0.5 min-w-5 h-5 px-1 rounded-full bg-error text-on-error text-[11px] font-bold flex items-center justify-center">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
