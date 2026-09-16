"use server";

import { cookies } from "next/headers";

const ONBOARDING_COOKIE = "roshetaty-onboarding";

export async function completeOnboarding(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ONBOARDING_COOKIE, "true", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}