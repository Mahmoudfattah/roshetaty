"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { Button } from "@/components/ui/Button";
import  Icon  from "@/components/ui/Icon";
import { PersonAvatar } from "@/components/ui/ListRow";
import { PrescriptionCard, YearDivider } from "@/components/ui/PrescriptionCard";
import { useImageUrl } from "@/lib/hooks/useImageUrl";
import { toArabicDigits, formatArabicDate, formatRelativeArabic } from "@/lib/utils";
import { getPerson, getSection, getPrescriptionsByPerson } from "@/lib/repository";
import type { Person, Section, Prescription } from "@/lib/types";
import { TopBar } from "@/components/ui/TopBar";

export default function PersonPage() {
  const { sectionId, personId } = useParams<{ sectionId: string; personId: string }>();
  const router = useRouter();

  const [person, setPerson] = useState<Person | null | undefined>(undefined);
  const [section, setSection] = useState<Section | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [foundPerson, list] = await Promise.all([
        getPerson(personId),
        getPrescriptionsByPerson(personId),
      ]);
      if (cancelled) return;

      setPerson(foundPerson ?? null);
      setPrescriptions(list);

      if (foundPerson) {
        const foundSection = await getSection(foundPerson.sectionId);
        if (!cancelled) setSection(foundSection ?? null);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [personId]);

  // الشخص مش موجود (رابط غلط أو اتحذف)
  if (person === null) {
    return (
      <>
        <TopAppBar
          title="الملف غير موجود"
          onBack={() => router.push(`/sections/${sectionId}`)}
        />
        <p className="text-body-muted text-on-surface-variant text-center py-16">
          يمكن يكون الملف ده اتحذف. ارجع للقسم وجرّب تاني.
        </p>
      </>
    );
  }

  const lastAddedAt = prescriptions?.reduce<string | undefined>(
    (latest, p) => (!latest || p.createdAt > latest ? p.createdAt : latest),
    undefined
  );

  const groupedByYear = groupPrescriptionsByYear(prescriptions ?? []);

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

          <TopBar title="  " onBack={() => router.back()} />
{/*     
      <TopAppBar
        title={person?.name ?? "جاري التحميل..."}
        onBack={() => router.push(`/sections/${sectionId}`)}
      /> */}

      <div className="flex flex-col gap-5 pt-12 pb-6">
        {/* بطاقة بيانات الشخص */}
        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-card-pad flex flex-col gap-3 ">
          <div className="flex items-center gap-touch-gap">
            <PersonAvatar alt={person?.name ?? ""} size="sm" />
            <div className="flex flex-col min-w-0">
              <h2 className="text-section-title text-primary-container truncate leading-snug">
                {person?.name}
              </h2>
              {section && (
                <span className="text-body-muted text-on-surface-variant leading-tight">
                  قسم {section.name}
                </span>
              )}
            </div>
          </div>

          {prescriptions && (
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                <span className="text-body-default text-secondary">
                  {toArabicDigits(prescriptions.length)} روشتات مسجلة
                </span>
              </div>
              {lastAddedAt && (
                <span className="text-label-caption text-on-surface-variant">
                  محدّث {formatRelativeArabic(lastAddedAt)}
                </span>
              )}
            </div>
          )}
        </section>

        {/* زرار الإضافة — ثابت جوه الصفحة مش عايم */}
        <Link href={`/sections/${sectionId}/people/${personId}/add`}>
          <Button icon="photo_camera" fullWidth className="h-[52px]">
            + إضافة روشتة جديدة
          </Button>
        </Link>

        {/* المسار الزمني للروشتات */}
        <div className="flex flex-col">
          {prescriptions === null && <TimelineSkeleton />}

          {groupedByYear.map(([year, items]) => (
            <div key={year}>
              <YearDivider year={year} />
              <div className="flex flex-col gap-touch-gap mb-4">
                {items.map((prescription) => (
                  <PrescriptionCardItem
                    key={prescription.id}
                    prescription={prescription}
                    sectionId={sectionId}
                    personId={personId}
                  />
                ))}
              </div>
            </div>
          ))}

          {prescriptions?.length === 0 && (
            <p className="text-body-muted text-on-surface-variant text-center py-10">
              لسه مفيش روشتات محفوظة. ابدأ بإضافة أول روشتة.
            </p>
          )}

          {prescriptions && prescriptions.length > 0 && (
            <div className="flex flex-col items-center gap-2 py-6 text-on-surface-variant">
              <Icon name="check_circle" className="text-[24px] text-secondary" />
              <span className="text-label-caption">
                تم استعراض جميع الروشتات المحفوظة
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/** غلاف صغير عشان useImageUrl (hook) يتنادى بأمان لكل روشتة في القائمة */
function PrescriptionCardItem({
  prescription,
  sectionId,
  personId,
}: {
  prescription: Prescription;
  sectionId: string;
  personId: string;
}) {
  const imageUrl = useImageUrl(prescription.imageBlobId);

  return (
    <PrescriptionCard
      href={`/sections/${sectionId}/people/${personId}/prescriptions/${prescription.id}`}
      date={formatArabicDate(prescription.visitDate)}
      doctorName={prescription.doctorName}
      thumbnailSrc={imageUrl}
    />
  );
}

function groupPrescriptionsByYear(prescriptions: Prescription[]): [string, Prescription[]][] {
  const map = new Map<string, Prescription[]>();
  for (const p of prescriptions) {
    const year = p.visitDate.slice(0, 4);
    map.set(year, [...(map.get(year) ?? []), p]);
  }
  return Array.from(map.entries()).sort((a, b) => Number(b[0]) - Number(a[0]));
}

function TimelineSkeleton() {
  return (
    <div className="flex flex-col gap-touch-gap" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[76px] rounded-xl bg-surface-container-lowest animate-pulse" />
      ))}
    </div>
  );
}