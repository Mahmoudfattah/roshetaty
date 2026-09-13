"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { TopBar } from "@/components/ui/TopBar";
import { Button } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { TextField } from "@/components/ui/TextField";
import { Modal } from "@/components/ui/Modal";
import { toArabicDigits } from "@/lib/utils";
import {
  getSectionsSummary,
  addSection,
  updateSection,
  deleteSection,
  type SectionSummary,
} from "@/lib/repository";
import type { Section } from "@/lib/types";

const ICON_OPTIONS = [
  "stethoscope",
  "visibility",
  "child_care",
  "accessibility_new",
  "dentistry",
  "medication",
  "ecg_heart",
  "healing",
];

export default function ManageSectionsPage() {
  const router = useRouter();

  const [summaries, setSummaries] = useState<SectionSummary[] | null>(null);

  // مودال الإضافة/التعديل
  const [formOpen, setFormOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const [saving, setSaving] = useState(false);

  // مودال الحذف
  const [deleteTarget, setDeleteTarget] = useState<SectionSummary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  function showErrorToast(message: string) {
    setErrorToast(message);
    window.setTimeout(() => setErrorToast(null), 3500);
  }

  async function refresh() {
    setSummaries(await getSectionsSummary());
  }

  useEffect(() => {
    refresh();
  }, []);

  function openAddModal() {
    setEditingSection(null);
    setName("");
    setIcon(ICON_OPTIONS[0]);
    setFormOpen(true);
  }

  function openEditModal(section: Section) {
    setEditingSection(section);
    setName(section.name);
    setIcon(section.icon);
    setFormOpen(true);
  }

  async function handleSaveSection() {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      if (editingSection) {
        await updateSection(editingSection.id, { name: name.trim(), icon });
      } else {
        await addSection(name.trim(), icon);
      }
      setFormOpen(false);
      await refresh();
    } catch {
      showErrorToast("حصلت مشكلة أثناء الحفظ، جرب تاني");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await deleteSection(deleteTarget.section.id);
      setDeleteTarget(null);
      await refresh();
    } catch {
      showErrorToast("حصلت مشكلة أثناء الحذف، جرب تاني");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <TopAppBar />
      <TopBar title="إدارة الأقسام الطبية" onBack={() => router.back()} />

      <div className="flex flex-col w-full pb-24">
        <div className="flex flex-col gap-2 pt-2 mb-6">
          <div className="flex items-center gap-3 bg-secondary-fixed/40 px-4 py-3 rounded-xl">
            <Icon name="info" className="text-secondary text-[24px]" />
            <p className="text-body-default text-on-surface-variant">
              يمكنك تعديل أسماء التخصصات أو حذف الأقسام غير المستخدمة بسهولة.
            </p>
          </div>
          <div className="flex items-center justify-between px-1">
            <span className="text-card-title text-primary-container">
              الأقسام الحالية
            </span>
            {summaries && (
              <span className="text-label-caption text-secondary bg-surface-container-high px-3 py-1 rounded-full font-semibold">
                {toArabicDigits(summaries.length)} أقسام
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3.5 w-full">
          {summaries === null && <ListSkeleton />}

          {summaries?.map(({ section, peopleCount, prescriptionCount }) => {
            const canDelete = peopleCount === 0;
            return (
              <div
                key={section.id}
                className="bg-surface-container-lowest rounded-[18px] p-card-pad shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-full bg-secondary-fixed/60 flex items-center justify-center shrink-0 text-secondary">
                    <Icon name={section.icon} className="text-[28px]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h2 className="text-card-title text-on-surface truncate">
                      {section.name}
                    </h2>
                    <span className="text-label-caption text-on-surface-variant truncate">
                      عدد الروشتات: {toArabicDigits(prescriptionCount)} · عدد
                      الأفراد: {toArabicDigits(peopleCount)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 mr-2">
                  <button
                    type="button"
                    aria-label={`تعديل قسم ${section.name}`}
                    onClick={() => openEditModal(section)}
                    className="w-[52px] h-[52px] rounded-xl bg-surface-container-low text-primary-container flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <Icon name="edit" className="text-[24px]" />
                  </button>
                  <button
                    type="button"
                    aria-label={
                      canDelete
                        ? `حذف قسم ${section.name}`
                        : `لازم تشيل الأفراد من قسم ${section.name} الأول عشان تحذفه`
                    }
                    onClick={() =>
                      canDelete &&
                      setDeleteTarget({
                        section,
                        peopleCount,
                        prescriptionCount,
                      })
                    }
                    disabled={!canDelete}
                    title={
                      !canDelete
                        ? "لازم تشيل الأفراد من القسم الأول عشان تقدر تحذفه"
                        : undefined
                    }
                    className="w-[52px] h-[52px] rounded-xl bg-error-container/60 text-error flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <Icon name="delete" className="text-[24px]" />
                  </button>
                </div>
              </div>
            );
          })}

          {summaries?.length === 0 && (
            <p className="text-body-muted text-on-surface-variant text-center py-10">
              لسه مفيش أقسام. ابدأ بإضافة أول قسم طبي.
            </p>
          )}
        </div>
      </div>

      {/* زرار إضافة ثابت أسفل الشاشة */}
      <div className="fixed bottom-24 inset-x-screen-margin z-40">
        <Button
          icon="add_circle"
          fullWidth
          variant="soft"
          onClick={openAddModal}
        >
          + إضافة قسم جديد
        </Button>
      </div>

      {/* مودال الإضافة/التعديل */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)}>
        <div className="flex items-center justify-between">
          <h3 className="text-section-title text-primary-container">
            {editingSection ? "تعديل القسم" : "إضافة قسم جديد"}
          </h3>
          <button
            type="button"
            aria-label="إغلاق النافذة"
            onClick={() => setFormOpen(false)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant bg-surface-container"
          >
            <Icon name="close" className="text-[22px]" />
          </button>
        </div>

        <TextField
          label="اسم التخصص الطبي"
          placeholder="مثال: حساسية ومناعة"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex flex-col gap-2">
          <span className="text-label-prominent text-on-surface">
            اختر رمز التخصص
          </span>
          <div className="grid grid-cols-4 gap-3 pt-1">
            {ICON_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                aria-label={option}
                aria-pressed={icon === option}
                onClick={() => setIcon(option)}
                className={`h-14 rounded-xl flex items-center justify-center transition-all ${
                  icon === option
                    ? "bg-primary-container text-on-primary shadow-md"
                    : "bg-surface-container-low text-secondary"
                }`}
              >
                <Icon name={option} className="text-[28px]" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            fullWidth
            disabled={!name.trim() || saving}
            onClick={handleSaveSection}
          >
            {saving
              ? "جاري الحفظ..."
              : editingSection
                ? "حفظ التغييرات"
                : "إضافة القسم"}
          </Button>
          <button
            type="button"
            onClick={() => setFormOpen(false)}
            className="w-28 h-14 bg-surface-container text-on-surface text-label-prominent rounded-xl active:scale-[0.98] transition-transform"
          >
            إلغاء
          </button>
        </div>
      </Modal>

      {/* مودال تأكيد الحذف */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        maxWidthClassName="max-w-sm"
      >
        <div className="flex flex-col gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-error-container text-error mx-auto flex items-center justify-center">
            <Icon name="warning" className="text-[36px]" />
          </div>
          <h3 className="text-section-title text-on-surface">
            هل تود حذف هذا القسم؟
          </h3>
          <p className="text-body-muted text-on-surface-variant">
            سيتم حذف قسم &quot;{deleteTarget?.section.name}&quot; نهائيًا. بما
            إنه مفيهوش أي أفراد حاليًا، الحذف مش هيأثر على أي روشتات محفوظة.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="destructive"
              fullWidth
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? "جاري الحذف..." : "تأكيد الحذف"}
            </Button>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="w-full h-14 bg-surface-container text-on-surface text-label-prominent rounded-xl active:scale-[0.98] transition-transform"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>

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

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-[84px] rounded-[18px] bg-surface-container-lowest animate-pulse"
        />
      ))}
    </div>
  );
}
