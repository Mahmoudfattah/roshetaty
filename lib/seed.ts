import { getSections, addSection, addPerson } from "./repository";

const SEED_SECTIONS: { name: string; icon: string; people: string[] }[] = [
  { name: "باطنة عامة", icon: "stethoscope", people: ["أحمد (الوالد)", "فاطمة (الوالدة)", "عمر"] },
  { name: "عيون ورمد", icon: "visibility", people: ["أحمد (الوالد)", "فاطمة (الوالدة)"] },
  { name: "أطفال", icon: "child_care", people: ["عمر", "سارة"] },
  { name: "عظام ومفاصل", icon: "accessibility_new", people: ["أحمد (الوالد)"] },
  { name: "أسنان", icon: "dentistry", people: ["أحمد (الوالد)", "فاطمة (الوالدة)", "عمر"] },
];

/**
 * بتتنادى مرة واحدة (مثلاً في أول تحميل للـ Home) عشان تملى بيانات تجريبية
 * لو المستخدم لسه ما ضافش أي قسم بنفسه. آمنة تتنادى أكتر من مرة — مش هتكرر البيانات.
 */
export async function ensureSeedData(): Promise<void> {
  const existing = await getSections();
  if (existing.length > 0) return;

  for (const s of SEED_SECTIONS) {
    const section = await addSection(s.name, s.icon);
    for (const personName of s.people) {
      await addPerson({ sectionId: section.id, name: personName });
    }
  }
}