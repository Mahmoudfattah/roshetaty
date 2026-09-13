/**
 * بتصغّر وتضغط أي صورة قبل ما نحفظها، باستخدام Canvas API بس (من غير مكتبات خارجية للضغط نفسه).
 * بتشتغل بالكامل في المتصفح — الصورة الأصلية ما بتتبعتش لأي حتة.
 */
export async function compressImage(
  file: File,
  options?: { maxDimension?: number; quality?: number }
): Promise<File> {
  const maxDimension = options?.maxDimension ?? 1600;
  const quality = options?.quality ?? 0.82;

  let workingFile = file;

  // صور الآيفون بتيجي غالبًا بصيغة HEIC/HEIF، ومعظم متصفحات الأندرويد (Chrome خصوصًا)
  // مش بتقدر تفكها خالص لا بـ createImageBitmap ولا حتى تعرضها في <img> عادي.
  // لازم نحوّلها بأنفسنا لـ JPEG قبل أي حاجة تانية.
  const isHeic =
    /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);

  if (isHeic) {
    try {
      const heic2any = (await import("heic2any")).default;
      const converted = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.9,
      });
      const blob = Array.isArray(converted) ? converted[0] : converted;
      workingFile = new File(
        [blob],
        file.name.replace(/\.\w+$/, "") + ".jpg",
        { type: "image/jpeg" }
      );
    } catch (error) {
      console.error("HEIC conversion failed:", error);
      // لو التحويل فشل، على الأقل نرجّع الملف الأصلي عشان الحفظ ما يقفش خالص،
      // حتى لو المعاينة/العرض هيفشلوا لاحقًا لنفس صيغة HEIC.
      return file;
    }
  }

  // GIF المتحركة أو الملفات الصغيرة أصلًا مفيش داعي نضغطها
  if (workingFile.type === "image/gif" || workingFile.size < 150 * 1024) {
    return workingFile;
  }

  try {
    const bitmap = await createImageBitmap(workingFile);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const targetWidth = Math.round(bitmap.width * scale);
    const targetHeight = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return workingFile;
    }

    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob || blob.size >= workingFile.size) return workingFile;

    const newName = workingFile.name.replace(/\.\w+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch (error) {
    console.error("Image compression failed:", error);
    // أي فشل في الضغط — نرجع الملف (المحوّل لو كان HEIC) بدل ما نوقف الحفظ
    return workingFile;
  }
}