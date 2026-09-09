import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * دمج class names بأمان (بيحل تعارض classes التيلويند زي p-4 مع p-2)
 * لازم تتثبت: npm install clsx tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/** تحويل رقم لأرقام عربية-هندية، زي ما التصميم مستخدم في كل مكان (٣ روشتات) */
export function toArabicDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => ARABIC_DIGITS[Number(d)]);
}

const arabicDateFormatter = new Intl.DateTimeFormat("ar-EG", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** تنسيق تاريخ ISO ("2025-01-14") لشكل "١٤ يناير ٢٠٢٥" زي التصميم بالظبط */
export function formatArabicDate(isoDate: string): string {
  return arabicDateFormatter.format(new Date(isoDate));
}