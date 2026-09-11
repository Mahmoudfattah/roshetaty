import { getSections, addSection } from "./repository";

const DEFAULT_SECTIONS = [
  { name: "باطنة عامة", icon: "stethoscope" },
  { name: "عيون ورمد", icon: "visibility" },
  { name: "أطفال", icon: "child_care" },
  { name: "عظام ومفاصل", icon: "accessibility_new" },
  { name: "أسنان", icon: "dentistry" },
] as const;

/** Creates the default medical sections once, without adding people. */
export async function ensureDefaultSections(): Promise<void> {
  if ((await getSections()).length > 0) return;

  for (const section of DEFAULT_SECTIONS) {
    await addSection(section.name, section.icon);
  }
}
