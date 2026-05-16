import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  back?: { href: string; label: string };
  action?: ReactNode;
  titleSuffix?: ReactNode;
};

export function PageHeader({
  title,
  subtitle,
  back,
  action,
  titleSuffix,
}: Props) {
  return (
    <header className="mb-7 sm:mb-10">
      {back ? (
        <Link href={back.href} className="back-link mb-4">
          <ChevronLeft size={16} strokeWidth={2} />
          <span>{back.label}</span>
        </Link>
      ) : null}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight">
            {title}
          </h1>
          {titleSuffix ? <span className="shrink-0">{titleSuffix}</span> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {subtitle ? (
        <p className="mt-2 text-sm text-ink-500 leading-relaxed">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
