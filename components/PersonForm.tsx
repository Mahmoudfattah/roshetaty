"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { TextField } from "@/components/ui/TextField";
import { useImageUrl } from "@/lib/hooks/useImageUrl";
import type { Person } from "@/lib/types";
import { cn } from "@/lib/utils";

const RELATIONS = [
  "الوالد",
  "الوالدة",
  "الزوج/الزوجة",
  "الابن",
  "الابنة",
  "الجد/الجدة",
];

interface PersonFormProps {
  initialPerson?: Person;
  submitLabel: string;
  savingLabel: string;
  onSubmit: (input: {
    name: string;
    relation?: string;
    avatarFile?: File;
  }) => Promise<void>;
  onCancel: () => void;
}

export function PersonForm({
  initialPerson,
  submitLabel,
  savingLabel,
  onSubmit,
  onCancel,
}: PersonFormProps) {
  const avatarCameraInputRef = useRef<HTMLInputElement>(null);
  const avatarGalleryInputRef = useRef<HTMLInputElement>(null);
  const existingAvatarUrl = useImageUrl(initialPerson?.avatarBlobId);
  const [name, setName] = useState(initialPerson?.name ?? "");
  const [relation, setRelation] = useState<string | null>(
    initialPerson?.relation && RELATIONS.includes(initialPerson.relation)
      ? initialPerson.relation
      : initialPerson?.relation
        ? "أخرى"
        : null,
  );
  const [customRelation, setCustomRelation] = useState(
    initialPerson?.relation && !RELATIONS.includes(initialPerson.relation)
      ? initialPerson.relation
      : "",
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  function toggleRelation(value: string) {
    setRelation((current) => (current === value ? null : value));
    if (value !== "أخرى") setCustomRelation("");
  }

  function handleAvatarChange(file: File | undefined) {
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setSaveError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || saving) return;

    setSaving(true);
    setSaveError(null);
    try {
      await onSubmit({
        name: name.trim(),
        relation:
          relation === "أخرى"
            ? customRelation.trim() || undefined
            : (relation ?? undefined),
        avatarFile: avatarFile ?? undefined,
      });
    } catch (error) {
      console.error("Failed to save person", error);
      setSaveError("حصلت مشكلة أثناء الحفظ. جرّب تاني.");
      setSaving(false);
    }
  }

  const previewUrl = avatarPreview ?? existingAvatarUrl;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full pb-8">
      <div className="flex flex-col items-center justify-center pt-2 pb-6">
        <div className="relative">
          <button
            type="button"
            aria-label="اختيار صورة شخصية"
            onClick={() => avatarGalleryInputRef.current?.click()}
            className="w-22 h-22 rounded-full bg-surface-container-lowest shadow-md flex items-center justify-center transition-transform active:scale-95 overflow-hidden relative"
          >
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="معاينة الصورة"
                fill
                className="object-cover"
                sizes="88px"
                unoptimized
              />
            ) : (
              <Icon
                name="person"
                className="text-[44px] text-primary-container"
              />
            )}
          </button>
          <div className="absolute bottom-0 inset-s-0 bg-secondary text-on-secondary w-8 h-8 rounded-full flex items-center justify-center shadow-md pointer-events-none">
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
        <TextField
          label="اسم الشخص"
          placeholder="مثال: الوالد، أو الحاج إبراهيم"
          hint="يمكنك كتابة الاسم أو اللقب المحبب الذي تناديه به"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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
            {RELATIONS.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={relation === value}
                onClick={() => toggleRelation(value)}
                className={cn(
                  "h-12 px-3 rounded-xl shadow-sm text-label-prominent flex items-center justify-center text-center leading-snug transition-all active:scale-95",
                  relation === value
                    ? "bg-primary-container text-on-primary"
                    : "bg-surface-container-lowest text-on-surface",
                )}
              >
                {value}
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

        {saveError && (
          <p role="alert" className="text-label-caption text-error text-center">
            {saveError}
          </p>
        )}
        <div className="mt-4 flex flex-col gap-3">
          <Button
            type="submit"
            icon="how_to_reg"
            fullWidth
            disabled={!name.trim() || saving}
          >
            {saving ? savingLabel : submitLabel}
          </Button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full h-12 rounded-xl bg-transparent text-on-surface-variant text-label-prominent flex items-center justify-center active:bg-surface-container transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </form>
  );
}
