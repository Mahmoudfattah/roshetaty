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

  // GIF المتحركة لا نعيد ترميزها حتى لا نفقد الحركة.
  if (file.type === "image/gif") {
    return file;
  }

  let objectUrl: string | null = null;
  let bitmap: ImageBitmap | null = null;
  let imageElement: HTMLImageElement | null = null;

  try {
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      // بعض متصفحات الهاتف لا تدعم createImageBitmap جيدًا، فنستخدم img.
      objectUrl = URL.createObjectURL(file);
      imageElement = await new Promise<HTMLImageElement>((resolve, reject) => {
        const element = new window.Image();
        element.onload = () => resolve(element);
        element.onerror = () => reject(new Error("Image could not be decoded"));
        element.src = objectUrl as string;
      });
    }

    const source = bitmap ?? imageElement;
    if (!source) return file;
    const sourceWidth = bitmap?.width ?? imageElement?.naturalWidth ?? 0;
    const sourceHeight = bitmap?.height ?? imageElement?.naturalHeight ?? 0;
    const scale = Math.min(
      1,
      maxDimension / Math.max(sourceWidth, sourceHeight),
    );
    const targetWidth = Math.round(sourceWidth * scale);
    const targetHeight = Math.round(sourceHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return file;
    }

    ctx.drawImage(source, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob) return file;

    const newName = file.name.replace(/\.\w+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    // أي فشل في القراءة أو التحويل — نرجع الملف الأصلي بدل ما نوقف الحفظ.
    return file;
  } finally {
    bitmap?.close();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}
