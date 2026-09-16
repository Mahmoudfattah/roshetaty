import { getSections, addSection } from "./repository";
import { db } from "./db";
import type { AppNotification } from "./types";

const DEFAULT_SECTIONS = [
  { name: "باطنة عامة", icon: "stethoscope" },
  { name: "عيون ورمد", icon: "visibility" },
  { name: "أطفال", icon: "child_care" },
  { name: "عظام ومفاصل", icon: "accessibility_new" },
  { name: "أسنان", icon: "dentistry" },
] as const;

const PEOPLE_RESET_KEY = "people-reset-v1";
const DEFAULT_SECTION_NOTIFICATIONS_CLEANED_KEY =
  "default-section-notifications-cleaned-v1";

/** Keeps sections, removes old demo people once, then leaves future data alone. */
export async function ensureDefaultSections(): Promise<void> {
  await removeDefaultSectionNotifications();

  const peopleReset = await db.get<boolean>(PEOPLE_RESET_KEY);
  if (!peopleReset) {
    await db.set("people", []);
    await db.set("prescriptions", []);
    await db.set(PEOPLE_RESET_KEY, true);
  }

  if ((await getSections()).length > 0) return;

  for (const section of DEFAULT_SECTIONS) {
    await addSection(section.name, section.icon, { notify: false });
  }
}

async function removeDefaultSectionNotifications(): Promise<void> {
  if (await db.get<boolean>(DEFAULT_SECTION_NOTIFICATIONS_CLEANED_KEY)) return;

  const notifications =
    (await db.get<AppNotification[]>("notifications")) ?? [];
  await db.set(
    "notifications",
    notifications.filter(
      (notification) =>
        !(
          notification.title === "تمت إضافة قسم طبي" &&
          notification.href === "/manage-sections"
        ),
    ),
  );
  await db.set(DEFAULT_SECTION_NOTIFICATIONS_CLEANED_KEY, true);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("notifications:changed"));
  }
}
