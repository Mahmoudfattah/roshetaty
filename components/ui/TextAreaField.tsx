import { TextareaHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ label, hint, id, className, rows = 3, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
      <div className="flex flex-col gap-2 w-full">
        <label htmlFor={inputId} className="text-label-prominent text-on-surface">
          {label}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={cn(
            "w-full p-4 bg-surface-container-lowest rounded-xl text-body-default text-on-surface placeholder:text-outline placeholder:font-normal shadow-sm border-[1.5px] border-outline-variant resize-none transition-all",
            "focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/40",
            className
          )}
          {...props}
        />
        {hint && <p className="text-label-caption text-on-surface-variant">{hint}</p>}
      </div>
    );
  }
);
TextAreaField.displayName = "TextAreaField";