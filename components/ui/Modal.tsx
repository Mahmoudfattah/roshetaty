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
      className="fixed inset-0 z-60 flex items-center justify-center overflow-y-auto bg-inverse-surface/40 px-4 py-[calc(1rem+env(safe-area-inset-top,0px))] pb-[calc(1rem+env(safe-area-inset-bottom,0px))] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`flex w-full ${maxWidthClassName} max-h-[calc(100dvh-2rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] flex-col gap-4 overflow-y-auto rounded-2xl bg-surface-container-lowest p-5 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
