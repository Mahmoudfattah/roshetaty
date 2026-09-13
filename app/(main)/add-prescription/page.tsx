"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { TopBar } from "@/components/ui/TopBar";
import { Button } from "@/components/ui/Button";
import Icon  from "@/components/ui/Icon";
import { TextField } from "@/components/ui/TextField";
import { addPerson, getSection } from "@/lib/repository";
import { compressImage } from "@/lib/image";
import type { Section } from "@/lib/types";
import { cn } from "@/lib/utils";

const RELATIONS = ["الوالد", "الوالدة", "الزوج/الزوجة", "الابن", "الابنة", "الجد/الجدة"];

export default function AddPersonPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const avatarPreviewRef = useRef<string | null>(null);
  const avatarRequestRef = useRef(0);

  const [section, setSection] = useState<Section | null>(null);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState<string | null>(null);
  const [customRelation, setCustomRelation] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [processingAvatar, setProcessingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  useEffect(() => {
    getSection(sectionId).then((s) => setSection(s ?? null));
  }, [sectionId]);

  useEffect(() => {
    return () => {
      if (avatarPreviewRef.current) URL.revokeObjectURL(avatarPreviewRef.current);
    };
  }, []);

  function toggleRelation(value: string) {
    setRelation((current) => (current === value ? null : value));
    if (value !== "أخرى") setCustomRelation("");
  }

  /** بتتأكد إن الصورة فعلًا قابلة للعرض قبل ما نقبلها — بتمسك الملفات المعطوبة/الناقصة (زي صور جوجل فوتوز الأونلاين لسه) */
  function verifyImageLoads(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const testImg = new window.Image();
      testImg.onload = () => resolve(true);
      testImg.onerror = () => resolve(false);
      testImg.src = url;
    });
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (!selected) return;

    const rawInfo = `الملف الأصلي: ${selected.name} | نوعه: ${selected.type || "غير معروف"} | حجمه: ${(selected.size / 1024).toFixed(0)} كيلوبايت`;
    setDebugInfo(rawInfo);

    const requestId = ++avatarRequestRef.current;
    setProcessingAvatar(true);
    setAvatarError(null);
    try {
      const compressed = await compressImage(selected, { maxDimension: 400, quality: 0.85 });
      if (requestId !== avatarRequestRef.current) return;

      setDebugInfo(
        `${rawInfo}\nبعد المعالجة: ${compressed.name} | نوعه: ${compressed.type} | حجمه: ${(compressed.size / 1024).toFixed(0)} كيلوبايت`
      );

      const candidateUrl = URL.createObjectURL(compressed);
      const isValid = await verifyImageLoads(candidateUrl);
      if (requestId !== avatarRequestRef.current) {
        URL.revokeObjectURL(candidateUrl);
        return;
      }

      if (!isValid) {
        URL.revokeObjectURL(candidateUrl);
        setDebugInfo((prev) => `${prev}\n❌ فشل تحميل الصورة الناتجة في <img> — الملف نفسه اللي فشل معطوب أو صيغته مش مدعومة.`);
        console.error("Selected avatar failed to load:", selected.name, selected.type, selected.size);
        setAvatarError(
          "الصورة دي مش قابلة للعرض. اضغط مطولًا على الرسالة اللي فوق دي وابعتها للمطوّر."
        );
        return;
      }

      setDebugInfo((prev) => `${prev}\n✅ نجحت المعاينة`);
      if (avatarPreviewRef.current) URL.revokeObjectURL(avatarPreviewRef.current);
      avatarPreviewRef.current = candidateUrl;
      setAvatarFile(compressed);
      setAvatarPreview(candidateUrl);
    } catch (error) {
      if (requestId !== avatarRequestRef.current) return;
      const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      setDebugInfo((prev) => `${prev}\n❌ استثناء أثناء المعالجة: ${message}`);
      console.error("Failed to prepare avatar:", error);
      setAvatarError("حصلت مشكلة أثناء تجهيز الصورة. جرّب تاني.");
    } finally {
      if (requestId === avatarRequestRef.current) setProcessingAvatar(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || saving) return;

    setSaving(true);
    try {
      const finalRelation = relation === "أخرى" ? customRelation.trim() || undefined : relation ?? undefined;
      const person = await addPerson({
        sectionId,
        name: name.trim(),
        relation: finalRelation,
        avatarFile: avatarFile ?? undefined,
      });
      router.push(`/sections/${sectionId}/people/${person.id}`);
    } catch {
      setSaving(false);
      setErrorToast("حصلت مشكلة أثناء الحفظ. تأكد إن مساحة الجهاز مش ممتلئة وجرب تاني.");
      window.setTimeout(() => setErrorToast(null), 3500);
    }
  }

  return (
    <>
      <TopAppBar />
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
              onClick={() => avatarInputRef.current?.click()}
              disabled={processingAvatar}
              className="w-[88px] h-[88px] rounded-full bg-surface-container-lowest shadow-md flex items-center justify-center transition-transform active:scale-95 overflow-hidden relative disabled:opacity-70"
            >
              {/* <img> عادي مقصود: avatarPreview رابط blob: محلي، next/image مش مُصمم للتعامل معاه بشكل موثوق */}
              {avatarPreview ? (
                <img src={avatarPreview} alt="معاينة الصورة" className="w-full h-full object-cover" />
              ) : (
                <Icon
                  name={processingAvatar ? "hourglass_top" : "person"}
                  className="text-[44px] text-primary-container"
                />
              )}
            </button>
            <div className="absolute bottom-0 start-0 bg-secondary text-on-secondary w-8 h-8 rounded-full flex items-center justify-center shadow-md pointer-events-none">
              <Icon name="photo_camera" className="text-[18px]" />
            </div>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <span className="mt-3 text-label-caption text-on-surface-variant font-medium">
            صورة شخصية (اختياري)
          </span>
          {avatarError && (
            <p role="alert" className="mt-2 text-label-caption text-error text-center max-w-xs leading-relaxed">
              {avatarError}
            </p>
          )}
          {debugInfo && (
            <div className="mt-3 w-full max-w-xs bg-surface-container-high rounded-lg p-3">
              <p className="text-label-caption text-on-surface-variant font-bold mb-1">
                معلومات تشخيصية مؤقتة (لو المشكلة حصلت، صوّر الصندوق ده وابعته):
              </p>
              <pre className="text-[11px] leading-relaxed text-on-surface whitespace-pre-wrap select-all font-mono">
                {debugInfo}
              </pre>
            </div>
          )}
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
              <label className="text-label-prominent text-on-surface">صلة القرابة</label>
              <span className="text-label-caption text-outline">اختياري</span>
            </div>

            <div role="radiogroup" aria-label="صلة القرابة" className="grid grid-cols-3 gap-2.5">
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
                      : "bg-surface-container-lowest text-on-surface"
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
                  : "bg-surface-container-lowest text-on-surface"
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
              <h2 className="text-label-prominent text-on-surface">ملف منظم وآمن</h2>
              <p className="text-label-caption text-on-surface-variant leading-relaxed">
                هنعمل سجل خاص بيحفظ كل روشتات الشخص ده منظمة بالتاريخ، عشان تسهّل عليك مراجعتها مع الدكتور.
              </p>
            </div>
          </div>

          {/* الأزرار */}
          <div className="mt-4 flex flex-col gap-3">
            <Button type="submit" icon="how_to_reg" fullWidth disabled={!name.trim() || saving}>
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

      {errorToast && (
        <div className="fixed bottom-28 inset-x-0 flex justify-center z-40 px-screen-margin pointer-events-none">
          <div className="bg-error text-on-error px-5 py-3 rounded-xl shadow-lg text-label-prominent text-center max-w-sm">
            {errorToast}
          </div>
        </div>
      )}
    </>
  );
}