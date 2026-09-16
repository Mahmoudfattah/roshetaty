"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "@/app/actions/onboarding";
import { Onboarding } from "@/app/(main)/page";

export default function OnboardingPage() {
  const router = useRouter();
  const [screen, setScreen] = useState(1);

  async function finishOnboarding() {
    await completeOnboarding();
    router.replace("/home");
  }

  return (
    <Onboarding
      screen={screen}
      onScreenChange={setScreen}
      onFinish={() => void finishOnboarding()}
    />
  );
}
