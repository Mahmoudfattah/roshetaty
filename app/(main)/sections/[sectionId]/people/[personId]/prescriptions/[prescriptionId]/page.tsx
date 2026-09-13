"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { TopBar } from "@/components/ui/TopBar";
import { Button } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { Chip } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { useImageUrl } from "@/lib/hooks/useImageUrl";
import {
  getPrescription,
  getPerson,
  getSection,
  deletePrescription,
  updatePrescription,
} from "@/lib/repository";
import type { Prescription, Person, Section } from "@/lib/types";
import { formatArabicDate } from "@/lib/utils";

export default function PrescriptionDetailsPage() {
  const { sectionId, personId, prescriptionId } = useParams<{
    sectionId: string;
    personId: string;
    prescriptionId: string;
  }>();
  const router = useRouter();

  const [prescription, setPrescription] = useState<
    Prescription | null | undefined
  >(undefined);
  const [person, setPerson] = useState<Person | null>(null);
  const [section, setSection] = useState<Section | null>(null);

  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExtraDetails, setShowExtraDetails] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editVisitDate, setEditVisitDate] = useState("");
  const [editDoctorName, setEditDoctorName] = useState("");
  const [editClinicName, setEditClinicName] = useState("");
  const [editNote, setEditNote] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [toast, setToast] = useState<string | null>(null);

  const imageUrl = useImageUrl(prescription?.imageBlobId);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [fetchedPrescription, fetchedPerson, fetchedSection] =
        await Promise.all([
          getPrescription(prescriptionId),
          getPerson(personId),
          getSection(sectionId),
        ]);
      if (cancelled) return;
      setPrescription(fetchedPrescription ?? null);
      setPerson(fetchedPerson ?? null);
      setSection(fetchedSection ?? null);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [prescriptionId, personId, sectionId]);

  function handleRotate() {
    setRotation((prev) => (prev + 90) % 360);
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  }

  async function handleConfirmDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      await deletePrescription(prescriptionId);
      router.push(`/sections/${sectionId}/people/${personId}`);
    } catch {
      setDeleting(false);
      showToast("حصلت مشكلة أثناء الحذف، جرب تاني");
    }
  }

  function openEditModal() {
    if (!prescription) return;
    setEditVisitDate(prescription.visitDate);
    setEditDoctorName(prescription.doctorName ?? "");
    setEditClinicName(prescription.clinicName ?? "");
    setEditNote(prescription.note ?? "");
    setEditModalOpen(true);
  }

  async function handleSaveEdit() {
    if (savingEdit) return;
    setSavingEdit(true);
    try {
      await updatePrescription(prescriptionId, {
        visitDate: editVisitDate,
        doctorName: editDoctorName.trim() || undefined,
        clinicName: editClinicName.trim() || undefined,
        note: editNote.trim() || undefined,
      });
      const refreshed = await getPrescription(prescriptionId);
      setPrescription(refreshed ?? null);
      setEditModalOpen(false);
    } catch {
      showToast("حصلت مشكلة أثناء حفظ التعديلات، جرب تاني");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleShare() {
    if (!imageUrl || !prescription) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `روشتة-${prescription.visitDate}.jpg`, {
        type: blob.type || "image/jpeg",
      });

      const shareData: ShareData = {
        title: "روشتة طبية",
        text: `روشتة ${person?.name ?? ""} بتاريخ ${formatArabicDate(prescription.visitDate)}`,
        files: [file],
      };

      if (navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else if (navigator.share) {
        // بعض المتصفحات (خصوصًا على الديسكتوب) بتدعم المشاركة النصية بس من غير ملفات
        await navigator.share({ title: shareData.title, text: shareData.text });
        showToast(
          "المتصفح ده مش بيدعم مشاركة الصور، اتشاركت التفاصيل النصية بس",
        );
      } else {
        showToast("المشاركة مش مدعومة على المتصفح ده");
      }
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") {
        showToast("حصلت مشكلة أثناء المشاركة، جرب تاني");
      }
    }
  }

  // الهيدر ثابت وظاهر في كل الحالات (تحميل / خطأ / بيانات) عشان زرار الرجوع يفضل شغال
  const headerTitle = prescription
    ? formatArabicDate(prescription.visitDate)
    : "تفاصيل الروشتة";

  if (prescription === null || (prescription && (!person || !section))) {
    return (
      <>
        <TopAppBar />
        <TopBar title="الروشتة غير موجودة" onBack={() => router.back()} />
        <p className="text-body-muted text-on-surface-variant text-center py-16">
          يمكن يكون الملف ده اتحذف. ارجع وجرّب تاني.
        </p>
      </>
    );
  }

  return (
    <>
      <TopAppBar />
      <TopBar title={headerTitle} onBack={() => router.back()} />

      {prescription === undefined ? (
        <DetailsSkeleton />
      ) : (
        <div className="flex flex-col gap-6 pb-8">
          {/* === منطقة عرض الصورة === */}
          <section className="flex flex-col gap-3">
            <div className="relative w-full h-[350px] bg-surface-container rounded-3xl overflow-hidden shadow-sm flex items-center justify-center">
              <div className="absolute top-4 right-4 z-10">
                <Chip className="bg-surface-container-lowest/80 backdrop-blur-md text-on-surface shadow-sm flex items-center gap-1">
                  <Icon
                    name="verified"
                    className="text-[18px] text-primary"
                    filled
                  />
                  وثيقة أصلية
                </Chip>
              </div>

              {imageUrl ? (
                // استخدام <img> عادي هنا مقصود: الرابط ده object URL (blob:) من IndexedDB،
                // next/image مش مُصمم للتعامل مع blob URLs بكفاءة.
                <img
                  src={imageUrl}
                  alt="صورة الروشتة"
                  className="max-h-full max-w-full object-contain transition-transform duration-300 cursor-pointer"
                  style={{ transform: `rotate(${rotation}deg)` }}
                  onClick={() => setIsFullscreen(true)}
                />
              ) : (
                <Icon
                  name="image_not_supported"
                  className="text-[48px] text-outline-variant"
                />
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="soft"
                className="flex-1 rounded-xl"
                onClick={handleRotate}
                icon="rotate_right"
              >
                تدوير
              </Button>
              <Button
                variant="secondary"
                className="flex-[2] rounded-xl"
                onClick={() => setIsFullscreen(true)}
                icon="zoom_in"
              >
                تكبير الصورة
              </Button>
            </div>
            <p className="text-center text-label-caption text-on-surface-variant flex items-center justify-center gap-1 mt-1">
              <Icon name="touch_app" className="text-[16px]" />
              اضغط على الصورة أو زر التكبير لرؤية الروشتة بملء الشاشة
            </p>
          </section>

          {/* === كارت تفاصيل الكشف === */}
          <section className="bg-surface-container-lowest rounded-[24px] p-5 shadow-sm flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                <Icon name="person" className="text-[28px]" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="text-label-caption text-on-surface-variant mb-0.5">
                  صاحب الروشتة
                </span>
                <p className="text-card-title font-bold text-on-surface truncate">
                  {person?.name} {person?.relation && `(${person.relation})`}
                </p>
              </div>
              <Chip active>ملف العائلة</Chip>
            </div>

            <hr className="border-outline-variant/30" />

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center shrink-0 text-on-surface-variant">
                <Icon name="calendar_today" className="text-[24px]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-label-caption text-on-surface-variant mb-0.5 block">
                  تاريخ الكشف
                </span>
                <p className="text-card-title font-bold text-on-surface truncate">
                  {prescription && formatArabicDate(prescription.visitDate)}
                </p>
              </div>
            </div>

            {prescription?.doctorName && (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center shrink-0 text-on-surface-variant">
                  <Icon name="stethoscope" className="text-[24px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-label-caption text-on-surface-variant mb-0.5 block">
                    الطبيب المعالج
                  </span>
                  <p className="text-card-title font-bold text-on-surface truncate">
                    د. {prescription.doctorName}{" "}
                    {section && (
                      <span className="font-normal text-on-surface-variant">
                        ({section.name})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {(prescription?.note || prescription?.clinicName) && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowExtraDetails((v) => !v)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors text-on-surface font-medium"
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      name="folder_open"
                      className="text-[22px] text-on-surface-variant"
                    />
                    <span>تفاصيل إضافية (العيادة، الملاحظات)</span>
                  </div>
                  <Icon
                    name={
                      showExtraDetails
                        ? "keyboard_arrow_up"
                        : "keyboard_arrow_down"
                    }
                  />
                </button>

                {showExtraDetails && (
                  <div className="p-4 bg-surface-container-low rounded-xl mt-2 flex flex-col gap-3 text-body-default">
                    {prescription.clinicName && (
                      <p>
                        <span className="font-bold text-primary-container">
                          العيادة:{" "}
                        </span>
                        {prescription.clinicName}
                      </p>
                    )}
                    {prescription.note && (
                      <p>
                        <span className="font-bold text-primary-container">
                          ملاحظات:{" "}
                        </span>
                        {prescription.note}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* === شريط الأزرار السفلي === */}
          <section className="flex gap-2 sm:gap-3">
            <Button
              variant="destructive"
              className="px-0 w-12 sm:w-14 rounded-xl shrink-0"
              onClick={() => setDeleteModalOpen(true)}
              aria-label="حذف"
              disabled={deleting}
            >
              <Icon name="delete" className="text-[22px] sm:text-[24px]" />
            </Button>

            <Button
              variant="soft"
              className="flex-1 rounded-xl px-2 gap-1 text-sm sm:px-4 sm:gap-3 sm:text-base whitespace-nowrap"
              icon="edit"
              onClick={openEditModal}
            >
              تعديل
            </Button>

            <Button
              variant="primary"
              className="flex-1 rounded-xl px-2 gap-1 text-sm sm:px-4 sm:gap-3 sm:text-base whitespace-nowrap"
              icon="share"
              onClick={handleShare}
            >
              مشاركة
            </Button>
          </section>
        </div>
      )}

      {/* === نافذة التكبير === */}
      {isFullscreen && imageUrl && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col backdrop-blur-sm">
          <div className="p-4 flex justify-between items-center absolute top-0 inset-x-0 z-10 bg-gradient-to-b from-black/60 to-transparent">
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <Icon name="close" className="text-[28px]" />
            </button>
            <button
              type="button"
              onClick={handleRotate}
              className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <Icon name="rotate_right" className="text-[28px]" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            <img
              src={imageUrl}
              alt="روشتة مكبرة"
              className="max-h-full max-w-full object-contain transition-transform duration-300"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
          </div>
        </div>
      )}
      {/* === مودال تأكيد الحذف === */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        maxWidthClassName="max-w-sm"
      >
        <div className="flex flex-col gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-error-container text-error mx-auto flex items-center justify-center">
            <Icon name="warning" className="text-[36px]" />
          </div>
          <h3 className="text-section-title text-on-surface">
            هل أنت متأكد من الحذف؟
          </h3>
          <p className="text-body-muted text-on-surface-variant">
            هيتم حذف هذه الروشتة نهائيًا ومش هينفع نرجعها تاني.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="destructive"
              fullWidth
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? "جاري الحذف..." : "نعم، تأكيد الحذف"}
            </Button>
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="w-full h-14 bg-surface-container text-on-surface text-label-prominent rounded-xl active:scale-[0.98] transition-transform"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>

      {/* === مودال التعديل === */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <div className="flex items-center justify-between">
          <h3 className="text-section-title text-primary-container">
            تعديل بيانات الروشتة
          </h3>
          <button
            type="button"
            aria-label="إغلاق النافذة"
            onClick={() => setEditModalOpen(false)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant bg-surface-container"
          >
            <Icon name="close" className="text-[22px]" />
          </button>
        </div>

        <TextField
          label="تاريخ الزيارة"
          type="date"
          value={editVisitDate}
          onChange={(e) => setEditVisitDate(e.target.value)}
        />
        <TextField
          label="اسم الدكتور"
          value={editDoctorName}
          onChange={(e) => setEditDoctorName(e.target.value)}
        />
        <TextField
          label="اسم العيادة / المستشفى"
          value={editClinicName}
          onChange={(e) => setEditClinicName(e.target.value)}
        />
        <TextAreaField
          label="ملاحظات إضافية"
          value={editNote}
          onChange={(e) => setEditNote(e.target.value)}
        />

        <div className="flex items-center gap-3 pt-2">
          <Button fullWidth onClick={handleSaveEdit} disabled={savingEdit}>
            {savingEdit ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
          <button
            type="button"
            onClick={() => setEditModalOpen(false)}
            className="w-28 h-14 bg-surface-container text-on-surface text-label-prominent rounded-xl active:scale-[0.98] transition-transform"
          >
            إلغاء
          </button>
        </div>
      </Modal>

      {/* === Toast بسيط === */}
      {toast && (
        <div className="fixed bottom-28 inset-x-0 flex justify-center z-40 px-screen-margin pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-full shadow-lg text-label-prominent text-center">
            {toast}
          </div>
        </div>
      )}
    </>
  );
}

function DetailsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="w-full h-[350px] rounded-3xl bg-surface-container-lowest animate-pulse" />
      <div className="h-40 rounded-[24px] bg-surface-container-lowest animate-pulse" />
    </div>
  );
}
