"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { TopBar } from "@/components/ui/TopBar";
import { Button } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { PersonAvatar } from "@/components/ui/ListRow";
import { useImageUrl } from "@/lib/hooks/useImageUrl";
import { toArabicDigits, formatArabicDate } from "@/lib/utils";
import {
  getSection,
  getSectionPeopleSummary,
  type PersonSummary,
} from "@/lib/repository";
import type { Person, Section } from "@/lib/types";

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
        <TopAppBar />
        <TopBar title="القسم غير موجود" onBack={() => router.back()} />
        <p className="text-body-muted text-on-surface-variant text-center py-16">
          يمكن يكون القسم ده اتحذف. ارجع للرئيسية وجرّب تاني.
        </p>
      </>
    );
  }

  const totalPrescriptions =
    people?.reduce((sum, p) => sum + p.prescriptionCount, 0) ?? 0;

  return (
    <>
      <TopAppBar
        logoSrc="/logo1.png"
        trailing={
          <Link
            href="/notifications"
            aria-label="مركز التنبيهات"
            className="w-12 h-12 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <Icon name="notifications" className="text-[26px]" />
          </Link>
        }
      />

      <TopBar
        title={section?.name ?? "جاري التحميل..."}
        onBack={() => router.back()}
        iconNode={
          section && (
            <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary flex-shrink-0">
              <Icon name={section.icon} className="text-[24px]" />
            </div>
          )
        }
        trailing={
          <button
            aria-label="مشاركة القسم"
            type="button"
            className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <Icon name="folder_shared" className="text-[22px]" />
          </button>
        }
      />

      {/* عداد الروشتات والأشخاص */}
      {people && (
        <p className="text-body-muted text-on-surface-variant mt-1 pr-1">
          {toArabicDigits(totalPrescriptions)} روشتات ·{" "}
          {toArabicDigits(people.length)} أشخاص
        </p>
      )}

      {/* عنوان القائمة */}
      <div className="mt-5 mb-3 flex items-center justify-between">
        <h3 className="text-card-title text-primary-container font-bold">
          الأشخاص
        </h3>
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
              <PersonListAvatar person={person} />
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

        <Link href={`/sections/${sectionId}/people/add`}>
          <Button
            variant="soft"
            icon="person_add"
            fullWidth
            className="mt-2 h-[52px]"
          >
            + إضافة شخص جديد
          </Button>
        </Link>
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

function PersonListAvatar({ person }: { person: Person }) {
  const imageUrl = useImageUrl(person.avatarBlobId);

  return <PersonAvatar src={imageUrl} alt={person.name} size="sm" />;
}

function PeopleSkeleton() {
  return (
    <div className="flex flex-col gap-[14px]" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-[76px] rounded-xl bg-surface-container-lowest animate-pulse"
        />
      ))}
    </div>
  );
}
