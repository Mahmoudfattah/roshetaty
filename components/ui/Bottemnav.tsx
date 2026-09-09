"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import  Icon  from "./Icon";

const NAV_ITEMS = [
  { href: "/", label: "الرئيسية", icon: "home" },
  { href: "/prescriptions", label: "الروشتات", icon: "description" },
  { href: "/search", label: "بحث", icon: "search" },
  { href: "/account", label: "الحساب", icon: "manage_accounts" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-4px_16px_rgba(23,59,103,0.06)]">
      <div className="flex justify-around items-center h-20 px-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] h-[68px] transition-colors",
                active
                  ? "text-primary-container font-bold"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <Icon name={item.icon} className="text-[28px]" filled={active} />
              <span className="text-label-caption font-bold leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}