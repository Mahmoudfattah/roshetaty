"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { TopBar } from "@/components/ui/TopBar";
import { PersonAvatar, SectionIcon } from "@/components/ui/ListRow";
import { getPeopleBySection, getSections } from "@/lib/repository";
import { ensureSeedData } from "@/lib/seed";
import type { Person, Section } from "@/lib/types";
import { useRouter } from "next/navigation";

type SectionWithPeople = Section & { people: Person[] };

export default function ChoosePersonPage() {
  const [sections, setSections] = useState<SectionWithPeople[] | null>(null);

  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await ensureSeedData();
      const sectionList = await getSections();
      const sectionsWithPeople = await Promise.all(
        sectionList.map(async (section) => ({
          ...section,
          people: await getPeopleBySection(section.id),
        })),
      );

      if (!cancelled) setSections(sectionsWithPeople);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <TopAppBar />
      <TopBar title="اختار الشخص" onBack={() => router.push("/")} />

      <div className="flex flex-col gap-6 w-full">
        <p className="text-body-default text-on-surface-variant">
          اختار الشخص اللي عايز تضيف له الروشتة.
        </p>

        {sections === null && <ChooserSkeleton />}

        {sections?.map((section) => (
          <section key={section.id} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <SectionIcon icon={section.icon} />
              <h2 className="text-section-title text-on-surface">
                {section.name}
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {section.people.map((person) => (
                <Link
                  key={person.id}
                  href={`/sections/${section.id}/people/${person.id}/add`}
                  className="flex items-center justify-between min-h-17 p-4 rounded-2xl bg-surface-container-lowest shadow-sm active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <PersonAvatar alt={person.name} size="sm" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-card-title text-on-surface truncate">
                        {person.name}
                      </span>
                      {person.relation && (
                        <span className="text-label-caption text-on-surface-variant">
                          {person.relation}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-label-prominent text-primary-container">
                    اختيار
                  </span>
                </Link>
              ))}

              {section.people.length === 0 && (
                <p className="text-body-muted text-on-surface-variant py-2">
                  مفيش أشخاص مضافين للقسم ده.
                </p>
              )}
            </div>
          </section>
        ))}

        {sections?.length === 0 && (
          <p className="text-body-muted text-on-surface-variant text-center py-10">
            لسه مفيش أقسام مضافة.
          </p>
        )}
      </div>
    </>
  );
}

function ChooserSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-17 rounded-2xl bg-surface-container-lowest animate-pulse shadow-sm"
        />
      ))}
    </div>
  );
}
