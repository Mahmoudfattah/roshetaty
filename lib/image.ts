/**
 * بتصغّر وتضغط أي صورة قبل ما نحفظها، باستخدام Canvas API بس (من غير مكتبات خارجية).
 * بتشتغل بالكامل في المتصفح — الصورة الأصلية ما بتتبعتش لأي حتة.
 */
export async function compressImage(
  file: File,
  options?: { maxDimension?: number; quality?: number },
): Promise<File> {
  const maxDimension = options?.maxDimension ?? 1600;
  const quality = options?.quality ?? 0.82;

  // GIF المتحركة أو الملفات الصغيرة أصلًا مفيش داعي نضغطها
  if (file.type === "image/gif" || file.size < 150 * 1024) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      maxDimension / Math.max(bitmap.width, bitmap.height),
    );
    const targetWidth = Math.round(bitmap.width * scale);
    const targetHeight = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }

    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.\w+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    // أي فشل في الضغط — نرجع الملف الأصلي بدل ما نوقف الحفظ
    return file;
  }
}
