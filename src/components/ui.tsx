import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "./icons";

const isExternal = (href: string) => /^(https?:|tel:|mailto:)/.test(href);

export function Button({
  href,
  children,
  variant = "accent",
  size,
  arrow,
  className = "",
  icon,
}: {
  href: string;
  children: ReactNode;
  variant?: "accent" | "gray" | "wa";
  size?: "sm";
  arrow?: boolean;
  className?: string;
  icon?: ReactNode;
}) {
  const cls = `btn btn-${variant} ${size === "sm" ? "btn-sm" : ""} ${className}`;
  const content = (
    <>
      {icon}
      {children}
      {arrow && <ArrowRight className="arrow" width={18} height={18} />}
    </>
  );
  if (isExternal(href)) {
    const newTab = href.startsWith("http");
    return (
      <a href={href} className={cls} {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {content}
    </Link>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  if (isExternal(href)) {
    return (
      <a href={href} className="link inline-flex items-center gap-1" target="_blank" rel="noopener noreferrer">
        {children}
        <ArrowUpRight width={16} height={16} />
      </a>
    );
  }
  return (
    <Link href={href} className="link inline-flex items-center gap-1">
      {children}
      <ArrowRight width={16} height={16} />
    </Link>
  );
}

export function Section({
  id,
  tone = "plain",
  children,
  className = "",
  labelledBy,
}: {
  id?: string;
  tone?: "plain" | "grouped";
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`${tone === "grouped" ? "section-grouped bg-bg-grouped" : "section-plain bg-bg"} py-16 md:py-24 ${className}`}
    >
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6">{children}</div>
    </section>
  );
}

export function SectionHeader({
  id,
  eyebrow,
  title,
  lead,
  action,
}: {
  id?: string;
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="reveal mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
      <div className="max-w-[680px]">
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h2 id={id} className="h2">
          {title}
        </h2>
        {lead && <p className="mt-3 text-text-2">{lead}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CheckList({ items, className = "" }: { items: ReactNode[]; className?: string }) {
  return (
    <ul className={`check-list space-y-2.5 ${className}`}>
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
