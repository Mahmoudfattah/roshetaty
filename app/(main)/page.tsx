"use client";

import { useEffect, useState } from "react";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ListRow, SectionIcon, PersonAvatar } from "@/components/ui/ListRow";
import  Icon  from "@/components/ui/Icon";
import { toArabicDigits } from "@/lib/utils";
import { ensureSeedData } from "@/lib/seed";
import { getSections, getPeopleBySection } from "@/lib/repository";
import type { Section } from "@/lib/types";

interface SectionWithCount extends Section {
  peopleCount: number;
}

export default function HomePage() {
  const [sections, setSections] = useState<SectionWithCount[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await ensureSeedData();
      const list = await getSections();
      const withCounts = await Promise.all(
        list.map(async (section) => ({
          ...section,
          peopleCount: (await getPeopleBySection(section.id)).length,
        }))
      );
      if (!cancelled) setSections(withCounts);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
          <TopAppBar
        logoSrc="/logo1.png"
        trailing={
          <button
            aria-label="مركز التنبيهات"
            type="button"
            className="w-12 h-12 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <Icon name="notifications" className="text-[26px]" />
          </button>
        }
      />

      {/* ترحيب */}
      <div className="flex items-center justify-between py-2 mb-4">
        <div className="flex flex-col">
          <span className="text-screen-title text-primary-container leading-tight">
            روشتاتي
          </span>
          {/* TODO: اسم العيلة ده لازم ييجي من إعدادات الحساب لما نبنيها */}
          <span className="text-body-default text-on-surface-variant mt-1">
            أهلاً، عائلة محمود
          </span>
        </div>
        <PersonAvatar alt="عائلة محمود" />
      </div>

      {/* عنوان القسم + عداد */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-section-title text-primary-container">الأقسام الطبية</h2>
        {sections && sections.length > 0 && (
          <Chip>{toArabicDigits(sections.length)} تخصصات</Chip>
        )}
      </div>

      {/* قائمة الأقسام */}
      <div className="flex flex-col gap-4">
        {sections === null && <SectionsSkeleton />}

        {sections?.map((section) => (
          <ListRow
            key={section.id}
            href={`/sections/${section.id}`}
            title={section.name}
            subtitle={`${toArabicDigits(section.peopleCount)} من الأفراد`}
            leading={<SectionIcon icon={section.icon} />}
          />
        ))}

        {sections?.length === 0 && (
          <p className="text-body-muted text-on-surface-variant text-center py-10">
            لسه مفيش أقسام مضافة. ابدأ بإضافة أول روشتة.
          </p>
        )}
      </div>

      {/* زرار الإضافة الثابت */}
      <div className="sticky bottom-4 z-30 mt-8 flex justify-center w-full px-2 pointer-events-none">
        <Button
          icon="add_circle"
          className="pointer-events-auto shadow-[0_10px_24px_rgba(23,59,103,0.22)]"
        >
          إضافة روشتة
        </Button>
      </div>
    </>
  );
}

function SectionsSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-[68px] rounded-2xl bg-surface-container-lowest animate-pulse shadow-sm"
        />
      ))}
    </div>
  );
}