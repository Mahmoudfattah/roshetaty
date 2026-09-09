export interface Section {
  id: string;
  name: string;
  /** اسم أيقونة Material Symbols، زي "stethoscope", "visibility", "dentistry" */
  icon: string;
  createdAt: string;
}

export interface Person {
  id: string;
  sectionId: string;
  name: string;
  /** صلة القرابة، اختياري: "الوالد"، "الوالدة"... */
  relation?: string;
  /** مفتاح صورة البروفايل المحفوظة في IndexedDB، لو موجودة */
  avatarBlobId?: string;
  createdAt: string;
}

export interface Prescription {
  id: string;
  personId: string;
  sectionId: string;
  doctorName?: string;
  /** تاريخ الزيارة بصيغة ISO "2025-01-14" عشان الترتيب يبقى صح */
  visitDate: string;
  /** مفتاح صورة الروشتة المحفوظة في IndexedDB */
  imageBlobId: string;
  note?: string;
  createdAt: string;
}