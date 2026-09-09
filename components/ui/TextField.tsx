import { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** لابل ثابت فوق الحقل — ممنوع نستخدم floating label لأنه بيبقى صغير جدًا لكبار السن */
  label: string;
  hint?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, hint, id, className, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
      <div className="flex flex-col gap-2 w-full">
        <label
          htmlFor={inputId}
          className="text-label-prominent text-on-surface"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          autoComplete="off"
          className={cn(
            "w-full h-14 px-4 bg-surface-container-lowest rounded-xl text-card-title text-on-surface placeholder:text-outline placeholder:font-normal shadow-sm border-[1.5px] border-outline-variant transition-all",
            "focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/40",
            className
          )}
          {...props}
        />
        {hint && (
          <p className="text-label-caption text-on-surface-variant">{hint}</p>
        )}
      </div>
    );
  }
);
TextField.displayName = "TextField";