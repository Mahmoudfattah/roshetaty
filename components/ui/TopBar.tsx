import { ReactNode } from "react";
import Icon  from "./Icon";

interface TopBarProps {
  title: string;
  /** أيقونة القسم أو صورة الشخص، جنب العنوان */
  iconNode?: ReactNode;
  onBack: () => void;
  /** إجراء إضافي أقصى الطرف التاني (زي أيقونة "مشاركة القسم")، اختياري */
  trailing?: ReactNode;
}

/**
 * الهيدر السياقي لكل شاشة (زرار رجوع فعلي + أيقونة/صورة + العنوان الحقيقي).
 * بيتحط جوه main مباشرة، تحت TopAppBar الثابت — مش بديل عنه.
 */
export function TopBar({ title, iconNode, onBack, trailing }: TopBarProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3 min-w-0">
        <button
          aria-label="الرجوع"
          onClick={onBack}
          type="button"
          className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-surface-container-low text-primary-container active:scale-95 transition-transform shadow-sm flex-shrink-0"
        >
          {/* arrow_forward مقصودة: في RTL السهم اللي بيشاور يمين = رجوع للخلف */}
          <Icon name="arrow_forward" className="text-[28px]" />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          {iconNode}
          <h2 className="text-section-title text-primary-container font-bold truncate">
            {title}
          </h2>
        </div>
      </div>
      {trailing && <div className="flex-shrink-0">{trailing}</div>}
    </div>
  );
}