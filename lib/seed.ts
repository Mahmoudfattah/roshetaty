import { getSections, addSection } from "./repository";
import { db } from "./db";

const DEFAULT_SECTIONS = [
  { name: "باطنة عامة", icon: "stethoscope" },
  { name: "عيون ورمد", icon: "visibility" },
  { name: "أطفال", icon: "child_care" },
  { name: "عظام ومفاصل", icon: "accessibility_new" },
  { name: "أسنان", icon: "dentistry" },
] as const;

const PEOPLE_RESET_KEY = "people-reset-v1";

/** Keeps sections, removes old demo people once, then leaves future data alone. */
export async function ensureDefaultSections(): Promise<void> {
  const peopleReset = await db.get<boolean>(PEOPLE_RESET_KEY);
  if (!peopleReset) {
    await db.set("people", []);
    await db.set("prescriptions", []);
    await db.set(PEOPLE_RESET_KEY, true);
  }

  if ((await getSections()).length > 0) return;

  for (const section of DEFAULT_SECTIONS) {
    await addSection(section.name, section.icon);
  }
}
