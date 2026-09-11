"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TopAppBar } from "@/components/ui/TopAppBar";
import  Icon  from "@/components/ui/Icon";
import { toArabicDigits } from "@/lib/utils";
import {
  getPeople,
  getDoctors,
  getSections,
  getPeopleBySection,
  type DoctorSummary,
} from "@/lib/repository";
import type { Person, Section } from "@/lib/types";
import { TopBar } from "@/components/ui/TopBar";
import {  useRouter } from "next/navigation";

interface SectionWithCount extends Section {
  peopleCount: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [doctors, setDoctors] = useState<DoctorSummary[]>([]);
  const [sections, setSections] = useState<SectionWithCount[]>([]);
  const [loaded, setLoaded] = useState(false);


    const router = useRouter();
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [allPeople, allDoctors, allSections] = await Promise.all([
        getPeople(),
        getDoctors(),
        getSections(),
      ]);
      const sectionsWithCounts = await Promise.all(
        allSections.map(async (s) => ({
          ...s,
          peopleCount: (await getPeopleBySection(s.id)).length,
        }))
      );
      if (cancelled) return;
      setPeople(allPeople);
      setDoctors(allDoctors);
      setSections(sectionsWithCounts);
      setLoaded(true);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredPeople = useMemo(
    () =>
      normalizedQuery
        ? people.filter((p) => p.name.toLowerCase().includes(normalizedQuery))
        : [],
    [people, normalizedQuery]
  );

  const filteredDoctors = useMemo(
    () =>
      normalizedQuery
        ? doctors.filter((d) => d.name.toLowerCase().includes(normalizedQuery))
        : [],
    [doctors, normalizedQuery]
  );

  const filteredSections = useMemo(
    () =>
      normalizedQuery
        ? sections.filter((s) => s.name.toLowerCase().includes(normalizedQuery))
        : [],
    [sections, normalizedQuery]
  );

  const hasQuery = normalizedQuery.length > 0;
  const hasResults =
    filteredPeople.length > 0 || filteredDoctors.length > 0 || filteredSections.length > 0;

  // اقتراحات بحث سريعة — من بيانات حقيقية بدل نصوص ثابتة
  const quickSuggestions = useMemo(() => {
    const items: { label: string; icon: string }[] = [];
    people.slice(0, 2).forEach((p) => items.push({ label: p.name, icon: "person" }));
    if (doctors[0]) items.push({ label: doctors[0].name, icon: "stethoscope" });
    if (sections[0]) items.push({ label: sections[0].name, icon: "local_hospital" });
    return items.slice(0, 4);
  }, [people, doctors, sections]);

  return (
    <>
      <TopAppBar />
        <TopBar title="   " onBack={() => router.back()} />

      <div className="flex flex-col w-full gap-section-gap">
        {/* حقل البحث */}
        <div className="flex flex-col gap-2">
          <label htmlFor="search-input" className="text-label-prominent text-on-surface">
            ابحث بالاسم أو الدكتور أو التخصص
          </label>
          <div className="relative flex items-center w-full h-14 bg-surface-container-lowest rounded-xl shadow-sm">
            <Icon name="search" className="text-primary-container pr-4 pl-2 pointer-events-none text-[26px]" />
            <input
              id="search-input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="اكتب اسم الشخص، الطبيب، أو العيادة..."
              className="w-full h-full bg-transparent pl-4 pr-1 text-on-surface text-body-default placeholder:text-outline focus:outline-none"
            />
            {query && (
              <button
                type="button"
                aria-label="مسح البحث"
                onClick={() => setQuery("")}
                className="h-10 w-10 ml-2 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            )}
          </div>
        </div>

        {/* اقتراحات سريعة */}
        {!hasQuery && quickSuggestions.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-label-caption text-on-surface-variant font-bold">
              عمليات بحث سريعة
            </span>
            <div className="flex items-center gap-touch-gap overflow-x-auto pb-1 -mx-screen-margin px-screen-margin no-scrollbar">
              {quickSuggestions.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setQuery(item.label)}
                  className="flex items-center gap-1.5 h-11 px-5 rounded-full bg-surface-container-lowest shadow-sm text-primary-container text-label-prominent shrink-0 active:scale-95 transition-transform hover:bg-surface-container-low"
                >
                  <Icon name={item.icon} className="text-[18px] text-secondary" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* نتائج البحث */}
        {hasQuery && (
          <div className="flex flex-col gap-section-gap">
            {filteredPeople.length > 0 && (
              <ResultGroup title="الأشخاص" count={filteredPeople.length} unit={["فرد واحد", "أفراد"]}>
                {filteredPeople.map((person) => (
                  <Link
                    key={person.id}
                    href={`/sections/${person.sectionId}/people/${person.id}`}
                    className="flex items-center justify-between min-h-[72px] px-card-pad py-3 hover:bg-surface-container-low transition-colors group"
                  >
                    <div className="flex items-center gap-touch-gap min-w-0">
                      <div className="w-[52px] h-[52px] rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 text-card-title font-bold">
                        {person.name.trim().charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-card-title text-on-surface truncate group-hover:text-primary transition-colors">
                          {person.name}
                        </span>
                        {person.relation && (
                          <span className="text-label-caption text-on-surface-variant">
                            {person.relation}
                          </span>
                        )}
                      </div>
                    </div>
                    <Icon
                      name="arrow_back_ios_new"
                      className="text-[24px] text-on-surface-variant group-hover:-translate-x-0.5 transition-transform shrink-0"
                    />
                  </Link>
                ))}
              </ResultGroup>
            )}

            {filteredDoctors.length > 0 && (
              <ResultGroup title="الدكاترة" count={filteredDoctors.length} unit={["طبيب واحد", "أطباء"]}>
                {filteredDoctors.map((doctor) => (
                  <Link
                    key={doctor.name}
                    href="/prescriptions"
                    className="flex items-center justify-between min-h-[72px] px-card-pad py-3 hover:bg-surface-container-low transition-colors group"
                  >
                    <div className="flex items-center gap-touch-gap min-w-0">
                      <div className="w-[52px] h-[52px] shrink-0 rounded-full bg-primary-fixed flex items-center justify-center text-primary-container">
                        <Icon name="stethoscope" className="text-[26px]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-card-title text-on-surface truncate group-hover:text-primary transition-colors">
                          د. {doctor.name}
                        </span>
                        <span className="text-label-caption text-on-surface-variant flex items-center gap-1">
                          <Icon name="medical_information" className="text-[16px] text-secondary" />
                          {doctor.sectionName} · {toArabicDigits(doctor.prescriptionCount)} روشتة
                        </span>
                      </div>
                    </div>
                    <Icon
                      name="arrow_back_ios_new"
                      className="text-[24px] text-on-surface-variant group-hover:-translate-x-0.5 transition-transform shrink-0"
                    />
                  </Link>
                ))}
              </ResultGroup>
            )}

            {filteredSections.length > 0 && (
              <ResultGroup title="الأقسام" count={filteredSections.length} unit={["قسم واحد", "أقسام"]}>
                {filteredSections.map((section) => (
                  <Link
                    key={section.id}
                    href={`/sections/${section.id}`}
                    className="flex items-center justify-between min-h-[72px] px-card-pad py-3 hover:bg-surface-container-low transition-colors group"
                  >
                    <div className="flex items-center gap-touch-gap min-w-0">
                      <div className="w-[52px] h-[52px] shrink-0 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
                        <Icon name={section.icon} className="text-[26px]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-card-title text-on-surface truncate group-hover:text-primary transition-colors">
                          {section.name}
                        </span>
                        <span className="text-label-caption text-on-surface-variant flex items-center gap-1">
                          <Icon name="group" className="text-[16px] text-secondary" />
                          {toArabicDigits(section.peopleCount)} أفراد بالعائلة
                        </span>
                      </div>
                    </div>
                    <Icon
                      name="arrow_back_ios_new"
                      className="text-[24px] text-on-surface-variant group-hover:-translate-x-0.5 transition-transform shrink-0"
                    />
                  </Link>
                ))}
              </ResultGroup>
            )}

            {loaded && !hasResults && (
              <div className="flex flex-col items-center gap-2 py-14 text-center">
                <Icon name="search_off" className="text-[36px] text-outline" />
                <p className="text-body-default text-on-surface-variant">
                  مفيش نتائج لـ "{query}"
                </p>
                <p className="text-label-caption text-outline">
                  جرّب اسم مختلف أو تخصص تاني
                </p>
              </div>
            )}
          </div>
        )}

        {/* نصيحة بحث */}
        <div className="p-card-pad rounded-xl bg-surface-container-low flex items-start gap-3">
          <Icon name="lightbulb" className="text-secondary text-[24px] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-label-prominent text-on-surface">نصيحة للبحث السريع</span>
            <p className="text-body-muted text-on-surface-variant">
              تقدر تدور باسم الشخص، اسم الدكتور، أو التخصص عشان توصل لروشتتك بسرعة.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function ResultGroup({
  title,
  count,
  unit,
  children,
}: {
  title: string;
  count: number;
  /** [واحد, جمع] — زي ["فرد واحد", "أفراد"] */
  unit: [string, string];
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-section-title text-on-surface">{title}</h2>
        <span className="text-label-caption text-secondary font-bold">
          {count === 1 ? unit[0] : `${toArabicDigits(count)} ${unit[1]}`}
        </span>
      </div>
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden divide-y divide-surface-container">
        {children}
      </div>
    </section>
  );
}