import { BottomNav } from "@/components/ui/Bottemnav";
import { ReactNode } from "react";


/**
 * Route group (main) — مش بيأثر على الـ URL، بس بيخلي BottomNav
 * ثابتة ومشتركة بين كل التابس الأربعة من غير ما تتكرر في كل صفحة.
 */
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col relative w-full px-screen-margin pt-20 pb-28 bg-surface">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}