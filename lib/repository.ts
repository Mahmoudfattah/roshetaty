import { db, saveImage } from "./db";
import { compressImage } from "./image";
import type { Section, Person, Prescription } from "./types";

const SECTIONS_KEY = "sections";
const PEOPLE_KEY = "people";
const PRESCRIPTIONS_KEY = "prescriptions";

async function list<T>(key: string): Promise<T[]> {
  return (await db.get<T[]>(key)) ?? [];
}

/**
 * استبدال كل بيانات التطبيق دفعة واحدة — مستخدمة فقط عند استعادة نسخة احتياطية.
 * لازم تتنادى بعد ما الصور المرتبطة تكون اتحفظت في IndexedDB بالفعل.
 */
export async function replaceAllData(data: {
  sections: Section[];
  people: Person[];
  prescriptions: Prescription[];
}): Promise<void> {
  await Promise.all([
    db.set(SECTIONS_KEY, data.sections),
    db.set(PEOPLE_KEY, data.people),
    db.set(PRESCRIPTIONS_KEY, data.prescriptions),
  ]);
}

// ============ الأقسام الطبية ============

export async function getSections(): Promise<Section[]> {
  return list<Section>(SECTIONS_KEY);
}

export async function getSection(
  sectionId: string,
): Promise<Section | undefined> {
  return (await getSections()).find((s) => s.id === sectionId);
}

export async function addSection(name: string, icon: string): Promise<Section> {
  const sections = await getSections();
  const section: Section = {
    id: crypto.randomUUID(),
    name,
    icon,
    createdAt: new Date().toISOString(),
  };
  await db.set(SECTIONS_KEY, [...sections, section]);
  return section;
}

export async function updateSection(
  sectionId: string,
  updates: { name: string; icon: string },
): Promise<void> {
  const sections = await getSections();
  const updated = sections.map((s) =>
    s.id === sectionId ? { ...s, name: updates.name, icon: updates.icon } : s,
  );
  await db.set(SECTIONS_KEY, updated);
}

export async function deleteSection(sectionId: string): Promise<void> {
  const sections = (await getSections()).filter((s) => s.id !== sectionId);
  await db.set(SECTIONS_KEY, sections);

  // حذف الأشخاص والروشتات المرتبطة بالقسم كمان (زي ما اتوضح في delete modal)
  const remainingPeople = (await getPeople()).filter(
    (p) => p.sectionId !== sectionId,
  );
  await db.set(PEOPLE_KEY, remainingPeople);

  const remainingPrescriptions = (await getAllPrescriptions()).filter(
    (p) => p.sectionId !== sectionId,
  );
  await db.set(PRESCRIPTIONS_KEY, remainingPrescriptions);
}

// ============ الأشخاص ============

export async function getPeople(): Promise<Person[]> {
  return list<Person>(PEOPLE_KEY);
}

export async function getPeopleBySection(sectionId: string): Promise<Person[]> {
  return (await getPeople()).filter((p) => p.sectionId === sectionId);
}

export async function getPerson(personId: string): Promise<Person | undefined> {
  return (await getPeople()).find((p) => p.id === personId);
}

export async function addPerson(input: {
  sectionId: string;
  name: string;
  relation?: string;
  avatarFile?: File;
}): Promise<Person> {
  const people = await getPeople();
  const avatarBlobId = input.avatarFile
    ? await saveImage(await compressImage(input.avatarFile))
    : undefined;

  const person: Person = {
    id: crypto.randomUUID(),
    sectionId: input.sectionId,
    name: input.name,
    relation: input.relation,
    avatarBlobId,
    createdAt: new Date().toISOString(),
  };
  await db.set(PEOPLE_KEY, [...people, person]);
  return person;
}

export async function updatePerson(
  personId: string,
  updates: { name: string; relation?: string; avatarFile?: File },
): Promise<void> {
  const people = await getPeople();
  const existing = people.find((person) => person.id === personId);
  if (!existing) throw new Error("Person not found");

  const avatarBlobId = updates.avatarFile
    ? await saveImage(await compressImage(updates.avatarFile))
    : existing.avatarBlobId;
  const updated = people.map((person) =>
    person.id === personId
      ? {
          ...person,
          name: updates.name,
          relation: updates.relation,
          avatarBlobId,
        }
      : person,
  );
  await db.set(PEOPLE_KEY, updated);
}

export async function deletePerson(personId: string): Promise<void> {
  const people = (await getPeople()).filter((p) => p.id !== personId);
  await db.set(PEOPLE_KEY, people);

  const remainingPrescriptions = (await getAllPrescriptions()).filter(
    (p) => p.personId !== personId,
  );
  await db.set(PRESCRIPTIONS_KEY, remainingPrescriptions);
}

// ============ الروشتات ============

export async function getAllPrescriptions(): Promise<Prescription[]> {
  return list<Prescription>(PRESCRIPTIONS_KEY);
}

/** روشتات شخص معين، مرتبة الأحدث أولًا */
export async function getPrescriptionsByPerson(
  personId: string,
): Promise<Prescription[]> {
  const all = await getAllPrescriptions();
  return all
    .filter((p) => p.personId === personId)
    .sort((a, b) => b.visitDate.localeCompare(a.visitDate));
}

export async function getPrescription(
  prescriptionId: string,
): Promise<Prescription | undefined> {
  return (await getAllPrescriptions()).find((p) => p.id === prescriptionId);
}

export async function addPrescription(input: {
  personId: string;
  sectionId: string;
  doctorName?: string;
  clinicName?: string;
  visitDate: string;
  imageFile: File;
  note?: string;
}): Promise<Prescription> {
  const all = await getAllPrescriptions();
  const imageBlobId = await saveImage(await compressImage(input.imageFile));

  const prescription: Prescription = {
    id: crypto.randomUUID(),
    personId: input.personId,
    sectionId: input.sectionId,
    doctorName: input.doctorName,
    clinicName: input.clinicName,
    visitDate: input.visitDate,
    imageBlobId,
    note: input.note,
    createdAt: new Date().toISOString(),
  };
  await db.set(PRESCRIPTIONS_KEY, [...all, prescription]);
  return prescription;
}

export async function updatePrescription(
  prescriptionId: string,
  updates: {
    doctorName?: string;
    clinicName?: string;
    visitDate: string;
    note?: string;
  },
): Promise<void> {
  const all = await getAllPrescriptions();
  const updated = all.map((p) =>
    p.id === prescriptionId
      ? {
          ...p,
          doctorName: updates.doctorName,
          clinicName: updates.clinicName,
          visitDate: updates.visitDate,
          note: updates.note,
        }
      : p,
  );
  await db.set(PRESCRIPTIONS_KEY, updated);
}

export async function deletePrescription(
  prescriptionId: string,
): Promise<void> {
  const all = await getAllPrescriptions();
  await db.set(
    PRESCRIPTIONS_KEY,
    all.filter((p) => p.id !== prescriptionId),
  );
}

/** عدد روشتات كل شخص — مفيدة لعرض شيبة "٣ روشتات" جنب اسمه من غير ما تجيب كل الداتا */
export async function countPrescriptionsByPerson(
  personId: string,
): Promise<number> {
  const all = await getAllPrescriptions();
  return all.filter((p) => p.personId === personId).length;
}

export interface PrescriptionWithContext {
  prescription: Prescription;
  person: Person;
  section: Section;
}

/** كل الروشتات في التطبيق، مع بيانات الشخص والقسم لكل واحدة — مستخدمة في شاشة "كل الروشتات" */
export async function getPrescriptionsWithContext(): Promise<
  PrescriptionWithContext[]
> {
  const [prescriptions, people, sections] = await Promise.all([
    getAllPrescriptions(),
    getPeople(),
    getSections(),
  ]);

  const peopleMap = new Map(people.map((p) => [p.id, p]));
  const sectionsMap = new Map(sections.map((s) => [s.id, s]));

  const result: PrescriptionWithContext[] = [];
  for (const prescription of prescriptions) {
    const person = peopleMap.get(prescription.personId);
    const section = sectionsMap.get(prescription.sectionId);
    if (person && section) {
      result.push({ prescription, person, section });
    }
  }
  return result;
}
export interface SectionSummary {
  section: Section;
  peopleCount: number;
  prescriptionCount: number;
}

/** كل الأقسام مع عدد الأفراد وعدد الروشتات في كل واحد — مستخدمة في شاشة إدارة الأقسام */
export async function getSectionsSummary(): Promise<SectionSummary[]> {
  const [sections, people, prescriptions] = await Promise.all([
    getSections(),
    getPeople(),
    getAllPrescriptions(),
  ]);

  return sections.map((section) => ({
    section,
    peopleCount: people.filter((p) => p.sectionId === section.id).length,
    prescriptionCount: prescriptions.filter((p) => p.sectionId === section.id)
      .length,
  }));
}

export interface DoctorSummary {
  name: string;
  prescriptionCount: number;
  /** اسم آخر قسم شفنا الدكتور مرتبط بيه — مفيش عندنا كيان "دكتور" مستقل، فبنستنتجها من الروشتات */
  sectionName: string;
}

/** قائمة الدكاترة مستنتجة من أسماء الدكاترة المكتوبة في الروشتات — مستخدمة في شاشة البحث */
export async function getDoctors(): Promise<DoctorSummary[]> {
  const items = await getPrescriptionsWithContext();
  const map = new Map<string, DoctorSummary>();

  for (const { prescription, section } of items) {
    if (!prescription.doctorName) continue;
    const existing = map.get(prescription.doctorName);
    if (existing) {
      existing.prescriptionCount += 1;
    } else {
      map.set(prescription.doctorName, {
        name: prescription.doctorName,
        prescriptionCount: 1,
        sectionName: section.name,
      });
    }
  }

  return Array.from(map.values());
}

export interface PersonSummary {
  person: Person;
  prescriptionCount: number;
  /** أحدث تاريخ زيارة داخل القسم ده تحديدًا، أو undefined لو مفيش روشتات لسه */
  lastVisitDate?: string;
}

/** ملخص الأشخاص جوه قسم معين — مستخدمة في شاشة القسم */
export async function getSectionPeopleSummary(
  sectionId: string,
): Promise<PersonSummary[]> {
  const [people, prescriptions] = await Promise.all([
    getPeopleBySection(sectionId),
    getAllPrescriptions(),
  ]);

  return people.map((person) => {
    const personPrescriptions = prescriptions.filter(
      (p) => p.personId === person.id && p.sectionId === sectionId,
    );
    const lastVisitDate = personPrescriptions
      .map((p) => p.visitDate)
      .sort()
      .at(-1);

    return {
      person,
      prescriptionCount: personPrescriptions.length,
      lastVisitDate,
    };
  });
}
