"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { useImageUrl } from "@/lib/hooks/useImageUrl";
import { ListRow, SectionIcon, PersonAvatar } from "@/components/ui/ListRow";
import { toArabicDigits } from "@/lib/utils";
import { getPeople, getPeopleBySection, getSections } from "@/lib/repository";
import { ensureDefaultSections } from "@/lib/seed";
import type { Person, Section } from "@/lib/types";

interface SectionWithCount extends Section {
  peopleCount: number;
}

export default function HomePage() {
  const [introScreen, setIntroScreen] = useState<number | null>(() =>
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem("roshetaty-onboarding") === "done"
        ? null
        : 0,
  );

  useEffect(() => {
    if (introScreen !== 0) return;
    const timer = window.setTimeout(() => setIntroScreen(1), 900);
    return () => window.clearTimeout(timer);
  }, [introScreen]);

  if (introScreen !== null) {
    return (
      <Onboarding
        screen={introScreen}
        onScreenChange={setIntroScreen}
        onFinish={() => {
          window.localStorage.setItem("roshetaty-onboarding", "done");
          setIntroScreen(null);
        }}
      />
    );
  }

  return <HomeContent />;
}

type OnboardingProps = {
  screen: number;
  onScreenChange: (screen: number) => void;
  onFinish: () => void;
};

function Onboarding({ screen, onScreenChange, onFinish }: OnboardingProps) {
  if (screen === 0) return <SplashScreen />;

  const slide = ONBOARDING_SLIDES[screen - 1];

  return (
    <main className="intro-shell" dir="rtl">
      <header className="intro-header">
        <span className="intro-step">
          <span className=" h-8 w-8 rounded-full flex items-center justify-center bg-[#173b67] text-white">{toArabicDigits(screen)}</span>
          <span className="font-bold">الخطوة {toArabicDigits(screen)} من ٣</span>
        </span>
        <button type="button" className="intro-skip" onClick={onFinish}>
          تخطي
        </button>
      </header>

      <section className="intro-content" aria-live="polite">
        <div
          className={`intro-illustration intro-illustration-${slide.illustration}`}
          aria-hidden="true"
        >
          {slide.illustration === "capture" && <CaptureIllustration />}
          {slide.illustration === "organize" && <OrganizeIllustration />}
          {slide.illustration === "privacy" && <PrivacyIllustration />}
        </div>
        <h1>{slide.title}</h1>
        <p>{slide.description}</p>
        {slide.note && (
          <div className="intro-note">
            <Icon name="lock" />
            {slide.note}
          </div>
        )}
        <PaginationDots active={screen - 1} />
        <button
          type="button"
          className="intro-primary-button"
          onClick={screen === 3 ? onFinish : () => onScreenChange(screen + 1)}
        >
          {slide.buttonLabel}
        </button>
        {slide.isFinal && (
          <button
            type="button"
            className="intro-secondary-button"
            onClick={onFinish}
          >
            تخطي
          </button>
        )}
      </section>
    </main>
  );
}

function SplashScreen() {
  return (
    <main className="intro-splash" dir="rtl" aria-label="روشتاتي">
      <div className="splash-mark">
        <Icon name="description" />
        <Icon name="add" className="splash-mark-plus" />
      </div>
      <h1>روشتاتي</h1>
      <p>أرشيف طبي لعائلتك</p>
    </main>
  );
}

function PaginationDots({ active }: { active: number }) {
  return (
    <div className="intro-pagination" aria-label={`الخطوة ${active + 1} من 3`}>
      {[0, 1, 2].map((dot) => (
        <span key={dot} className={dot === active ? "active" : ""} />
      ))}
    </div>
  );
}

function CaptureIllustration() {
  return (
    <div className="capture-illustration">
      <div className="capture-phone">
        <div className="capture-screen">
          <Icon name="description" />
          <span className="capture-rule" />
          <span className="capture-rule capture-rule-short" />
        </div>
        <Icon name="photo_camera" className="capture-camera" />
      </div>
      <span className="illustration-tag capture-tag">
        <Icon name="verified" />
        حفظ فوري
      </span>
      <span className="illustration-badge">
        <Icon name="auto_awesome" />
      </span>
    </div>
  );
}

function OrganizeIllustration() {
  return (
    <div className="organize-illustration">
      <div className="organize-folder organize-folder-back">
        <Icon name="folder" />
      </div>
      <div className="organize-folder organize-folder-front">
        <Icon name="folder_shared" />
        <span>
          <Icon name="description" />
          باطنة
        </span>
        <span>
          <Icon name="visibility" />
          عيون
        </span>
      </div>
      <span className="illustration-tag organize-tag">
        <Icon name="person" />
        ملف الوالد
      </span>
    </div>
  );
}

function PrivacyIllustration() {
  return (
    <div className="privacy-illustration">
      <div className="privacy-device">
        <div className="privacy-screen">
          <Icon name="description" />
          <Icon name="lock" />
        </div>
      </div>
      <span className="privacy-shield">
        <Icon name="shield_lock" />
      </span>
      <span className="illustration-tag privacy-tag">
        <Icon name="phone_android" />
        على جهازك فقط
      </span>
    </div>
  );
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    title: "صوّر روشتتك في ثانية",
    description: "بدل ما الورقة تضيع، صوّرها واحفظها في مكانها الصح على طول",
    illustration: "capture",
    buttonLabel: "التالي",
    note: "أوراقك الطبية محفوظة بأمان تام على هاتفك",
  },
  {
    title: "منظمة حسب القسم والشخص",
    description:
      "كل فرد في العيلة له ملفه، وكل قسم طبي له مكانه. تلاقي أي روشتة في ثواني.",
    illustration: "organize",
    buttonLabel: "التالي",
  },
  {
    title: "بياناتك في جهازك بس",
    description:
      "كل صورك وبياناتك محفوظة محليًا على موبايلك، من غير إنترنت ومن غير مشاركة مع أي حد.",
    illustration: "privacy",
    buttonLabel: "ابدأ الآن",
    isFinal: true,
  },
];

type OnboardingSlide = {
  title: string;
  description: string;
  illustration: "capture" | "organize" | "privacy";
  buttonLabel: string;
  note?: string;
  isFinal?: boolean;
};

function HomeContent() {
  const [sections, setSections] = useState<SectionWithCount[] | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const avatarUrl = useImageUrl(people[0]?.avatarBlobId);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await ensureDefaultSections();
      const [list, allPeople] = await Promise.all([getSections(), getPeople()]);
      const withCounts = await Promise.all(
        list.map(async (section) => ({
          ...section,
          peopleCount: (await getPeopleBySection(section.id)).length,
        })),
      );
      if (!cancelled) {
        setSections(withCounts);
        setPeople(allPeople);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <TopAppBar />

      {/* ترحيب */}
      <div className="flex items-center justify-between py-2 mb-4">
        <div className="flex flex-col">
          <span className="text-screen-title text-primary-container leading-tight">
            روشتاتي
          </span>
          <span className="text-body-default text-on-surface-variant mt-1">
            {getFamilyGreeting(people)}
          </span>
        </div>
        <PersonAvatar src={avatarUrl} alt={people[0]?.name ?? "العيلة"} />
      </div>

      {/* عنوان القسم + عداد */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-section-title text-primary-container">
          الأقسام الطبية
        </h2>
        <div className="flex items-center gap-2">
          {sections && sections.length > 0 && (
            <Chip>{toArabicDigits(sections.length)} تخصصات</Chip>
          )}
          <Link
            href="/manage-sections"
            aria-label="إدارة الأقسام الطبية"
            className="w-9 h-9 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            <Icon name="tune" className="text-[18px]" />
          </Link>
        </div>
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
            ];
          </p>
        )}
      </div>

      {/* زرار الإضافة الثابت */}
      <div className="sticky bottom-4 z-30 mt-8 flex justify-center w-full px-2 pointer-events-none">
        <Link href="/add-prescription" className="pointer-events-auto">
          <Button
            icon="add_circle"
            className="shadow-[0_10px_24px_rgba(23,59,103,0.22)]"
          >
            إضافة روشتة
          </Button>
        </Link>
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
          className="h-17 rounded-2xl bg-surface-container-lowest animate-pulse shadow-sm"
        />
      ))}
    </div>
  );
}

function getFamilyGreeting(people: Person[]): string {
  if (people.length === 0) return "أهلاً، أضف أول فرد للعيلة";
  const names = people
    .slice(0, 2)
    .map((person) => person.name)
    .join(" و ");
  return `أهلاً، عائلة ${names}${people.length > 2 ? " والعيلة" : ""}`;
}
