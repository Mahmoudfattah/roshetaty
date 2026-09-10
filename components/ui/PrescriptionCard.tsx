import Link from "next/link";
import Image from "next/image";
import Icon  from "./Icon";

interface PrescriptionCardProps {
  href: string;
  /** التاريخ منسق جاهز، زي "١٤ يناير ٢٠٢٥" */
  date: string;
  doctorName?: string;
  /** لو null/undefined (لسه بيتحمل من IndexedDB) بيظهر أيقونة بدل الصورة */
  thumbnailSrc?: string | null;
}

/** كارت روشتة واحدة في قائمة روشتات الشخص */
export function PrescriptionCard({
  href,
  date,
  doctorName,
  thumbnailSrc,
}: PrescriptionCardProps) {
  return (
    <Link
      href={href}
      className="group block w-full bg-surface-container-lowest rounded-xl shadow-sm p-card-pad transition-all active:scale-[0.99] hover:shadow-md hover:bg-surface-container-low/60"
    >
      <div className="flex items-center justify-between gap-touch-gap">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-14 h-14 rounded-xl bg-surface-container-low shadow-sm overflow-hidden flex-shrink-0 relative flex items-center justify-center">
            {thumbnailSrc ? (
              <Image
                src={thumbnailSrc}
                alt={`روشتة ${date}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
                sizes="56px"
              />
            ) : (
              <Icon name="description" className="text-[26px] text-outline" />
            )}
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <span className="text-card-title text-on-surface truncate leading-tight">
              {date}
            </span>
            {doctorName && (
              <span className="text-body-muted text-on-surface-variant truncate mt-0.5">
                {doctorName}
              </span>
            )}
          </div>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant group-hover:text-primary-container transition-colors flex-shrink-0">
          <Icon name="chevron_left" className="text-[24px]" />
        </div>
      </div>
    </Link>
  );
}

/** فاصل السنة فوق كل مجموعة روشتات، زي "٢٠٢٥ ————" */
export function YearDivider({ year }: { year: string | number }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-2">
      <Icon name="calendar_month" className="text-[20px] text-primary-container" />
      <h3 className="text-card-title text-primary-container">{year}</h3>
      <div className="flex-1 h-[2px] bg-surface-container rounded-full" />
    </div>
  );
}