"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import Icon from "@/components/ui/Icon";
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
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(() =>
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem("roshetaty-onboarding") !== "done",
  );

  if (showOnboarding === null)
    return <div className="min-h-screen bg-surface" />;
  if (showOnboarding)
    return <Onboarding onFinish={() => setShowOnboarding(false)} />;

  return <HomeContent />;
}

function Onboarding({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0);
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    if (!isLaunching) return;

    const timer = window.setTimeout(() => {
      window.localStorage.setItem("roshetaty-onboarding", "done");
      onFinish();
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [isLaunching, onFinish]);

  function finish() {
    window.localStorage.setItem("roshetaty-onboarding", "done");
    onFinish();
  }

  if (isLaunching) return <LaunchScreen />;

  return (
    <main className="onboarding" dir="rtl">
      <header className="onboarding-header">
        <div className="step-label">
          <span className="step-number">{toArabicDigits(step + 1)}</span>
          <span>الخطوة {toArabicDigits(step + 1)} من ٣</span>
        </div>
        <button type="button" className="skip-button" onClick={finish}>
          تخطي
        </button>
      </header>

      <section className="onboarding-content" aria-live="polite">
        <div
          className={`onboarding-art onboarding-art-${step + 1}`}
          aria-hidden="true"
        >
          {step === 0 && <ScanIllustration />}
          {step === 1 && <OrganizeIllustration />}
          {step === 2 && <PrivacyIllustration />}
        </div>
        <div className="onboarding-copy">
          {step === 2 && (
            <Image
              src="/logo.png"
              alt="روشتاتي"
              width={180}
              height={72}
              className="onboarding-logo"
            />
          )}
          <h1>{ONBOARDING_STEPS[step].title}</h1>
          <p>{ONBOARDING_STEPS[step].description}</p>
          {step === 0 && (
            <div className="onboarding-note">
              أوراقك الطبية محفوظة بأمان تام على هاتفك <span>▣</span>
            </div>
          )}
          {step === 2 && (
            <div className="onboarding-pills">
              <span>
                خصوصية تامة <b>◈</b>
              </span>
              <span>
                تحكم كامل <b>↻</b>
              </span>
            </div>
          )}
        </div>
        <div className="onboarding-dots" aria-label={`الخطوة ${step + 1} من 3`}>
          {[0, 1, 2].map((dot) => (
            <span key={dot} className={dot === step ? "active" : ""} />
          ))}
        </div>
        <button
          type="button"
          className="onboarding-cta"
          onClick={
            step === 2 ? () => setIsLaunching(true) : () => setStep(step + 1)
          }
        >
          {step === 2 ? "ابدأ الآن" : "التالي"}
          <span aria-hidden="true">{step === 2 ? "→" : "←"}</span>
        </button>
        {step === 2 && (
          <button
            type="button"
            className="explain-button"
            onClick={() => setStep(0)}
          >
            تخطّي الشرح
          </button>
        )}
      </section>
    </main>
  );
}

function LaunchScreen() {
  return (
    <main className="launch-screen" dir="rtl" aria-live="polite">
      <div className="launch-header">
        <span className="launch-saved">حفظ مشفّر　♡</span>
        <span className="launch-family">● نسخة آمنة للعائلة</span>
      </div>

      <div className="launch-content">
        <div className="launch-art" aria-hidden="true">
          <div className="launch-document">
            <span className="document-fold" />
            <span className="document-line document-line-one" />
            <span className="document-line document-line-two" />
            <strong>+</strong>
          </div>
          <span className="launch-heart">♡</span>
        </div>
        <Image
          src="/logo.png"
          alt="روشتاتي"
          width={180}
          height={72}
          className="launch-logo"
        />
        <p className="launch-subtitle">أرشيف طبي لعائلتك</p>
        <div className="launch-message">بكل بساطة ووضوح لوالدك وللجميع</div>
      </div>

      <div className="launch-footer">
        <div className="launch-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p>جاري تجهيز دفتر الوصفات...</p>
      </div>
    </main>
  );
}

const ONBOARDING_STEPS = [
  {
    title: "صوّر روشتك في ثانية",
    description:
      "بدل ما الورقة تضيع، صوّرها واحفظها في مكانها الصح على طول وبأعلى جودة خط وقراءة.",
  },
  {
    title: "منظمة حسب القسم والشخص",
    description:
      "كل فرد في العيلة له ملف، وكل قسم طبي له مكانه. تلاقي أي روشتة في ثواني.",
  },
  {
    title: "بياناتك في جهازك بس",
    description:
      "كل صورك وبياناتك محفوظة محليًا على موبايلك، من غير إنترنت ومن غير مشاركة مع أي حد.",
  },
];

function ScanIllustration() {
  return (
    <div className="scan-card">
      <div className="scan-camera">⌾</div>
      <div className="scan-line" />
      <div className="scan-paper">
        ▤<strong>١٠٠٪ وضوح</strong>
      </div>
      <span className="art-tag tag-save">حفظ فوري　✥</span>
      <span className="art-tag tag-sparkle">✦</span>
    </div>
  );
}

function OrganizeIllustration() {
  return (
    <div className="organize-card">
      <div className="folder-tab">ملف الوالد</div>
      <div className="medical-card">
        <span className="medical-icon">♧</span>
        <i />
        <i />
        <b>باطنة</b>
        <hr />
        <hr />
      </div>
      <span className="art-tag tag-mother">الوالدة　♙</span>
      <span className="art-tag tag-eyes">عيون　◉</span>
    </div>
  );
}

function PrivacyIllustration() {
  return (
    <div className="privacy-card">
      <div className="privacy-sheet">
        <div className="shield">
          ♢<small>▣</small>
        </div>
        <div className="privacy-check">✓</div>
      </div>
      <span className="art-tag tag-cloud">☁ بدون سحابة</span>
      <span className="art-tag tag-device">تخزين آمن بالجهاز　▣</span>
    </div>
  );
}

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
            لسه مفيش أقسام مضافة. ابدأ بإضافة أول روشتة.
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
