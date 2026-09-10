"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TopAppBar } from "@/components/ui/TopAppBar";
import Icon  from "@/components/ui/Icon";
import { useImageUrl } from "@/lib/hooks/useImageUrl";
import { toArabicDigits, formatArabicDate } from "@/lib/utils";
import {
  getPrescriptionsWithContext,
  type PrescriptionWithContext,
} from "@/lib/repository";

type SortOrder = "desc" | "asc";

export default function AllPrescriptionsPage() {
  const [items, setItems] = useState<PrescriptionWithContext[] | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPrescriptionsWithContext().then((data) => {
      if (!cancelled) setItems(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const groupedByYear = useMemo(() => {
    if (!items) return [];
    const sorted = [...items].sort((a, b) =>
      sortOrder === "desc"
        ? b.prescription.visitDate.localeCompare(a.prescription.visitDate)
        : a.prescription.visitDate.localeCompare(b.prescription.visitDate)
    );

    const map = new Map<string, PrescriptionWithContext[]>();
    for (const item of sorted) {
      const year = item.prescription.visitDate.slice(0, 4);
      map.set(year, [...(map.get(year) ?? []), item]);
    }
    const entries = Array.from(map.entries());
    return sortOrder === "desc"
      ? entries.sort((a, b) => Number(b[0]) - Number(a[0]))
      : entries.sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [items, sortOrder]);

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

      <div className="flex flex-col w-full pt-5">
        {/* عنوان الشاشة + زرار الفرز */}
        <div className="flex items-center justify-between w-full mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-7 bg-primary-container rounded-full" />
            <h2 className="text-screen-title text-on-surface tracking-tight">كل الروشتات</h2>
          </div>

          <div className="relative">
            <button
              type="button"
              aria-label="فرز الروشتات حسب التاريخ"
              onClick={() => setSortMenuOpen((v) => !v)}
              className="h-[52px] min-w-[52px] px-4 rounded-xl bg-surface-container hover:bg-surface-container-high active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm text-primary-container text-label-prominent"
            >
              <span>{sortOrder === "desc" ? "الأحدث أولاً" : "الأقدم أولاً"}</span>
              <Icon
                name="expand_more"
                className={`text-[22px] transition-transform duration-200 ${
                  sortMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {sortMenuOpen && (
              <div className="absolute left-0 top-[58px] z-20 w-52 p-2 bg-surface-container-lowest rounded-xl shadow-md flex flex-col gap-1">
                {(["desc", "asc"] as const).map((order) => (
                  <button
                    key={order}
                    type="button"
                    onClick={() => {
                      setSortOrder(order);
                      setSortMenuOpen(false);
                    }}
                    className={`w-full h-12 px-4 rounded-lg flex items-center justify-between text-label-prominent ${
                      sortOrder === order
                        ? "bg-surface-container text-primary-container"
                        : "text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    <span>{order === "desc" ? "الأحدث أولاً (الافتراضي)" : "الأقدم أولاً"}</span>
                    {sortOrder === order && (
                      <Icon name="check" className="text-[20px] text-secondary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* شريط توضيحي */}
        <div className="w-full flex items-center gap-3 p-3.5 mb-6 rounded-xl bg-secondary-fixed/50">
          <Icon name="folder_shared" className="text-secondary text-[24px]" />
          <p className="text-body-default text-on-secondary-container">
            سجل الأوراق الطبية المعتمدة لجميع أفراد الأسرة مرتبة زمنيًا.
          </p>
        </div>

        {/* المسار الزمني */}
        <div className="flex flex-col gap-7">
          {items === null && <TimelineSkeleton />}

          {groupedByYear.map(([year, yearItems]) => (
            <section key={year} className="flex flex-col w-full">
              <div className="flex items-center gap-3 mb-3.5">
                <div className="px-3.5 py-1 rounded-full bg-surface-container-high text-primary-container text-card-title flex items-center gap-1.5">
                  <Icon name="calendar_month" className="text-[18px]" />
                  <span>{year}</span>
                </div>
                <div className="flex-1 h-[2px] bg-surface-container-high rounded-full" />
                <span className="text-label-caption text-on-surface-variant whitespace-nowrap">
                  {toArabicDigits(yearItems.length)} روشتات مسجلة
                </span>
              </div>

              <div className="flex flex-col gap-3.5">
                {yearItems.map((item) => (
                  <PrescriptionRow key={item.prescription.id} item={item} />
                ))}
              </div>
            </section>
          ))}

          {items?.length === 0 && (
            <p className="text-body-muted text-on-surface-variant text-center py-16">
              لسه مفيش روشتات محفوظة في أي قسم. ابدأ بإضافة أول روشتة من ملف أي شخص.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

function PrescriptionRow({ item }: { item: PrescriptionWithContext }) {
  const { prescription, person, section } = item;
  const imageUrl = useImageUrl(prescription.imageBlobId);

  return (
    <Link
      href={`/sections/${section.id}/people/${person.id}/prescriptions/${prescription.id}`}
      className="flex items-center justify-between p-3.5 rounded-[18px] bg-surface-container-lowest shadow-sm hover:shadow-md transition-all active:scale-[0.99] min-h-[76px]"
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="relative w-14 h-14 min-w-[56px] rounded-xl overflow-hidden bg-surface-container shadow-inner flex items-center justify-center">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <Icon name="description" className="text-[26px] text-outline" />
          )}
        </div>
        <div className="flex flex-col min-w-0 flex-1 gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-card-title text-on-surface truncate">
              {formatArabicDate(prescription.visitDate)}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-container text-label-caption shrink-0 whitespace-nowrap">
              {person.name}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant min-w-0">
            <Icon name={section.icon} className="text-[18px] text-secondary flex-shrink-0" />
            <p className="text-body-default truncate">
              {prescription.doctorName ? `د. ${prescription.doctorName} ` : ""}
              <span className="text-on-surface-variant">({section.name})</span>
            </p>
          </div>
        </div>
      </div>
      <div className="w-10 h-10 flex items-center justify-center text-on-surface-variant mr-1.5 shrink-0">
        <Icon name="chevron_left" className="text-[26px]" />
      </div>
    </Link>
  );
}

function TimelineSkeleton() {
  return (
    <div className="flex flex-col gap-3.5" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-[76px] rounded-[18px] bg-surface-container-lowest animate-pulse" />
      ))}
    </div>
  );
}