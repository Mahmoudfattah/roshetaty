"use client";

import { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** أقصى عرض للمودال */
  maxWidthClassName?: string;
}

export function Modal({ open, onClose, children, maxWidthClassName = "max-w-lg" }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`bg-surface-container-lowest w-full ${maxWidthClassName} rounded-2xl p-6 shadow-2xl flex flex-col gap-5`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}