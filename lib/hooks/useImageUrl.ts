"use client";

import { useEffect, useState } from "react";
import { getImageUrl } from "@/lib/db";

/**
 * بيرجع رابط object URL قابل للعرض لصورة محفوظة في IndexedDB،
 * وبيعمل revoke تلقائي للرابط لما الـ component يتشال أو الـ imageId يتغير.
 *
 * استخدام: const url = useImageUrl(prescription.imageBlobId);
 */
export function useImageUrl(imageId?: string): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    if (imageId) {
      getImageUrl(imageId).then((resolved) => {
        if (cancelled) {
          if (resolved) URL.revokeObjectURL(resolved);
          return;
        }
        objectUrl = resolved;
        setUrl(resolved);
      });
    } else {
      const resetUrl = () => setUrl(null);
      queueMicrotask(resetUrl);
    }

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageId]);

  return url;
}