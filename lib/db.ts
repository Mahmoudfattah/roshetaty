import { get, set, createStore } from "idb-keyval";

// لازم تتثبت: npm install idb-keyval
// Use a fresh local store so records created by the old demo data are not loaded.
const store = createStore("rowshatati-db-v2", "keyval");

export const db = {
  get: <T>(key: string) => get<T>(key, store),
  set: (key: string, value: unknown) => set(key, value, store),
};

/** حفظ صورة (روشتة أو أفتار) كـ Blob في IndexedDB، بترجع مفتاحها للتخزين في الـ record */
export async function saveImage(file: File | Blob): Promise<string> {
  const id = crypto.randomUUID();
  await db.set(`image:${id}`, file);
  return id;
}

/**
 * استرجاع رابط قابل للعرض (object URL) لصورة محفوظة.
 * لازم تعمل revoke للرابط ده بعد الاستخدام — استخدم useImageUrl hook بدل ما تناديها مباشرة في component.
 */
export async function getImageUrl(imageId: string): Promise<string | null> {
  const blob = await db.get<Blob>(`image:${imageId}`);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}
