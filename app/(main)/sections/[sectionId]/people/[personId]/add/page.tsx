"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { TopBar } from "@/components/ui/TopBar";
import { Button } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { TextField } from "@/components/ui/TextField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { getPerson, addPrescription } from "@/lib/repository";
import type { Person } from "@/lib/types";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AddPrescriptionPage() {
  const { sectionId, personId } = useParams<{
    sectionId: string;
    personId: string;
  }>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [person, setPerson] = useState<Person | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [visitDate, setVisitDate] = useState(todayIso());
  const [doctorName, setDoctorName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPerson(personId).then((p) => setPerson(p ?? null));
  }, [personId]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = URL.createObjectURL(selected);
    setFile(selected);
    setPreviewUrl(previewUrlRef.current);
  }

  async function handleSave() {
    if (!file || saving) return;
    setSaving(true);
    try {
      await addPrescription({
        personId,
        sectionId,
        doctorName: doctorName.trim() || undefined,
        clinicName: clinicName.trim() || undefined,
        visitDate,
        imageFile: file,
        note: note.trim() || undefined,
      });
      router.push(`/sections/${sectionId}/people/${personId}`);
    } catch {
      setSaving(false);
    }
  }

  return (
    <>
      <TopAppBar />
      <TopBar title="إضافة روشتة جديدة" onBack={() => router.back()} />

      <div className="flex flex-col w-full pb-8">
        {!previewUrl ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 mb-6 flex flex-col items-center justify-center gap-3 w-full h-56 rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
              <Icon name="photo_camera" className="text-[32px]" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-card-title text-on-surface font-bold">
                التقط صورة أو اخترها من المعرض
              </span>
              <span className="text-label-caption text-on-surface-variant">
                هنحفظها في أرشيف {person?.name ?? "الشخص"} تلقائيًا
              </span>
            </div>
          </button>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl p-card-pad shadow-sm mb-6 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-18 h-18 shrink-0 rounded-xl overflow-hidden shadow-sm bg-surface-container">
                <Image
                  src={previewUrl}
                  alt="معاينة الروشتة"
                  fill
                  className="object-cover"
                  sizes="72px"
                  unoptimized
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1 text-primary">
                  <Icon name="check_circle" filled className="text-[20px]" />
                  <span className="text-label-prominent text-on-surface font-bold">
                    تم اختيار الصورة
                  </span>
                </div>
                <h2 className="text-section-title text-on-surface mb-0.5 leading-snug">
                  جاهز للحفظ
                </h2>
                <p className="text-body-muted text-on-surface-variant">
                  تقدر تحفظها دلوقتي أو تضيف تفاصيل زيادة تحت
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-secondary text-label-prominent font-bold text-center py-1 hover:underline"
            >
              تغيير الصورة
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {previewUrl && (
          <div className="flex items-center gap-2 bg-secondary-fixed/30 rounded-lg p-2.5 text-on-secondary-container mb-6">
            <Icon name="verified" className="text-[20px] text-secondary" />
            <span className="text-label-caption font-semibold">
              الصورة محفوظة على جهازك بس، من غير إنترنت
            </span>
          </div>
        )}

        <div className="flex flex-col mb-8">
          <button
            type="button"
            aria-expanded={detailsOpen}
            onClick={() => setDetailsOpen((v) => !v)}
            className="w-full min-h-touch-min bg-surface-container-lowest rounded-xl p-card-pad flex items-center justify-between shadow-sm transition-colors text-right"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                <Icon name="description" className="text-[22px]" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-card-title text-on-surface">
                  إضافة تفاصيل (اختياري)
                </span>
                <span className="text-label-caption text-on-surface-variant">
                  لتسهيل البحث لاحقًا بالاسم أو الطبيب
                </span>
              </div>
            </div>
            <div
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant transition-transform duration-300"
              style={{
                transform: detailsOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <Icon name="expand_more" className="text-[22px]" />
            </div>
          </button>

          {detailsOpen && (
            <div className="bg-surface-container-lowest rounded-xl p-card-pad shadow-sm flex flex-col gap-5 mt-3">
              <TextField
                label="تاريخ الزيارة"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
              />
              <TextField
                label="اسم الدكتور"
                placeholder="مثال: د. خالد عبد الرحمن"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
              />
              <TextField
                label="اسم العيادة / المستشفى"
                placeholder="مثال: مجمع الأمل الطبي"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
              />
              <TextAreaField
                label="ملاحظات إضافية"
                placeholder="أي توجيهات أو ملاحظات..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="bg-surface-container-low rounded-xl p-card-pad mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
            <Icon name="cloud_done" className="text-[24px]" />
          </div>
          <p className="text-label-caption text-on-surface-variant leading-relaxed">
            بيتم حفظ النسخة على جهازك في الأرشيف الطبي الآمن، وتقدر ترجعلها في
            أي وقت من غير إنترنت.
          </p>
        </div>

        <div className="flex flex-col gap-4 mt-auto">
          <Button
            icon="save"
            fullWidth
            disabled={!file || saving}
            onClick={handleSave}
          >
            {saving ? "جاري الحفظ..." : "حفظ الروشتة"}
          </Button>
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full py-2 text-center text-error text-body-default hover:underline active:opacity-75 transition-opacity"
          >
            إلغاء
          </button>
        </div>
      </div>
    </>
  );
}
