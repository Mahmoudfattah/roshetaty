"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { Button } from "@/components/ui/Button";
import Icon  from "@/components/ui/Icon";
import { PersonAvatar } from "@/components/ui/ListRow";
import { toArabicDigits, formatArabicDate } from "@/lib/utils";
import { getSection, getSectionPeopleSummary, type PersonSummary } from "@/lib/repository";
import type { Section } from "@/lib/types";
import Link from "next/link";

export default function SectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const router = useRouter();

  const [section, setSection] = useState<Section | null | undefined>(undefined);
  const [people, setPeople] = useState<PersonSummary[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [foundSection, summary] = await Promise.all([
        getSection(sectionId),
        getSectionPeopleSummary(sectionId),
      ]);
      if (cancelled) return;
      setSection(foundSection ?? null);
      setPeople(summary);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [sectionId]);

  // القسم مش موجود (رابط غلط أو اتحذف)
  if (section === null) {
    return (
      <>
        <TopAppBar title="القسم غير موجود" onBack={() => router.push("/")} />
        <p className="text-body-muted text-on-surface-variant text-center py-16">
          يمكن يكون القسم ده اتحذف. ارجع للرئيسية وجرّب تاني.
        </p>
      </>
    );
  }

  const totalPrescriptions = people?.reduce((sum, p) => sum + p.prescriptionCount, 0) ?? 0;

  return (
    <>
      <TopAppBar title={section?.name ?? "جاري التحميل..."} onBack={() => router.push("/")} />

      {/* عداد الروشتات والأشخاص */}
      {people && (
        <p className="text-body-muted text-on-surface-variant mt-1 mb-5">
          {toArabicDigits(totalPrescriptions)} روشتات · {toArabicDigits(people.length)} أشخاص
        </p>
      )}

      {/* عنوان القائمة */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-card-title text-primary-container font-bold">الأشخاص</h3>
        <span className="text-label-caption text-on-surface-variant">
          اختر شخصاً لعرض ملفه
        </span>
      </div>

      {/* قائمة الأشخاص */}
      <div className="flex flex-col gap-[14px]">
        {people === null && <PeopleSkeleton />}

        {people?.map(({ person, prescriptionCount, lastVisitDate }) => (
          <Link
            key={person.id}
            href={`/sections/${sectionId}/people/${person.id}`}
            className="group relative flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(23,59,103,0.05)] active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <PersonAvatar alt={person.name} size="sm" />
              <div className="flex flex-col min-w-0">
                <span className="text-card-title text-on-surface font-bold truncate">
                  {person.name}
                </span>
                <span className="text-label-caption text-on-surface-variant mt-0.5">
                  {lastVisitDate
                    ? `آخر زيارة: ${formatArabicDate(lastVisitDate)}`
                    : "لسه مفيش روشتات"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 mr-2">
              <span className="px-3 py-1.5 rounded-full bg-secondary-fixed text-primary-container text-label-caption font-bold whitespace-nowrap">
                {toArabicDigits(prescriptionCount)} روشتات
              </span>
              <Icon
                name="arrow_back_ios_new"
                className="text-outline-variant text-[20px] group-hover:-translate-x-0.5 transition-transform"
              />
            </div>
          </Link>
        ))}

        {people?.length === 0 && (
          <p className="text-body-muted text-on-surface-variant text-center py-8">
            لسه مفيش أشخاص في القسم ده
          </p>
        )}

        <Button variant="soft" icon="person_add" className="mt-2 h-[52px]">
          + إضافة شخص جديد
        </Button>
      </div>

      {/* ملاحظة طمأنة */}
      <div className="mt-8 flex items-center justify-center gap-2 p-3 bg-surface-container-low rounded-xl text-on-surface-variant">
        <Icon name="verified_user" className="text-[20px] text-secondary" />
        <span className="text-label-caption">
          جميع الروشتات والبيانات الطبية محفوظة بأمان وسهلة المشاركة
        </span>
      </div>
    </>
  );
}

function PeopleSkeleton() {
  return (
    <div className="flex flex-col gap-[14px]" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[76px] rounded-xl bg-surface-container-lowest animate-pulse" />
      ))}
    </div>
  );
}