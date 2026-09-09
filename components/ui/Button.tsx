import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import Icon  from "./Icon";

type Variant = "primary" | "secondary" | "soft" | "destructive" | "destructive-outline" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** اسم أيقونة Material Symbols (اختياري) */
  icon?: string;
  iconFilled?: boolean;
  /**
   * "start" = الحافة اليمين، الوضع الافتراضي حسب DESIGN.md (زي زرار "إضافة روشتة")
   * "end"   = الحافة الشمال، بيتستخدم في أزرار "التالي" جوه خطوات الفورم
   */
  iconPosition?: "start" | "end";
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary-container text-on-primary hover:bg-primary shadow-md",
  secondary:
    "bg-secondary-fixed/40 text-secondary border-[1.5px] border-secondary hover:bg-secondary-fixed/70",
  soft: "bg-secondary-fixed text-primary-container hover:bg-secondary-fixed/70 shadow-sm",
  destructive: "bg-error text-on-error shadow-md",
  "destructive-outline":
    "bg-surface-container-lowest text-error border-[1.5px] border-error",
  icon: "bg-surface-container text-on-surface hover:bg-surface-container-high rounded-full",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      icon,
      iconFilled,
      iconPosition = "start",
      fullWidth,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isIconOnly = variant === "icon";
    const iconEl = icon ? (
      <Icon name={icon} className="text-[24px]" filled={iconFilled} />
    ) : null;

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-3 rounded-2xl transition-all active:scale-[0.98] focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
          isIconOnly
            ? "w-13 h-13 min-w-[52px] min-h-[52px]"
            : "h-14 min-h-[56px] px-8 text-card-title font-bold",
          fullWidth && "w-full",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {iconPosition === "start" && iconEl}
        {children}
        {iconPosition === "end" && iconEl}
      </button>
    );
  }
);
Button.displayName = "Button";