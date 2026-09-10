"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { Button } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { Chip } from "@/components/ui/Chip";
import { useImageUrl } from "@/lib/hooks/useImageUrl"; // تأكد من مسار الهوك
import { getPrescription, getPerson, getSection, deletePrescription } from "@/lib/repository"; // أو ملف db.ts حسب مسمياتك
import type { Prescription, Person, Section } from "@/lib/types";
import { formatArabicDate, cn } from "@/lib/utils";
import { TopBar } from "@/components/ui/TopBar";

interface PageProps {
  params: Promise<{
    sectionId: string;
    personId: string;
    prescriptionId: string;
  }>;
}

export default function PrescriptionDetailsPage({ params }: PageProps) {
  const router = useRouter();
  // فك الـ params (مطلوبة في Next.js 14/15)
  const resolvedParams = use(params);
  const { sectionId, personId, prescriptionId } = resolvedParams;

  // الحالات (States) الخاصة بالبيانات
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [person, setPerson] = useState<Person | null>(null);
  const [section, setSection] = useState<Section | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // الحالات التفاعلية للواجهة
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExtraDetails, setShowExtraDetails] = useState(false);

  // جلب رابط الصورة الآمن
  const imageUrl = useImageUrl(prescription?.imageBlobId);

  // تحميل البيانات من IndexedDB
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      const [fetchedPrescription, fetchedPerson, fetchedSection] = await Promise.all([
        getPrescription(prescriptionId),
        getPerson(personId),
        getSection(sectionId),
      ]);

      if (!cancelled) {
        setPrescription(fetchedPrescription || null);
        setPerson(fetchedPerson || null);
        setSection(fetchedSection || null);
        setIsLoading(false);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, [prescriptionId, personId, sectionId]);

  // دالة تدوير الصورة
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // دالة الحذف
  const handleDelete = async () => {
    if (confirm("هل أنت متأكد من حذف هذه الروشتة نهائياً؟")) {
      await deletePrescription(prescriptionId);
      router.back(); // العودة للصفحة السابقة بعد الحذف
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center mt-20">جاري تحميل الروشتة...</div>;
  }

  if (!prescription || !person || !section) {
    return <div className="p-8 text-center text-error mt-20">الروشتة غير موجودة.</div>;
  }

  return (

    <>

       <TopAppBar
                  logoSrc="/logo1.png"
                  trailing={
                    <button
                      aria-label="مركز التنبيهات"
                      type="button"
                      className="w-12 h-12 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
                    >
                      <Icon name="notifications" className="text-[26px]" />
                    </button>
                  }
                />
      
                <TopBar title="  " onBack={() => router.back()} />
    <main className="min-h-screen pb-24">
     
      <div className="pt-20 px-4 md:px-6 max-w-2xl mx-auto flex flex-col gap-6">
        
        {/* === منطقة عرض الصورة === */}
        <section className="flex flex-col gap-3">
          <div className="relative w-full h-[350px] bg-surface-container rounded-3xl overflow-hidden shadow-sm flex items-center justify-center">
            {/* شريطة "وثيقة أصلية" */}
            <div className="absolute top-4 left-4 z-10">
              <Chip className="bg-surface-container-lowest/80 backdrop-blur-md text-on-surface shadow-sm">
                <Icon name="verified" className="text-[18px] ml-1 text-primary" filled />
                وثيقة أصلية
              </Chip>
            </div>

            {imageUrl ? (
              <img
                src={imageUrl}
                alt="صورة الروشتة"
                className="max-h-full max-w-full object-contain transition-transform duration-300 cursor-pointer"
                style={{ transform: `rotate(${rotation}deg)` }}
                onClick={() => setIsFullscreen(true)}
              />
            ) : (
              <Icon name="image_not_supported" className="text-6xl text-outline-variant" />
            )}
          </div>

          {/* أزرار التحكم بالصورة */}
          <div className="flex gap-3">
            <Button variant="soft" className="flex-1 rounded-xl" onClick={handleRotate} icon="rotate_right">
              تدوير
            </Button>
            <Button variant="secondary" className="flex-[2] rounded-xl" onClick={() => setIsFullscreen(true)} icon="zoom_in">
              تكبير الصورة
            </Button>
          </div>
          <p className="text-center text-label-medium text-on-surface-variant flex items-center justify-center gap-1 mt-1">
            <Icon name="touch_app" className="text-[16px]" />
            اضغط على الصورة أو زر التكبير لرؤية الروشتة بملء الشاشة
          </p>
        </section>

        {/* === كارت تفاصيل الكشف === */}
        <section className="bg-white rounded-[24px] p-5 shadow-sm border border-outline-variant/20 flex flex-col gap-5 relative">
          
          {/* صاحب الروشتة */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
              <Icon name="person" className="text-[28px]" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <span className="text-label-small text-on-surface-variant mb-0.5">صاحب الروشتة</span>
              <p className="text-body-large font-bold text-on-surface truncate">
                {person.name} {person.relation && `(${person.relation})`}
              </p>
            </div>
            <Chip active>ملف العائلة</Chip>
          </div>

          <hr className="border-outline-variant/30" />

          {/* تاريخ الكشف */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center shrink-0 text-on-surface-variant">
              <Icon name="calendar_today" className="text-[24px]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-label-small text-on-surface-variant mb-0.5 block">تاريخ الكشف</span>
              <p className="text-body-large font-bold text-on-surface truncate">
                {formatArabicDate(prescription.visitDate)}
              </p>
            </div>
          </div>

          {/* الطبيب المعالج */}
          {prescription.doctorName && (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center shrink-0 text-on-surface-variant">
                <Icon name="stethoscope" className="text-[24px]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-label-small text-on-surface-variant mb-0.5 block">الطبيب المعالج</span>
                <p className="text-body-large font-bold text-on-surface truncate">
                  د. {prescription.doctorName} <span className="font-normal text-on-surface-variant">({section.name})</span>
                </p>
              </div>
            </div>
          )}

          {/* تفاصيل إضافية (Accordion) */}
          {(prescription.note || prescription.clinicName) && (
            <div className="mt-2">
              <button
                onClick={() => setShowExtraDetails(!showExtraDetails)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-lowest transition-colors text-on-surface font-medium"
              >
                <div className="flex items-center gap-2">
                  <Icon name="folder_open" className="text-[22px] text-on-surface-variant" />
                  <span>تفاصيل إضافية (العيادة، الملاحظات)</span>
                </div>
                <Icon name={showExtraDetails ? "keyboard_arrow_up" : "keyboard_arrow_down"} />
              </button>
              
              {showExtraDetails && (
                <div className="p-4 bg-surface-container-lowest rounded-xl mt-2 flex flex-col gap-3 text-body-medium">
                  {prescription.clinicName && (
                    <p><span className="font-bold text-primary">العيادة:</span> {prescription.clinicName}</p>
                  )}
                  {prescription.note && (
                    <p><span className="font-bold text-primary">ملاحظات:</span> {prescription.note}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* === شريط الأزرار السفلي === */}
        <section className="flex gap-3 pt-4">
          <Button variant="destructive" className="px-0 w-14 rounded-xl shrink-0" onClick={handleDelete} aria-label="حذف">
            <Icon name="delete" className="text-[24px]" />
          </Button>
          <Button variant="soft" className="flex-1 rounded-xl" icon="edit">
            تعديل
          </Button>
          <Button variant="primary" className="flex-1 rounded-xl" icon="share">
            مشاركة
          </Button>
        </section>
      </div>

      {/* === نافذة التكبير (Fullscreen Modal) === */}
      {isFullscreen && imageUrl && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col backdrop-blur-sm">
          <div className="p-4 flex justify-between items-center absolute top-0 inset-x-0 z-10 bg-gradient-to-b from-black/60 to-transparent">
            <button 
              onClick={() => setIsFullscreen(false)}
              className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <Icon name="close" className="text-[28px]" />
            </button>
            <button 
              onClick={handleRotate}
              className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors flex gap-1"
            >
              <Icon name="rotate_right" className="text-[28px]" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden touch-pinch-zoom">
            <img
              src={imageUrl}
              alt="روشتة مكبرة"
              className="max-h-full max-w-full object-contain transition-transform duration-300"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
          </div>
        </div>
      )}
    </main>
    </>
  );
}