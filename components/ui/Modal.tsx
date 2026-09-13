"use client";

import { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** أقصى عرض للمودال */
  maxWidthClassName?: string;
}

export function Modal({
  open,
  onClose,
  children,
  maxWidthClassName = "max-w-lg",
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-60 flex items-start sm:items-center justify-center overflow-y-auto px-4 pt-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]"
      onClick={onClose}
    >
      <div
        className={`bg-surface-container-lowest w-full ${maxWidthClassName} max-h-[calc(100dvh-7rem-env(safe-area-inset-bottom,0px))] overflow-y-auto rounded-2xl p-5 shadow-2xl flex flex-col gap-4`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
