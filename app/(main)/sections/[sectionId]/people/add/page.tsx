"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { TopBar } from "@/components/ui/TopBar";
import { Button } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { TextField } from "@/components/ui/TextField";
import { addPerson, getSection } from "@/lib/repository";
import type { Section } from "@/lib/types";
import { cn } from "@/lib/utils";

const RELATIONS = [
  "الوالد",
  "الوالدة",
  "الزوج/الزوجة",
  "الابن",
  "الابنة",
  "الجد/الجدة",
];

export default function AddPersonPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const router = useRouter();
  const avatarCameraInputRef = useRef<HTMLInputElement>(null);
  const avatarGalleryInputRef = useRef<HTMLInputElement>(null);

  const [section, setSection] = useState<Section | null>(null);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState<string | null>(null);
  const [customRelation, setCustomRelation] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    getSection(sectionId).then((s) => setSection(s ?? null));
  }, [sectionId]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  function toggleRelation(value: string) {
    setRelation((current) => (current === value ? null : value));
    if (value !== "أخرى") setCustomRelation("");
  }

  //   async function handleSubmit(e: React.FormEvent) {
  //     e.preventDefault();
  //     if (!name.trim() || saving) return;

  //     setSaving(true);
  //     try {
  //       const finalRelation = relation === "أخرى" ? customRelation.trim() || undefined : relation ?? undefined;
  //       const person = await addPerson({
  //         sectionId,
  //         name: name.trim(),
  //         relation: finalRelation,
  //         avatarFile: avatarFile ?? undefined,
  //       });
  //       router.push(`/sections/${sectionId}/people/${person.id}`);
  //     } catch {
  //       setSaving(false);
  //     }
  //   }
  function handleAvatarChange(file: File | undefined) {
    if (!file) return;
    setAvatarFile(file);
    setSaveError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || saving) return;

    setSaving(true);
    setSaveError(null);
    try {
      const finalRelation =
        relation === "أخرى"
          ? customRelation.trim() || undefined
          : (relation ?? undefined);
      await addPerson({
        sectionId,
        name: name.trim(),
        relation: finalRelation,
        avatarFile: avatarFile ?? undefined,
      });

      router.push(`/sections/${sectionId}`);
    } catch (error) {
      console.error("Failed to save person", error);
      setSaveError("حصلت مشكلة أثناء الحفظ. جرّب تاني.");
      setSaving(false);
    }
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
      <TopBar
        title="إضافة شخص جديد"
        onBack={() => router.back()}
        iconNode={
          section && (
            <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary flex-shrink-0">
              <Icon name={section.icon} className="text-[22px]" />
            </div>
          )
        }
      />

      <form onSubmit={handleSubmit} className="flex flex-col w-full pb-8">
        {/* صورة شخصية */}
        <div className="flex flex-col items-center justify-center pt-2 pb-6">
          <div className="relative">
            <button
              type="button"
              aria-label="اختيار صورة شخصية"
              onClick={() => avatarGalleryInputRef.current?.click()}
              className="w-[88px] h-[88px] rounded-full bg-surface-container-lowest shadow-md flex items-center justify-center transition-transform active:scale-95 overflow-hidden relative"
            >
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="معاينة الصورة"
                  fill
                  className="object-cover"
                  sizes="88px"
                />
              ) : (
                <Icon
                  name="person"
                  className="text-[44px] text-primary-container"
                />
              )}
            </button>
            <div className="absolute bottom-0 start-0 bg-secondary text-on-secondary w-8 h-8 rounded-full flex items-center justify-center shadow-md pointer-events-none">
              <Icon name="photo_camera" className="text-[18px]" />
            </div>
          </div>
          <input
            ref={avatarCameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => handleAvatarChange(e.target.files?.[0])}
          />
          <input
            ref={avatarGalleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleAvatarChange(e.target.files?.[0])}
          />
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={() => avatarCameraInputRef.current?.click()}
              className="h-10 px-3 rounded-full bg-primary-fixed text-primary-container text-label-caption font-bold flex items-center gap-1.5"
            >
              <Icon name="photo_camera" className="text-[18px]" />
              الكاميرا
            </button>
            <button
              type="button"
              onClick={() => avatarGalleryInputRef.current?.click()}
              className="h-10 px-3 rounded-full bg-surface-container text-on-surface-variant text-label-caption font-bold flex items-center gap-1.5"
            >
              <Icon name="photo_library" className="text-[18px]" />
              المعرض
            </button>
          </div>
          <span className="mt-3 text-label-caption text-on-surface-variant font-medium">
            صورة شخصية (اختياري)
          </span>
        </div>

        <div className="flex flex-col gap-6">
          {/* الاسم */}
          <TextField
            label="اسم الشخص"
            placeholder="مثال: الوالد، أو الحاج إبراهيم"
            hint="يمكنك كتابة الاسم أو اللقب المحبب الذي تناديه به"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* صلة القرابة */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-label-prominent text-on-surface">
                صلة القرابة
              </label>
              <span className="text-label-caption text-outline">اختياري</span>
            </div>

            <div
              role="radiogroup"
              aria-label="صلة القرابة"
              className="grid grid-cols-3 gap-2.5"
            >
              {RELATIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={relation === r}
                  onClick={() => toggleRelation(r)}
                  className={cn(
                    "h-12 px-3 rounded-xl shadow-sm text-label-prominent flex items-center justify-center text-center leading-snug transition-all active:scale-95",
                    relation === r
                      ? "bg-primary-container text-on-primary"
                      : "bg-surface-container-lowest text-on-surface",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>

            <button
              type="button"
              role="radio"
              aria-checked={relation === "أخرى"}
              onClick={() => toggleRelation("أخرى")}
              className={cn(
                "w-full h-12 px-4 rounded-xl shadow-sm text-label-prominent flex items-center justify-center gap-2 transition-all active:scale-95",
                relation === "أخرى"
                  ? "bg-primary-container text-on-primary"
                  : "bg-surface-container-lowest text-on-surface",
              )}
            >
              <Icon name="tune" className="text-[20px]" />
              <span>صلة قرابة أخرى</span>
            </button>

            {relation === "أخرى" && (
              <TextField
                label="اكتب صلة القرابة"
                placeholder="مثال: العم، الخال، الصهر..."
                value={customRelation}
                onChange={(e) => setCustomRelation(e.target.value)}
              />
            )}
          </div>

          {/* ملاحظة طمأنة */}
          <div className="bg-surface-container-low rounded-xl p-card-pad flex items-start gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary shrink-0 mt-0.5">
              <Icon name="folder_special" className="text-[22px]" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-label-prominent text-on-surface">
                ملف منظم وآمن
              </h2>
              <p className="text-label-caption text-on-surface-variant leading-relaxed">
                هنعمل سجل خاص بيحفظ كل روشتات الشخص ده منظمة بالتاريخ، عشان
                تسهّل عليك مراجعتها مع الدكتور.
              </p>
            </div>
          </div>

          {/* الأزرار */}
          <div className="mt-4 flex flex-col gap-3">
            {saveError && (
              <p
                role="alert"
                className="text-label-caption text-error text-center"
              >
                {saveError}
              </p>
            )}
            <Button
              type="submit"
              icon="how_to_reg"
              fullWidth
              disabled={!name.trim() || saving}
            >
              {saving ? "جاري الحفظ..." : "حفظ وإضافة"}
            </Button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full h-12 rounded-xl bg-transparent text-on-surface-variant text-label-prominent flex items-center justify-center active:bg-surface-container transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
