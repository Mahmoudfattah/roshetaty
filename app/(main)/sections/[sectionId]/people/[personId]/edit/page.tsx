"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PersonForm } from "@/components/PersonForm";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { TopBar } from "@/components/ui/TopBar";
import Icon from "@/components/ui/Icon";
import { getPerson, updatePerson } from "@/lib/repository";
import type { Person } from "@/lib/types";

export default function EditPersonPage() {
  const { sectionId, personId } = useParams<{
    sectionId: string;
    personId: string;
  }>();
  const router = useRouter();
  const [person, setPerson] = useState<Person | null | undefined>(undefined);

  useEffect(() => {
    getPerson(personId).then((foundPerson) => setPerson(foundPerson ?? null));
  }, [personId]);

  if (person === undefined) return null;

  if (person === null) {
    return (
      <>
        <TopAppBar title="الملف غير موجود" onBack={() => router.back()} />
        <p className="text-body-muted text-on-surface-variant text-center py-16">
          يمكن يكون الملف ده اتحذف. ارجع للقسم وجرّب تاني.
        </p>
      </>
    );
  }

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
      <TopBar title="تعديل بيانات الشخص" onBack={() => router.back()} />
      <PersonForm
        initialPerson={person}
        submitLabel="حفظ التغييرات"
        savingLabel="جاري الحفظ..."
        onCancel={() => router.back()}
        onSubmit={async ({ name, relation, avatarFile }) => {
          await updatePerson(personId, { name, relation, avatarFile });
          router.push(`/sections/${sectionId}/people/${personId}`);
        }}
      />
    </>
  );
}
