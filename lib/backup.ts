import JSZip from "jszip";
import { db } from "./db";
import { getSections, getPeople, getAllPrescriptions, replaceAllData } from "./repository";
import type { Section, Person, Prescription } from "./types";

const BACKUP_VERSION = 1;

interface BackupData {
  version: number;
  exportedAt: string;
  sections: Section[];
  people: Person[];
  prescriptions: Prescription[];
}

/** يجمع كل البيانات والصور في ملف zip واحد، وبيرجّعه كـ Blob جاهز للتنزيل */
export async function exportBackup(): Promise<Blob> {
  const [sections, people, prescriptions] = await Promise.all([
    getSections(),
    getPeople(),
    getAllPrescriptions(),
  ]);

  const data: BackupData = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    sections,
    people,
    prescriptions,
  };

  const zip = new JSZip();
  zip.file("data.json", JSON.stringify(data, null, 2));

  const imagesFolder = zip.folder("images");
  const allKeys = await db.keys();
  const imageKeys = allKeys.filter(
    (key): key is string => typeof key === "string" && key.startsWith("image:")
  );

  for (const key of imageKeys) {
    const blob = await db.get<Blob>(key);
    if (blob) {
      const imageId = key.slice("image:".length);
      imagesFolder?.file(imageId, blob);
    }
  }

  return zip.generateAsync({ type: "blob" });
}

/** بتقرأ ملف نسخة احتياطية وترجّع كل البيانات والصور — بتستبدل أي بيانات حالية بالكامل */
export async function importBackup(file: File): Promise<void> {
  const zip = await JSZip.loadAsync(file);

  const dataFile = zip.file("data.json");
  if (!dataFile) {
    throw new Error("ملف النسخة الاحتياطية غير صالح: مفيش data.json جواه");
  }

  const dataText = await dataFile.async("text");
  const data = JSON.parse(dataText) as BackupData;

  // نرجّع الصور الأول عشان لما نرجّع الروشتات تلاقي صورها موجودة فعلًا
  const imagesFolder = zip.folder("images");
  if (imagesFolder) {
    const restoreJobs: Promise<void>[] = [];
    imagesFolder.forEach((relativePath, zipEntry) => {
      if (zipEntry.dir) return;
      restoreJobs.push(
        zipEntry.async("blob").then((blob) => db.set(`image:${relativePath}`, blob))
      );
    });
    await Promise.all(restoreJobs);
  }

  await replaceAllData({
    sections: data.sections ?? [],
    people: data.people ?? [],
    prescriptions: data.prescriptions ?? [],
  });
}