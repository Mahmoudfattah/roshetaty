"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopAppBar } from "@/components/ui/TopAppBar";
import Icon from "@/components/ui/Icon";
import { PersonAvatar } from "@/components/ui/ListRow";
import { useImageUrl } from "@/lib/hooks/useImageUrl";
import { toArabicDigits } from "@/lib/utils";
import { getPeople } from "@/lib/repository";
import type { Person } from "@/lib/types";

export default function AccountPage() {
  const [people, setPeople] = useState<Person[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const avatarUrl = useImageUrl(people?.[0]?.avatarBlobId);

  useEffect(() => {
    getPeople().then(setPeople);
  }, []);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  }

  return (
    <>
      <TopAppBar />

      <div className="flex flex-col w-full gap-section-gap pt-8">
        {/* بطاقة العائلة */}
        <section className="bg-surface-container-lowest rounded-xl p-card-pad shadow-[0_4px_16px_rgba(23,59,103,0.06)] flex items-center gap-card-pad">
          <div className="relative shrink-0">
            <PersonAvatar
              src={avatarUrl}
              alt={people?.[0]?.name ?? "العيلة"}
              size="md"
            />
            <div className="absolute -bottom-1 -left-1 bg-secondary text-on-secondary rounded-full w-7 h-7 flex items-center justify-center shadow-sm">
              <Icon name="verified_user" className="text-[18px]" />
            </div>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-section-title text-primary-container  truncate">
                {getFamilyName(people ?? [])}
              </h2>
              <span className="bg-secondary-fixed text-on-secondary-fixed text-label-caption px-2.5 py-0.5 rounded-full shrink-0">
                الأساسي
              </span>
            </div>
            <p className="text-body-muted text-on-surface-variant mt-1">
              أرشيف الروشتات العائلية الآمن
            </p>
            <div className="flex items-center gap-1 mt-2 text-secondary text-label-caption">
              <Icon name="cloud_done" className="text-[18px]" />
              <span className="text-xs sm:text-xl">جميع الأوراق الطبية محفوظة على جهازك</span>
            </div>
          </div>
        </section>

        {/* تنظيم العائلة والملفات */}
        <MenuSection icon="people" title="تنظيم العائلة والملفات" count={2}>
          <Link
            href="/"
            className="w-full min-h-[64px] px-card-pad py-3.5 flex items-center justify-between hover:bg-surface-container-low transition-colors active:bg-surface-container"
          >
            <MenuItemContent
              icon="group"
              title="أفراد العائلة"
              subtitle="كل الأشخاص المسجلين في الأرشيف"
            />
            <div className="flex items-center gap-2 shrink-0">
              <span className="bg-surface-container-high text-on-surface-variant text-label-caption px-2.5 py-1 rounded-full">
                {people === null
                  ? "..."
                  : `${toArabicDigits(people.length)} أفراد`}
              </span>
              <Icon name="chevron_left" className="text-outline text-[24px]" />
            </div>
          </Link>
          <Divider />
          <Link
            href="/manage-sections"
            className="w-full min-h-[64px] px-card-pad py-3.5 flex items-center justify-between hover:bg-surface-container-low transition-colors active:bg-surface-container"
          >
            <MenuItemContent
              icon="medical_services"
              title="التخصصات الطبية"
              subtitle="إضافة وتعديل وحذف الأقسام"
            />
            <Icon
              name="chevron_left"
              className="text-outline text-[24px] shrink-0"
            />
          </Link>
        </MenuSection>

        {/* تفضيلات التطبيق */}
        <MenuSection icon="tune" title="تفضيلات التطبيق والأمان" count={3}>
          <button
            type="button"
            onClick={() => showToast("اللغة الحالية هي العربية")}
            className="w-full min-h-[64px] px-card-pad py-3.5 flex items-center justify-between hover:bg-surface-container-low transition-colors text-right active:bg-surface-container"
          >
            <MenuItemContent
              icon="translate"
              title="لغة التطبيق"
              subtitle="لغة القوائم والنصوص التوضيحية"
            />
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-label-prominent text-secondary">
                العربية
              </span>
              <Icon name="chevron_left" className="text-outline text-[24px]" />
            </div>
          </button>
          <Divider />
          <button
            type="button"
            onClick={() =>
              showToast("الوضع المعتمد حاليًا هو الفاتح والمريح للعين")
            }
            className="w-full min-h-[64px] px-card-pad py-3.5 flex items-center justify-between hover:bg-surface-container-low transition-colors text-right active:bg-surface-container"
          >
            <MenuItemContent
              icon="light_mode"
              title="المظهر"
              subtitle="نمط الألوان والتباين المريح للقراءة"
            />
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-label-prominent text-on-surface-variant">
                الوضع الفاتح
              </span>
              <Icon name="chevron_left" className="text-outline text-[24px]" />
            </div>
          </button>
          <Divider />
          <div className="w-full min-h-[64px] px-card-pad py-3.5 flex items-center justify-between">
            <MenuItemContent
              icon="smartphone"
              title="التخزين"
              subtitle="كل بياناتك وصورك محفوظة على جهازك فقط"
            />
            <div className="flex items-center gap-1.5 bg-secondary-fixed text-on-secondary-fixed px-3 py-1.5 rounded-full shrink-0 shadow-sm">
              <Icon name="lock" className="text-[18px]" />
              <span className="text-label-caption font-bold text-xs sm:text-xl">محلي وآمن</span>
            </div>
          </div>
        </MenuSection>

        {/* كارت توعوي */}
        <section className="bg-primary-container text-on-primary rounded-xl p-card-pad shadow-[0_6px_20px_rgba(23,59,103,0.12)]">
          <div className="flex items-start gap-touch-gap">
            <div className="w-12 h-12 rounded-full bg-surface-container-lowest/15 flex items-center justify-center text-on-primary shrink-0 mt-0.5">
              <Icon name="health_and_safety" className="text-[26px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <h4 className="text-card-title text-on-primary">
                رعايتكم أولويتنا
              </h4>
              <p className="text-body-default text-surface-container-high mt-1.5 leading-relaxed">
                روشتاتي يساعدك على حفظ وتوثيق التاريخ الصحي لعائلتك للرجوع إليه
                عند الحاجة، بعيدًا عن ضياع الأوراق وتلفها مع الوقت.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() =>
                    showToast("نسخة التطبيق: الإصدار ٠٫١ (تجريبي)")
                  }
                  className="min-h-[48px] px-4 rounded-lg bg-surface-container-lowest text-primary-container text-label-prominent hover:bg-surface-container transition-colors flex items-center gap-1 shadow-sm active:scale-95"
                >
                  <Icon name="info" className="text-[20px]" />
                  <span className="text-sm sm:text-xl">عن التطبيق</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      "بياناتك محفوظة محليًا على جهازك فقط ولا تُشارك مع أي طرف",
                    )
                  }
                  className="min-h-[48px] px-4 rounded-lg bg-surface-container-lowest/20 text-on-primary text-label-prominent hover:bg-surface-container-lowest/30 transition-colors flex items-center gap-1.5 active:scale-95"
                >
                  <Icon name="shield" className="text-[20px]" />
                  <span>الخصوصية</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Toast بسيط */}
      {toast && (
        <div className="fixed bottom-28 inset-x-0 flex justify-center z-40 px-screen-margin pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-full shadow-lg text-label-prominent text-center">
            {toast}
          </div>
        </div>
      )}
    </>
  );
}

function getFamilyName(people: Person[]): string {
  if (people.length === 0) return "عائلتي";
  const names = people
    .slice(0, 2)
    .map((person) => person.name)
    .join(" و ");
  return `عائلة ${names}${people.length > 2 ? " والعيلة" : ""}`;
}

function MenuSection({
  icon,
  title,
  count,
  children,
}: {
  icon: string;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="px-1 flex items-center justify-between">
        <h3 className="text-card-title text-on-surface flex items-center gap-2">
          <Icon name={icon} className="text-secondary text-[22px]" />
          <span>{title}</span>
        </h3>
        <span className="text-label-caption text-on-surface-variant">
          {toArabicDigits(count)} {count === 1 ? "خيار" : "خيارات"}
        </span>
      </div>
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(23,59,103,0.05)] overflow-hidden flex flex-col">
        {children}
      </div>
    </section>
  );
}

function MenuItemContent({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-card-pad min-w-0">
      <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0">
        <Icon name={icon} className="sm:text-[24px] " />
      </div>
      <div className="flex flex-col min-w-0 text-right">
        <span className="text-card-title  text-on-surface">{title}</span>
        <span className="text-label-caption text-on-surface-variant text-xs sm:text-xl">
          {subtitle}
        </span>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-[1px] bg-surface-container mx-card-pad" />;
}
