import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import  Icon  from "./Icon";

interface ListRowProps {
  href: string;
  title: string;
  subtitle?: string;
  /** أيقونة القسم (SectionIcon) أو صورة الشخص (PersonAvatar) */
  leading: ReactNode;
  /** شيبة اختيارية قبل السهم، زي "٣ روشتات" */
  trailing?: ReactNode;
}

/** صف قابل للضغط بيتستخدم في شاشة الأقسام وشاشة الأشخاص جوه القسم */
export function ListRow({ href, title, subtitle, leading, trailing }: ListRowProps) {
  return (
    <Link
      href={href}
      className="group relative flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl shadow-sm active:scale-[0.98] transition-transform duration-150 min-h-[68px]"
    >
      <div className="flex items-center gap-4 min-w-0">
        {leading}
        <div className="flex flex-col min-w-0">
          <span className="text-card-title text-on-surface truncate">{title}</span>
          {subtitle && (
            <span className="text-body-muted text-on-surface-variant truncate">
              {subtitle}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {trailing}
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant group-hover:text-primary-container transition-colors">
          <Icon name="chevron_left" className="text-[24px]" />
        </div>
      </div>
    </Link>
  );
}

/** مربع أيقونة القسم الطبي (باطنة، عيون، عظام...) */
export function SectionIcon({ icon }: { icon: string }) {
  return (
    <div className="w-14 h-14 rounded-xl bg-surface-container-low flex items-center justify-center text-primary-container group-hover:bg-primary group-hover:text-on-primary transition-colors flex-shrink-0">
      <Icon name={icon} className="text-[30px]" />
    </div>
  );
}

/** صورة دائرية لفرد العائلة — لو مفيش صورة محفوظة بيظهر حرف الاسم الأول بدالها */
export function PersonAvatar({
  src,
  alt,
  size = "md",
}: {
  src?: string | null;
  alt: string;
  size?: "sm" | "md";
}) {
  const dimension = size === "sm" ? "w-12 h-12" : "w-14 h-14";

  if (!src) {
    return (
      <div
        className={`${dimension} rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-sm flex-shrink-0 text-card-title font-bold`}
      >
        {alt.trim().charAt(0)}
      </div>
    );
  }
  return (
    <div className={`${dimension} rounded-full overflow-hidden bg-surface-container-high shadow-sm flex-shrink-0 relative`}>
      <Image src={src} alt={alt} fill className="object-cover" sizes="56px" />
    </div>
  );
}