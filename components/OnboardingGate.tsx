"use client";

import { ReactNode, useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";

type OnboardingGateProps = {
  children: ReactNode;
  renderOnboarding: (
    screen: number,
    onScreenChange: (screen: number) => void,
    onFinish: () => void,
  ) => ReactNode;
};

export function OnboardingGate({
  children,
  renderOnboarding,
}: OnboardingGateProps) {
  const [screen, setScreen] = useState<number | null>(0);

  useEffect(() => {
    if (window.localStorage.getItem("roshetaty-onboarding") === "done") {
      setScreen(null);
      return;
    }

    const timer = window.setTimeout(() => setScreen(1), 900);
    return () => window.clearTimeout(timer);
  }, []);

  if (screen === null) return children;
  if (screen === 0) return <SplashScreen />;

  return renderOnboarding(screen, setScreen, () => {
    window.localStorage.setItem("roshetaty-onboarding", "done");
    setScreen(null);
  });
}

function SplashScreen() {
  return (
    <main className="intro-splash" dir="rtl" aria-label="روشتاتي">
      <div className="splash-mark">
        <Icon name="description" />
        <Icon name="add" className="splash-mark-plus" />
      </div>
      <h1>روشتاتي</h1>
      <p>أرشيف طبي لعائلتك</p>
    </main>
  );
}
