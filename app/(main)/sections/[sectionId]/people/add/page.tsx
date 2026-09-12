"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { TopBar } from "@/components/ui/TopBar";
import Icon from "@/components/ui/Icon";
import { PersonForm } from "@/components/PersonForm";
import { addPerson, getSection } from "@/lib/repository";
import type { Section } from "@/lib/types";

export default function AddPersonPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const router = useRouter();
  const [section, setSection] = useState<Section | null>(null);

  useEffect(() => {
    getSection(sectionId).then((s) => setSection(s ?? null));
  }, [sectionId]);

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
        title="إضافة شخص جديد"
        onBack={() => router.back()}
        iconNode={
          section && (
            <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary shrink-0">
              <Icon name={section.icon} className="text-[22px]" />
            </div>
          )
        }
      />

      <PersonForm
        submitLabel="حفظ وإضافة"
        savingLabel="جاري الحفظ..."
        onCancel={() => router.back()}
        onSubmit={async ({ name, relation, avatarFile }) => {
          await addPerson({ sectionId, name, relation, avatarFile });
          router.push(`/sections/${sectionId}`);
        }}
      />
    </>
  );
}
