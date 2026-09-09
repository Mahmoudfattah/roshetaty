import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  /** الحالة المفعّلة — لون أغمق وخلفية أقوى */
  active?: boolean;
}

/** شيبة صغيرة للعدادات والوسوم، زي "٥ تخصصات" أو "٣ روشتات" */
export function Chip({ active, className, children, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-h-[28px] px-3 py-1 rounded-full text-label-caption font-bold whitespace-nowrap",
        active ? "bg-secondary text-on-secondary" : "bg-secondary-fixed text-secondary",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}